// lib/store/decisionStore.ts
//
// STORAGE BACKEND: Upstash Redis (HTTP-based, serverless-safe)
//
// Kenapa Redis, bukan in-memory Map?
// - Next.js di Vercel pakai serverless lambda: tiap request bisa
//   mendarat di instance BERBEDA. In-memory singleton (Map) hanya
//   terlihat dalam satu instance → decisionStore.get() dari instance
//   lain selalu null → "Decision not found" yang intermiten & sulit
//   di-debug.
// - Upstash Redis adalah key-value store yang persisten di luar proses
//   Node, sehingga data bisa dibaca instance mana pun yang menerima
//   request berikutnya.
//
// ENV yang diperlukan (tambahkan ke .env.local DAN Vercel project settings):
//   UPSTASH_REDIS_REST_URL=https://<...>.upstash.io
//   UPSTASH_REDIS_REST_TOKEN=<token>
//
// Setup gratis: https://console.upstash.com → Create Database → REST API
//
// ATOMIC LOCKING (Gap #1 — Replay Attack):
// Kita pakai perintah Redis SET NX (set-if-not-exists) untuk mengunci
// sebuah decisionId sebelum eksekusi. Cara kerjanya:
//   SET lock:<decisionId> 1 EX 30 NX
// Jika dua request datang bersamaan dengan decisionId yang sama, hanya
// SATU yang berhasil SET NX → request kedua langsung ditolak dengan 409.
// Ini menggantikan pola "cek status lalu set" yang tidak atomic.

import { Redis } from '@upstash/redis';

// ─── Redis client (lazy-initialized) ──────────────────────────────────────────

let _redis: Redis | null = null;

function getRedis(): Redis {
    if (_redis) return _redis;

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        throw new Error(
            'Missing Upstash Redis credentials.\n' +
            'Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.local (dan Vercel project settings).\n' +
            'Setup gratis di: https://console.upstash.com'
        );
    }

    _redis = new Redis({ url, token });
    return _redis;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type DecisionStatus = 'pending' | 'executing' | 'executed' | 'failed' | 'broadcast_pending';

export type DecisionEntry = {
    intent: any;
    action: any;
    provenance: any;
    userInput: string;
    status: DecisionStatus;
    createdAt: number;
    /**
     * Di-set segera setelah broadcastTransfer() berhasil, SEBELUM awaitReceipt().
     * Dengan begini, jika function mati saat menunggu receipt, txHash tidak hilang.
     * Status 'broadcast_pending' + txHash yang tersimpan memungkinkan operator
     * (atau user) men-trace status tx langsung ke block explorer tanpa retry buta.
     */
    txHash?: string;
    broadcastedAt?: number;
    attemptedNonce?: number;
};

// TTL entry di Redis = 5 menit (dalam detik, bukan ms — Redis TTL pakai detik)
const TTL_SECONDS = 5 * 60;

// Prefix kunci agar tidak tabrakan dengan key lain di database Redis yang sama
const KEY_PREFIX = 'netto:decision:';
const LOCK_PREFIX = 'netto:lock:';

function entryKey(decisionId: string): string {
    return `${KEY_PREFIX}${decisionId}`;
}

function lockKey(decisionId: string): string {
    return `${LOCK_PREFIX}${decisionId}`;
}

// ─── DecisionStore ────────────────────────────────────────────────────────────

