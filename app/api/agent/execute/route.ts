// app/api/agent/execute/route.ts
//
// ALUR EKSEKUSI (dengan perlindungan replay + txHash checkpoint):
//
//  ┌─────────────────────────────────────────────────────────────┐
//  │ 1. GET entry dari Redis → cek exists                        │
//  │ 2. Cek status === 'pending' (fast-path sebelum lock)        │
//  │ 3. ACQUIRE LOCK (SET NX, TTL=30s) → 409 jika sudah terkunci│
//  │────────── zona terlindungi dari concurrency ────────────────│
//  │ 4. Update status → 'executing'                              │
//  │ 5. broadcastTransfer() — bisa THROW (simulateContract)      │
//  │    → jika throw: status → 'failed', release lock, 500       │
//  │ 6. CHECKPOINT: setBroadcasted(txHash) → status 'broadcast_  │
//  │    pending'. Kalau function mati di sini, txHash tidak       │
//  │    hilang. Retry bisa dicegah karena status != 'pending'.    │
//  │ 7. awaitReceipt(txHash) — TIDAK PERNAH THROW                │
//  │    → confirmed:  status → 'executed'                        │
//  │    → unconfirmed: status → 'failed', txHash tetap tersimpan │
//  │ 8. Release lock                                              │
//  └─────────────────────────────────────────────────────────────┘
//
// KENAPA STATUS 'broadcast_pending' PENTING?
// Jika Vercel serverless function di-kill saat awaitReceipt() sedang
// berjalan (batas waktu 10–60 detik tergantung plan), entry di Redis
// tetap tersimpan dengan status 'broadcast_pending' + txHash.
// User mendapat error, tapi TIDAK bisa retry — karena status bukan
// 'pending' lagi. Ini mencegah double-send. Operator bisa verify
// txHash di BscScan dan update status secara manual jika perlu.
//
// BATASAN YANG DISADARI (bukan bug, tapi trade-off):
// Tidak ada solved 100% untuk "tx broadcast tapi receipt timeout".
// Solusi production-grade memerlukan background job (cron/queue)
// yang polling status tx secara async. Untuk skala NettoAI saat ini,
// txHash checkpoint + status 'broadcast_pending' sudah cukup untuk
// mencegah double-send sambil tetap memberikan visibilitas.

import { NextRequest, NextResponse } from 'next/server';
import { decisionStore } from '@/lib/store/decisionStore';
import { broadcastTransfer, awaitReceipt } from '@/lib/blockchain/executor';

