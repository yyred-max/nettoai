import type { NettoIntent } from "./intent";

export type TransferAction = {
    recipient: string;
    amount: number;
    token: string;
    chainId: number; // ✅ Tambahkan chainId
};

// ✅ Enum kode pelanggaran
export enum ViolationCode {
    RECIPIENT_MISMATCH = "RECIPIENT_MISMATCH",
    AMOUNT_NOT_FINITE = "AMOUNT_NOT_FINITE",
    AMOUNT_INVALID_ZERO = "AMOUNT_INVALID_ZERO",
    AMOUNT_EXCEEDS_LIMIT = "AMOUNT_EXCEEDS_LIMIT",
    TOKEN_MISMATCH = "TOKEN_MISMATCH",
    CHAIN_ID_INVALID = "CHAIN_ID_INVALID",      // ✅ baru
    CHAIN_ID_MISMATCH = "CHAIN_ID_MISMATCH",    // ✅ baru
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
    action: TransferAction
): PolicyResult {
    const violations: PolicyViolation[] = [];

    // --- Recipient ---
    if (
        action.recipient.toLowerCase() !==
        intent.recipient.toLowerCase()
    ) {
        violations.push({
            code: ViolationCode.RECIPIENT_MISMATCH,
            message: `Recipient mismatch: expected ${intent.recipient}, got ${action.recipient}`,
        });
    }

    // --- Amount (finite check first) ---
    if (!Number.isFinite(action.amount)) {
        violations.push({
            code: ViolationCode.AMOUNT_NOT_FINITE,
            message: `Amount harus berupa angka finite, got ${action.amount}`,
        });
        // Early return: comparison lain tidak bermakna untuk NaN/Infinity
        return {
            allowed: false,
            violations,
        };
    }

    if (action.amount <= 0) {
        violations.push({
            code: ViolationCode.AMOUNT_INVALID_ZERO,
            message: `Amount must be greater than 0, got ${action.amount}`,
        });
    }

    if (action.amount > intent.maxAmount) {
        violations.push({
            code: ViolationCode.AMOUNT_EXCEEDS_LIMIT,
            message: `Amount exceeds limit: maximum ${intent.maxAmount}, got ${action.amount}`,
        });
    }

    // --- Token ---
    if (
        action.token.toLowerCase() !==
        intent.token.toLowerCase()
    ) {
        violations.push({
            code: ViolationCode.TOKEN_MISMATCH,
            message: `Token mismatch: expected ${intent.token}, got ${action.token}`,
        });
    }

    // --- Chain ID validation (dua langkah) ---
    // Step 1: Validasi tipe/rentang (harus integer positif)
    if (!Number.isInteger(action.chainId) || action.chainId <= 0) {
        violations.push({
            code: ViolationCode.CHAIN_ID_INVALID,
            message: `Invalid chain ID: ${action.chainId}. Must be a positive integer.`,
        });
    } else {
        // Step 2: Bandingkan dengan intent
        if (action.chainId !== intent.chainId) {
            violations.push({
                code: ViolationCode.CHAIN_ID_MISMATCH,
                message: `Chain ID mismatch: expected ${intent.chainId}, got ${action.chainId}`,
            });
        }
    }

    return {
        allowed: violations.length === 0,
        violations,
    };
}