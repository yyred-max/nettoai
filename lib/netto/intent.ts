import { z } from "zod";

export const intentSchema = z.object({
    // ✅ FIX: Validasi alamat Ethereum dengan regex
    // Format: 0x + 40 karakter hex (a-f, A-F, 0-9)
    // Case-insensitive (i flag) untuk mendukung checksum EIP-55
    recipient: z
        .string()
        .regex(
            /^0x[a-fA-F0-9]{40}$/,
            "Invalid Ethereum address: must be 0x followed by 40 hexadecimal characters"
        ),
    maxAmount: z.number().positive(),
    token: z.string().min(1),
    chainId: z.number().int().positive(),
});

export type NettoIntent = z.infer<typeof intentSchema>;

// intent.ts
export function createIntent(input: NettoIntent): NettoIntent {
    return Object.freeze(intentSchema.parse(input));
}