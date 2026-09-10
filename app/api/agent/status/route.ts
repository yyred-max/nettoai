// app/api/agent/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { decisionStore } from '@/lib/store/decisionStore';
import { checkTransactionReceipt } from '@/lib/blockchain/executor';

/**
 * RECONCILIATION ENDPOINT: GET /api/agent/status?decisionId=dcs_xxx
 *
 * Maksud & Kegunaan:
 * - Menutup loop status transaksi yang nyangkut di Redis (`broadcast_pending` atau `executing`).
 * - Jika Vercel Serverless Function mati saat `awaitReceipt()`, status di Redis tetap `broadcast_pending` + `txHash`.
 * - Endpoint ini secara otomatis mengecek ke RPC BSC Testnet via `getTransactionReceipt(txHash)`.
 *   - Jika transaksi sudah mined & success → otomatis update status Redis ke 'executed'.
 *   - Jika transaksi mined & revert   → otomatis update status Redis ke 'failed'.
 *   - Jika transaksi belum mined      → kembalikan status 'broadcast_pending'.
 * - Frontend dapat melakukan polling endpoint ini secara otomatis.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const decisionId = searchParams.get('decisionId');

        if (!decisionId) {
            return NextResponse.json(
                { error: 'decisionId query parameter is required.' },
                { status: 400 }
            );
        }

        const entry = await decisionStore.get(decisionId);

        if (!entry) {
            return NextResponse.json(
                { error: 'Decision not found or expired.' },
                { status: 404 }
            );
        }

        // ── AUTO-RECONCILIATION ──────────────────────────────────────────────
        // Jika status saat ini 'broadcast_pending' atau 'executing' yang memiliki txHash,
        // periksa status riilnya ke blockchain node (BSC Testnet RPC).
        if ((entry.status === 'broadcast_pending' || entry.status === 'executing') && entry.txHash) {
            const receipt = await checkTransactionReceipt(entry.txHash as `0x${string}`);

            if (receipt) {
                if (receipt.status === 'success') {
                    entry.status = 'executed';
                    await decisionStore.updateStatus(decisionId, 'executed');
                } else if (receipt.status === 'reverted') {
                    entry.status = 'failed';
                    await decisionStore.updateStatus(decisionId, 'failed');
                }
                return NextResponse.json({
                    decisionId,
                    status: entry.status === 'executed' ? 'EXECUTED' : 'FAILED',
                    txHash: entry.txHash,
                    block: receipt.blockNumber.toString(),
                    reconciled: true,
                    entry,
                });
            }
        }

        return NextResponse.json({
            decisionId,
            status: entry.status.toUpperCase(),
            txHash: entry.txHash || undefined,
            reconciled: false,
            entry,
        });

    } catch (error) {
        console.error('[NettoAI] Status check error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: `Status check failed: ${message}` },
            { status: 500 }
        );
    }
}
