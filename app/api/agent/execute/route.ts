// app/api/agent/execute/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { decisionStore } from '@/lib/store/decisionStore';
import { executeTransfer } from '@/lib/blockchain/executor';

export async function POST(req: NextRequest) {
    try {
        const { decisionId } = await req.json();

        if (!decisionId || typeof decisionId !== 'string') {
            return NextResponse.json(
                { error: 'decisionId is required.' },
                { status: 400 }
            );
        }

        // 1. Ambil dari store (otomatis cek expired)
        const entry = decisionStore.get(decisionId);
        if (!entry) {
            return NextResponse.json(
                { error: 'Decision not found or expired. Please re-run NettoAI check.' },
                { status: 404 }
            );
        }

        // 2. Cek apakah sudah dieksekusi
        if (entry.status === 'executed') {
            return NextResponse.json(
                { error: 'Decision already executed. Cannot execute again.' },
                { status: 400 }
            );
        }

        // 3. Eksekusi transaksi ke BSC Testnet
        const executionResult = await executeTransfer(entry.action);

        // 4. Tandai sebagai executed
        decisionStore.markExecuted(decisionId);

        // 5. Response dengan txHash
        return NextResponse.json({
            status: executionResult.success ? 'EXECUTED' : 'FAILED',
            txHash: executionResult.txHash,
            block: executionResult.blockNumber,
            network: 'BSC Testnet',
            error: executionResult.error || undefined,
        });

    } catch (error) {
        console.error('[NettoAI] Execute error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: `Execution failed: ${message}` },
            { status: 500 }
        );
    }
}