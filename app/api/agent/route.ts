// app/api/agent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

import { runAgent } from '@/lib/ai/agent';
import { traceProvenance } from '@/lib/provenance/tracer';
import { decisionStore } from '@/lib/store/decisionStore';

export async function POST(req: NextRequest) {
    try {
        const { userInput } = await req.json();

        if (!userInput || typeof userInput !== 'string' || userInput.trim() === '') {
            return NextResponse.json(
                { error: 'User input is required and must be a non-empty string.' },
                { status: 400 }
            );
        }

        // 1. Jalankan agent → dapat intent, action, status, riskScore, riskLevel, reasons
        const result = await runAgent(userInput);
        const { intent, action, status, riskScore, riskLevel, reasons } = result;

        // Pastikan action ada (fallback)
        if (!action) {
            return NextResponse.json(
                { error: 'Failed to generate action from agent.' },
                { status: 500 }
            );
        }

        // 2. Provenance tracing (field-level literal grounding)
        const provenance = traceProvenance(userInput, {
            recipient: action.recipient,
            amount: action.amount,
            token: action.token,
            chainId: action.chainId,
        });

        // 3. Tambahkan unverified fields ke reasons (opsional)
        if (!provenance.summary.allVerified) {
            reasons.push(
                `⚠️ Unverified fields: ${provenance.summary.unverifiedFields.join(', ')}`
            );
        }

        // 4. Buat decisionId dan simpan ke store
        const decisionId = `dcs_${randomUUID().slice(0, 8)}`;
        decisionStore.set(decisionId, {
            intent,
            action,
            provenance,
            userInput,
            status: 'pending',
        });

        // 5. Response (tanpa execute)
        return NextResponse.json({
            status, // ✅ langsung dari runAgent, tidak redeclare
            decisionId,
            riskScore,
            riskLevel,
            reasons,
            intent,
            action,
            provenance,
        });

    } catch (error) {
        console.error('[NettoAI] Agent error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: `NettoAI check failed: ${message}` },
            { status: 500 }
        );
    }
}