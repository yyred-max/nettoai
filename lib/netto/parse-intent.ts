import type { NettoIntent } from "./intent";

/**
 * PARSE USER INTENT — deterministic, TANPA LLM
 *
 * Parser ini adalah boundary antara raw user input dan
 * trusted NettoIntent.
 *
 * LLM TIDAK boleh menghasilkan atau mengubah NettoIntent.
 *
 * Format yang didukung:
 *
 *   Send <amount> <TOKEN> to <recipient>
 *
 * Contoh:
 *
 *   Send 50 USDT to 0x742d35Cc6634C0532925a3b844Bc9e7598f0b0d8
 *
 * Input ambigu / mengandung lebih dari satu instruksi transfer
 * ditolak daripada ditebak.
 */

const SEND_PATTERN =
    /send\s+(\d+(?:\.\d+)?)\s+([a-zA-Z]+)\s+to\s+([a-zA-Z0-9_]+)/gi;

export type ParseResult =
    | {
        success: true;
        intent: NettoIntent;  
        matchedText: string;
    }
    | {
        success: false;
        error: string;
    };

export function parseUserIntent(
    userInput: string,
    chainId: number = 97
): ParseResult {
    if (!userInput || !userInput.trim()) {
        return {
            success: false,
            error: "User input kosong.",
        };
    }

    if (!Number.isInteger(chainId) || chainId <= 0) {
        return {
            success: false,
            error: `Chain ID tidak valid: ${chainId}`,
        };
    }

    const matches = [...userInput.matchAll(SEND_PATTERN)];

    if (matches.length === 0) {
        return {
            success: false,
            error:
                'Tidak bisa mengekstrak instruksi. Format yang dikenali: "Send <amount> <TOKEN> to <recipient>"',
        };
    }

    /**
     * Security rule:
     *
     * Jangan memilih instruksi pertama secara diam-diam jika
     * user memberikan lebih dari satu transfer instruction.
     */
    if (matches.length > 1) {
        return {
            success: false,
            error:
                "Ambiguous transaction request: ditemukan lebih dari satu instruksi transfer.",
        };
    }

    const match = matches[0];

    const matchedText = match[0];
    const amountStr = match[1];
    const token = match[2];
    const recipient = match[3];

    // Validasi recipient harus berupa alamat Ethereum
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/i;
    if (!ethereumAddressRegex.test(recipient)) {
        return {
            success: false,
            error: `Recipient bukan alamat Ethereum yang valid: "${recipient}". Harus format 0x + 40 karakter hex.`,
        };
    }

    const amount = Number(amountStr);

    if (!Number.isFinite(amount) || amount <= 0) {
        return {
            success: false,
            error: `Amount tidak valid: ${amountStr}`,
        };
    }

    if (amount > Number.MAX_SAFE_INTEGER) {
        return {
            success: false,
            error: `Amount terlalu besar: ${amountStr}`,
        };
    }

    const intent: NettoIntent = {
        recipient,
        maxAmount: amount,
        token: token.toUpperCase(),
        chainId,
    };

    // ✅ FREEZE untuk mencegah mutasi
    return {
        success: true,
        intent: Object.freeze(intent),
        matchedText,
    };
}