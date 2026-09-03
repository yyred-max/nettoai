// lib/blockchain/executor.ts
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });  // ✅ HARUS INI

import { createPublicClient, createWalletClient, http, parseUnits } from 'viem';
import { bscTestnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import type { TransferAction } from '../netto/policy';

const RPC_URL = process.env.BSC_TESTNET_RPC || 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;

if (!PRIVATE_KEY) throw new Error('PRIVATE_KEY required in .env.local');

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

const account = privateKeyToAccount(PRIVATE_KEY);

export const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http(RPC_URL),
});

export const walletClient = createWalletClient({
    chain: bscTestnet,
    transport: http(RPC_URL),
    account,
});

export type ExecutorResult = {
    success: boolean;
    txHash?: string;
    blockNumber?: bigint;
    error?: string;
};

export async function executeTransfer(
    action: TransferAction
): Promise<ExecutorResult> {
    const tokenAddress = process.env.TOKEN_ADDRESS as `0x${string}`;
    if (!tokenAddress) {
        return {
            success: false,
            error: 'TOKEN_ADDRESS not configured in .env.local',
        };
    }

    try {
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