export const decisionStore = {
    /**
     * Simpan decision baru dengan TTL 5 menit.
     * Selalu menyimpan dengan status 'pending'.
     */
    async set(
        decisionId: string,
        entry: Omit<DecisionEntry, 'createdAt' | 'status'>
    ): Promise<void> {
        const data: DecisionEntry = {
            ...entry,
            status: 'pending',
            createdAt: Date.now(),
        };
        // EX = expire in seconds
        await getRedis().set(entryKey(decisionId), JSON.stringify(data), { ex: TTL_SECONDS });
    },

    /**
     * Ambil decision.
     * Redis TTL menangani expiry secara otomatis — jika key tidak ada,
     * berarti entry belum pernah ada ATAU sudah kedaluwarsa.
     */
    async get(decisionId: string): Promise<DecisionEntry | null> {
        const raw = await getRedis().get<string>(entryKey(decisionId));
        if (!raw) return null;
        try {
            return JSON.parse(raw) as DecisionEntry;
        } catch {
            // Data korup — anggap tidak ada
            return null;
        }
    },

    /**
     * ATOMIC LOCK untuk mencegah replay / double-submit.
     *
     * Menggunakan SET NX (set-if-not-exists):
     * - Jika lock berhasil di-set → kembalikan true  → lanjut eksekusi
     * - Jika lock sudah ada       → kembalikan false → tolak request (409)
     *
     * Lock otomatis expire dalam 30 detik (guard untuk kasus crash
     * di tengah eksekusi — mencegah lock permanen).
     *
     * Durasi eksekusi transaksi blockchain (simulateContract + writeContract +
     * waitForTransactionReceipt) biasanya 5–20 detik di BSC Testnet,
     * jadi 30 detik cukup longgar tanpa risiko lock permanen.
     */
    async acquireLock(decisionId: string): Promise<boolean> {
        // SET NX: kembalikan 'OK' jika berhasil, null jika key sudah ada
        const result = await getRedis().set(
            lockKey(decisionId),
            '1',
            { nx: true, ex: 30 }
        );
        return result === 'OK';
    },

    /**
     * Hapus lock setelah eksekusi selesai (berhasil maupun gagal).
     * Status entry tetap di-update terpisah via updateStatus.
     */
    async releaseLock(decisionId: string): Promise<void> {
        await getRedis().del(lockKey(decisionId));
    },

    /**
     * Update status decision (pending → executing → executed | failed).
     * Mempertahankan TTL yang sudah ada — KEEPTTL agar tidak di-reset.
     */
    async updateStatus(decisionId: string, status: DecisionStatus): Promise<boolean> {
        const entry = await this.get(decisionId);
        if (!entry) return false;
        entry.status = status;
        // Hitung sisa TTL agar tidak reset penuh
        const ttlRemaining = await getRedis().ttl(entryKey(decisionId));
        const ex = ttlRemaining > 0 ? ttlRemaining : TTL_SECONDS;
        await getRedis().set(entryKey(decisionId), JSON.stringify(entry), { ex });
        return true;
    },

    /**
     * Simpan txHash segera setelah broadcast berhasil, sebelum menunggu receipt.
     *
     * Status diubah ke 'broadcast_pending' — berbeda dari 'executing' sehingga
     * jelas bahwa tx sudah ada di mempool tapi belum dikonfirmasi.
     *
     * Jika fungsi serverless mati setelah ini tapi sebelum 'executed' ditulis,
     * operator bisa melihat txHash di Redis dan memverifikasi di block explorer
     * tanpa perlu retry yang berpotensi double-spend.
     */
    async setBroadcasted(decisionId: string, txHash: string): Promise<boolean> {
        const entry = await this.get(decisionId);
        if (!entry) return false;
        entry.status = 'broadcast_pending';
        entry.txHash = txHash;
        entry.broadcastedAt = Date.now();
        const ttlRemaining = await getRedis().ttl(entryKey(decisionId));
        const ex = ttlRemaining > 0 ? ttlRemaining : TTL_SECONDS;
        await getRedis().set(entryKey(decisionId), JSON.stringify(entry), { ex });
        return true;
    },

    /**
     * Checkpoint nonce sebelum memanggil writeContract ke node.
     * Mengamankan edge-case dimana function terhenti tepat setelah tx terkirim
     * tapi sebelum mempool mengembalikan txHash.
     */
    async setAttemptedNonce(decisionId: string, nonce: number): Promise<boolean> {
        const entry = await this.get(decisionId);
        if (!entry) return false;
        entry.attemptedNonce = nonce;
        const ttlRemaining = await getRedis().ttl(entryKey(decisionId));
        const ex = ttlRemaining > 0 ? ttlRemaining : TTL_SECONDS;
        await getRedis().set(entryKey(decisionId), JSON.stringify(entry), { ex });
        return true;
    },

    /**
     * Hapus decision secara eksplisit (opsional, karena Redis TTL sudah menangani).
     */
    async delete(decisionId: string): Promise<void> {
        await getRedis().del(entryKey(decisionId));
        await getRedis().del(lockKey(decisionId));
    },
};