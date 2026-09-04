// lib/blockchain/executor.ts
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createPublicClient, createWalletClient, http, parseUnits } from 'viem';
import { bscTestnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import type { TransferAction } from '../netto/policy';

// ============================================================
// 1. KONFIGURASI (tanpa validasi di level modul)
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
// 3. LAZY CLIENT — dibuat saat dibutuhkan
// ============================================================

function getClients() {
    const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
    const tokenAddress = process.env.TOKEN_ADDRESS as `0x${string}`;

    if (!privateKey) {
        throw new Error('PRIVATE_KEY required in .env.local');
    }
    if (!tokenAddress) {
        throw new Error('TOKEN_ADDRESS required in .env.local');
    }

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

    return { publicClient, walletClient, account, tokenAddress };
}

// ============================================================
// 4. EXECUTOR — hanya di sini validasi dijalankan
// ============================================================

export type ExecutorResult = {
    success: boolean;
    txHash?: string;
    blockNumber?: bigint;
    error?: string;
};

export async function executeTransfer(
    action: TransferAction
): Promise<ExecutorResult> {
    try {
        const { publicClient, walletClient, account, tokenAddress } = getClients();

        const decimals = 18;
        const amountInWei = parseUnits(action.amount.toString(), decimals);

        const { request } = await publicClient.simulateContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'transfer',
            args: [action.recipient as `0x${string}`, amountInWei],
            account,
        });

        const hash = await walletClient.writeContract(request);
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        return {
            success: receipt.status === 'success',
            txHash: hash,
            blockNumber: receipt.blockNumber,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}