// lib/blockchain/executor.ts
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createPublicClient, createWalletClient, http, parseUnits } from 'viem';
import { bscTestnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import type { TransferAction } from '../netto/policy';

// ============================================================
// 1. KONFIGURASI
// ============================================================

const RPC_URL = process.env.BSC_TESTNET_RPC || 'https://data-seed-prebsc-1-s1.binance.org:8545/';

// ============================================================
// 2. ERC‑20 ABI
// ============================================================

const ERC20_ABI = [
    {
        inputs: [
            { name: 'recipient', type: 'address' },
            { name: 'amount', type: 'uint256' },
        ],
        name: 'transfer',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
] as const;

// ============================================================
// 3. LAZY CLIENTS
// ============================================================

let _clients: {
    publicClient: ReturnType<typeof createPublicClient>;
    walletClient: ReturnType<typeof createWalletClient>;
    account: ReturnType<typeof privateKeyToAccount>;
    tokenAddress: `0x${string}`;
} | null = null;

function getClients() {
    if (_clients) return _clients;

    const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
    const tokenAddress = process.env.TOKEN_ADDRESS as `0x${string}`;

    if (!privateKey) throw new Error('PRIVATE_KEY required in .env.local');
    if (!tokenAddress) throw new Error('TOKEN_ADDRESS required in .env.local');

    const account = privateKeyToAccount(privateKey);

    const publicClient = createPublicClient({
        chain: bscTestnet,
        transport: http(RPC_URL),
    });

    const walletClient = createWalletClient({
        chain: bscTestnet,
        transport: http(RPC_URL),
        account,
    });

    _clients = { publicClient, walletClient, account, tokenAddress };
    return _clients;
}

export function getPublicClient() { return getClients().publicClient; }
export function getWalletClient() { return getClients().walletClient; }

// ============================================================
// 4. RESULT TYPES
// ============================================================

/**
 * Fase-1: setelah broadcast (writeContract), sebelum receipt.
 * txHash sudah tersedia dan harus disimpan ke Redis segera.
 */
export type BroadcastResult =
    | { broadcasted: true;  txHash: `0x${string}` }
    | { broadcasted: false; error: string };

/**
 * Fase-2: setelah waitForTransactionReceipt.
 */
export type ReceiptResult =
    | { confirmed: true;  txHash: string; blockNumber: bigint }
    | { confirmed: false; txHash: string; error: string }; // txHash tetap ada walau timeout

/**
 * Legacy type yang masih dipakai oleh test scripts.
 */
export type ExecutorResult = {
    success: boolean;
    txHash?: string;
    blockNumber?: bigint;
    error?: string;
};

// ============================================================
// 5. TWO-PHASE EXECUTOR
// ============================================================

/**
 * FASE 1 — Broadcast ke blockchain.
 *
 * Mengambil NONCE EKSPLISIT ('pending') langsung dari node sebelum kirim
 * untuk memastikan tidak ada stale/collision nonce di lingkungan bermuatan paralel.
 */
export async function broadcastTransfer(
    action: TransferAction,
    onNonceFetched?: (nonce: number) => Promise<void>
): Promise<BroadcastResult> {
    try {
        const { publicClient, walletClient, account, tokenAddress } = getClients();
        const amountInWei = parseUnits(action.amount.toString(), 18);

        const { request } = await publicClient.simulateContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'transfer',
            args: [action.recipient as `0x${string}`, amountInWei],
            account,
        });

        // ✅ NONCE EKSPLISIT: Ambil count transaksi 'pending' dari node
        // Mencegah nonce collide / stale nonce saat ada eksekusi bersamaan.
        const nonce = await publicClient.getTransactionCount({
            address: account.address,
            blockTag: 'pending',
        });

        if (onNonceFetched) {
            await onNonceFetched(nonce);
        }

        const txHash = await walletClient.writeContract({
            ...request,
            nonce,
        });
        return { broadcasted: true, txHash };

    } catch (error) {
        return {
            broadcasted: false,
            error: error instanceof Error ? error.message : 'Unknown broadcast error',
        };
    }
}

/**
 * FASE 2 — Tunggu receipt dari blockchain.
 *
 * TIDAK pernah throw — selalu return ReceiptResult.
 */
export async function awaitReceipt(
    txHash: `0x${string}`
): Promise<ReceiptResult> {
    try {
        const { publicClient } = getClients();
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
        if (receipt.status === 'success') {
            return { confirmed: true, txHash, blockNumber: receipt.blockNumber };
        } else {
            return { confirmed: false, txHash, error: 'Transaction reverted on-chain' };
        }
    } catch (error) {
        // timeout, RPC error, dsb — tapi txHash tetap dikembalikan
        return {
            confirmed: false,
            txHash,
            error: error instanceof Error ? error.message : 'Unknown receipt error',
        };
    }
}

/**
 * RECONCILIATION HELPER:
 * Cek status receipt sebuah txHash langsung dari RPC tanpa melempar exception.
 */
export async function checkTransactionReceipt(txHash: `0x${string}`) {
    try {
        const { publicClient } = getClients();
        const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
        return receipt;
    } catch {
        return null;
    }
}

/**
 * LEGACY WRAPPER — untuk test scripts yang masih pakai executeTransfer().
 */
export async function executeTransfer(action: TransferAction): Promise<ExecutorResult> {
    const broadcast = await broadcastTransfer(action);
    if (!broadcast.broadcasted) {
        return { success: false, error: broadcast.error };
    }
    const receipt = await awaitReceipt(broadcast.txHash);
    if (receipt.confirmed) {
        return { success: true, txHash: receipt.txHash, blockNumber: receipt.blockNumber };
    } else {
        return { success: false, txHash: receipt.txHash, error: receipt.error };
    }
}