export async function POST(req: NextRequest) {
    let decisionId: string | undefined;
    let lockAcquired = false;

    try {
        const body = await req.json();
        decisionId = body.decisionId;

        if (!decisionId || typeof decisionId !== 'string') {
            return NextResponse.json(
                { error: 'decisionId is required.' },
                { status: 400 }
            );
        }

        // ── 1. Ambil decision dari Redis ──────────────────────────────────
        const entry = await decisionStore.get(decisionId);
        if (!entry) {
            return NextResponse.json(
                { error: 'Decision not found or expired. Please re-run NettoAI check.' },
                { status: 404 }
            );
        }

        // ── 2. Cek status (fast-path sebelum lock) ────────────────────────
        // Tolak semua status selain 'pending' sebelum menyentuh lock.
        // Ini bukan pengganti lock — lock tetap diperlukan untuk concurrency —
        // tapi mengurangi satu round-trip Redis pada kasus yang sudah jelas.
        if (entry.status !== 'pending') {
            const errorMessages: Partial<Record<string, string>> = {
                executing:         'Decision is currently being executed. Please wait.',
                broadcast_pending: `Transaction already broadcast. TxHash: ${entry.txHash ?? 'unknown'}. Check block explorer for confirmation status.`,
                executed:          'Decision already executed. Cannot execute again.',
                failed:            'Decision previously failed. Please re-run NettoAI check.',
            };
            return NextResponse.json(
                { error: errorMessages[entry.status] ?? 'Decision is not in a pending state.' },
                { status: 409 }
            );
        }

        // ── 3. Atomic lock (SET NX, TTL=30s) ─────────────────────────────
        // Hanya satu request yang menang. Lock expire otomatis setelah 30 detik
        // sebagai guard terhadap crash/kill di tengah eksekusi.
        const locked = await decisionStore.acquireLock(decisionId);
        if (!locked) {
            return NextResponse.json(
                { error: 'Decision is currently being processed. Please wait and try again.' },
                { status: 409 }
            );
        }
        lockAcquired = true;

        // ── 4. Status → 'executing' ───────────────────────────────────────
        await decisionStore.updateStatus(decisionId, 'executing');

        // ── 5. FASE 1: Broadcast ke blockchain ────────────────────────────
        // broadcastTransfer() BISA throw (simulateContract atau writeContract gagal).
        // Jika throw sebelum tx masuk mempool → status 'failed', tidak ada tx di chain.
        const broadcast = await broadcastTransfer(entry.action, async (nonce) => {
            if (decisionId) {
                await decisionStore.setAttemptedNonce(decisionId, nonce);
            }
        });

        if (!broadcast.broadcasted) {
            // TX tidak pernah sampai ke network — aman untuk set 'failed'
            await decisionStore.updateStatus(decisionId, 'failed');
            await decisionStore.releaseLock(decisionId);
            lockAcquired = false;
            return NextResponse.json(
                { error: `Broadcast failed: ${broadcast.error}` },
                { status: 500 }
            );
        }

        // ── 6. CHECKPOINT: simpan txHash sebelum menunggu receipt ─────────
        // Ini adalah titik point-of-no-return:
        // tx sudah di mempool. Status jadi 'broadcast_pending'.
        // Jika function mati setelah baris ini, txHash tetap ada di Redis
        // dan status bukan 'pending' → retry akan ditolak (409) bukan diloloskan.
        const txHash = broadcast.txHash;
        await decisionStore.setBroadcasted(decisionId, txHash);

        // ── 7. FASE 2: Tunggu receipt ─────────────────────────────────────
        // awaitReceipt() TIDAK PERNAH THROW — selalu return ReceiptResult.
        const receipt = await awaitReceipt(txHash);

        if (receipt.confirmed) {
            await decisionStore.updateStatus(decisionId, 'executed');
        } else {
            // TX mungkin sudah masuk blockchain (timeout di receipt),
            // mungkin juga benar-benar revert. txHash sudah tersimpan.
            await decisionStore.updateStatus(decisionId, 'failed');
        }

        // ── 8. Release lock ───────────────────────────────────────────────
        await decisionStore.releaseLock(decisionId);
        lockAcquired = false;

        // ── 9. Response ───────────────────────────────────────────────────
        if (receipt.confirmed) {
            return NextResponse.json({
                status:  'EXECUTED',
                txHash:  receipt.txHash,
                block:   receipt.blockNumber.toString(), // bigint → string
                network: 'BSC Testnet',
            });
        } else {
            return NextResponse.json({
                status:  'FAILED',
                txHash:  receipt.txHash, // tetap kembalikan agar user bisa check explorer
                network: 'BSC Testnet',
                error:   receipt.error,
                note:    'Transaction may have been broadcast. Check BscScan with the txHash above before retrying.',
            }, { status: 500 });
        }

    } catch (error) {
        // Error tidak terduga (misal Redis down, JSON parse error, dsb).
        // Lock di-release jika sudah di-acquire — Redis DEL bersifat idempoten.
        if (lockAcquired && decisionId) {
            try {
                await decisionStore.releaseLock(decisionId);
            } catch {
                // Jangan tutup error aslinya
            }
        }

        console.error('[NettoAI] Execute error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: `Execution failed: ${message}` },
            { status: 500 }
        );
    }
}