import type { NettoIntent } from "./intent";

export type TransferAction = {
    recipient: string;
    amount: number;
    token: string;
    chainId: number;
};

// ═══════════════════════════════════════════════════════════════════
// 🛡️ GLOBAL SAFETY LIMITS — hard caps yang berlaku terlepas dari intent
// ═══════════════════════════════════════════════════════════════════
export const SAFETY_LIMITS = {
    /** Maksimum USDT per transaksi (tidak bisa dilampaui walau user minta) */
    MAX_AMOUNT_PER_TX: 1_000,
    /** Token yang diizinkan */
    ALLOWED_TOKENS: ["USDT"],
    /** Chain ID yang diizinkan (BSC Testnet) */
    ALLOWED_CHAIN_IDS: [97],
    /** Alamat berbahaya yang selalu diblokir */
    BLACKLISTED_ADDRESSES: [
        "0x0000000000000000000000000000000000000000",  // zero address
        "0x000000000000000000000000000000000000dead",  // dead address
        "0x000000000000000000000000000000000000dEaD",  // dead address (checksum)
    ],
};

// Enum kode pelanggaran
export enum ViolationCode {
    RECIPIENT_MISMATCH = "RECIPIENT_MISMATCH",
    AMOUNT_NOT_FINITE = "AMOUNT_NOT_FINITE",
    AMOUNT_INVALID_ZERO = "AMOUNT_INVALID_ZERO",
    AMOUNT_EXCEEDS_LIMIT = "AMOUNT_EXCEEDS_LIMIT",
    AMOUNT_EXCEEDS_GLOBAL_CAP = "AMOUNT_EXCEEDS_GLOBAL_CAP",   // ← BARU
    TOKEN_MISMATCH = "TOKEN_MISMATCH",
    TOKEN_NOT_ALLOWED = "TOKEN_NOT_ALLOWED",                     // ← BARU
    CHAIN_ID_INVALID = "CHAIN_ID_INVALID",
    CHAIN_ID_MISMATCH = "CHAIN_ID_MISMATCH",
    CHAIN_ID_NOT_ALLOWED = "CHAIN_ID_NOT_ALLOWED",               // ← BARU
    BLACKLISTED_RECIPIENT = "BLACKLISTED_RECIPIENT",             // ← BARU
    SELF_TRANSFER = "SELF_TRANSFER",                             // ← BARU
}

export type PolicyViolation = {
    code: ViolationCode;
    message: string;
};

export type PolicyResult = {
    allowed: boolean;
    violations: PolicyViolation[];
};

export function checkPolicy(
    intent: NettoIntent,
    action: TransferAction,
    /** Alamat wallet pengirim (opsional) — untuk deteksi self-transfer */
    senderAddress?: string
): PolicyResult {
    const violations: PolicyViolation[] = [];

    // ═══════════════════════════════════════════════════════════════
    // 1. RECIPIENT VALIDATION
    // ═══════════════════════════════════════════════════════════════

    // 1a. Recipient mismatch (action berbeda dari intent)
    if (action.recipient.toLowerCase() !== intent.recipient.toLowerCase()) {
        violations.push({
            code: ViolationCode.RECIPIENT_MISMATCH,
            message: `Recipient mismatch: expected ${intent.recipient}, got ${action.recipient}`,
        });
    }

    // 1b. Blacklisted recipient (zero address, dead address, dll)
    if (SAFETY_LIMITS.BLACKLISTED_ADDRESSES.some(
        (addr) => addr.toLowerCase() === action.recipient.toLowerCase()
    )) {
        violations.push({
            code: ViolationCode.BLACKLISTED_RECIPIENT,
            message: `Recipient ${action.recipient} is blacklisted. Transfer to this address would result in permanent loss.`,
        });
    }

    // 1c. Self-transfer (kirim ke diri sendiri)
    if (senderAddress && action.recipient.toLowerCase() === senderAddress.toLowerCase()) {
        violations.push({
            code: ViolationCode.SELF_TRANSFER,
            message: `Self-transfer detected: recipient ${action.recipient} is your own wallet. This is usually a mistake.`,
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // 2. AMOUNT VALIDATION
    // ═══════════════════════════════════════════════════════════════

    if (!Number.isFinite(action.amount)) {
        violations.push({
            code: ViolationCode.AMOUNT_NOT_FINITE,
            message: `Amount must be a finite number, got ${action.amount}`,
        });
        return { allowed: false, violations }; // early return
    }

    if (action.amount <= 0) {
        violations.push({
            code: ViolationCode.AMOUNT_INVALID_ZERO,
            message: `Amount must be greater than 0, got ${action.amount}`,
        });
    }

    // Amount vs intent limit
    if (action.amount > intent.maxAmount) {
        violations.push({
            code: ViolationCode.AMOUNT_EXCEEDS_LIMIT,
            message: `Amount exceeds intent limit: maximum ${intent.maxAmount}, got ${action.amount}`,
        });
    }

    // 🚨 Amount vs global cap (HARD CAP — tidak bisa dilampaui)
    if (action.amount > SAFETY_LIMITS.MAX_AMOUNT_PER_TX) {
        violations.push({
            code: ViolationCode.AMOUNT_EXCEEDS_GLOBAL_CAP,
            message: `Amount ${action.amount} ${action.token} exceeds global safety cap of ${SAFETY_LIMITS.MAX_AMOUNT_PER_TX} ${action.token} per transaction.`,
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // 3. TOKEN VALIDATION
    // ═══════════════════════════════════════════════════════════════

    if (action.token.toLowerCase() !== intent.token.toLowerCase()) {
        violations.push({
            code: ViolationCode.TOKEN_MISMATCH,
            message: `Token mismatch: expected ${intent.token}, got ${action.token}`,
        });
    }

    if (!SAFETY_LIMITS.ALLOWED_TOKENS.map(t => t.toLowerCase()).includes(action.token.toLowerCase())) {
        violations.push({
            code: ViolationCode.TOKEN_NOT_ALLOWED,
            message: `Token ${action.token} is not in the allowed list: [${SAFETY_LIMITS.ALLOWED_TOKENS.join(", ")}]`,
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // 4. CHAIN ID VALIDATION
    // ═══════════════════════════════════════════════════════════════

    if (!Number.isInteger(action.chainId) || action.chainId <= 0) {
        violations.push({
            code: ViolationCode.CHAIN_ID_INVALID,
            message: `Invalid chain ID: ${action.chainId}. Must be a positive integer.`,
        });
    } else {
        if (action.chainId !== intent.chainId) {
            violations.push({
                code: ViolationCode.CHAIN_ID_MISMATCH,
                message: `Chain ID mismatch: expected ${intent.chainId}, got ${action.chainId}`,
            });
        }
        if (!SAFETY_LIMITS.ALLOWED_CHAIN_IDS.includes(action.chainId)) {
            violations.push({
                code: ViolationCode.CHAIN_ID_NOT_ALLOWED,
                message: `Chain ID ${action.chainId} is not in the allowed list: [${SAFETY_LIMITS.ALLOWED_CHAIN_IDS.join(", ")}]`,
            });
        }
    }

    return {
        allowed: violations.length === 0,
        violations,
    };
}