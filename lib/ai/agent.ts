// lib/ai/agent.ts
import { generateText, stepCountIs } from 'ai';
import { google } from '@ai-sdk/google';

import type { NettoIntent } from '../netto/intent';
import { createAgentTools } from './tools';
import { parseUserIntent } from '../netto/parse-intent';

export type RunAgentResult = {
    intent: NettoIntent;
    action: {
        recipient: string;
        amount: number;
        token: string;
        chainId: number;
    };
    /**
     * ALLOW      → Guardian authorized, menunggu konfirmasi user → /api/agent/execute
     * BLOCKED    → Guardian menolak (policy / risk violation)
     * NO_ACTION  → Agent tidak memanggil tool sama sekali (bukan keputusan keamanan)
     */
    status: 'ALLOW' | 'BLOCKED' | 'NO_ACTION';
    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reasons: string[];
};

/**
 * Jalankan agent dengan user input.
 * 1. Parse intent secara deterministik (tanpa LLM)
 * 2. Buat tools dengan intent
 * 3. Jalankan Gemini dengan tools
 * 4. Ambil hasil tool call dan tentukan status
 */
export async function runAgent(userInput: string): Promise<RunAgentResult> {
    // 1. Parse intent dari user input (deterministic, tanpa LLM)
    const parseResult = parseUserIntent(userInput, 97);
    if (!parseResult.success) {
        throw new Error(parseResult.error);
    }
    const intent = parseResult.intent;

    // 2. Buat tools dengan intent
    const tools = createAgentTools(intent);

    // 3. Jalankan agent (Gemini)
    const result = await generateText({
        model: google('gemini-3.6-flash'),

        system: `
You are NettoAI's transaction agent.

Your job is to interpret the user's request and use the available tools.

IMPORTANT SECURITY RULES:
- Never invent or modify the user's authorized recipient.
- Never increase the user's authorized amount.
- The server-provided intent is the source of truth.
- You may call transferUSDT when appropriate.
- NettoAI authorization is mandatory and is enforced inside the tool.
- If NettoAI blocks a transaction, do not attempt to bypass it.
`,

        prompt: `
User request:
${userInput}

Authorized recipient:
${intent.recipient}

Maximum authorized amount:
${intent.maxAmount} ${intent.token}

If the user request requires a transfer, use the transferUSDT tool.
`,

        tools,
        stopWhen: stepCountIs(3),
    });

    // 🔍 Minimal debug log — uncomment bagian steps apabila perlu investigasi
    // mendalam kenapa tool tidak terpanggil (model refuse, salah paham prompt, dsb).
    console.log('[NettoAI][debug] finishReason:', result.finishReason);
    if (result.finishReason !== 'tool-calls' && result.finishReason !== 'stop') {
        console.log('[NettoAI][debug] text:', result.text?.slice(0, 200));
    }

    // 4. Ambil hasil tool call dari SELURUH langkah (bukan cuma yang terakhir)
    let toolResult: any = null;
    if (result.steps) {
        for (const step of result.steps) {
            if (step.toolResults && step.toolResults.length > 0) {
                toolResult = (step.toolResults[0] as any).result;
                break; // ketemu!
            }
        }
    }

    console.log('[NettoAI][debug] jumlah steps:', result.steps?.length, 'toolResults per step:', result.steps?.map(s => s.toolResults?.length || 0));

    // ⚠️ Kasus penting: model tidak memanggil tool sama sekali.
    // Ini BUKAN "BLOCKED" (bukan hasil keputusan keamanan) — ini kegagalan
    // agent untuk menghasilkan action. Jangan disamarkan jadi BLOCKED,
    // supaya tidak terlihat seperti pelanggaran kebijakan padahal bukan.
    if (!toolResult) {
        return {
            intent,
            action: {
                recipient: intent.recipient,
                amount: intent.maxAmount,
                token: intent.token,
                chainId: intent.chainId,
            },
            status: 'NO_ACTION',
            riskScore: 0,
            riskLevel: 'LOW',
            reasons: [
                result.text?.trim()
                    ? `Agent did not call the transfer tool. Model said: "${result.text.trim()}"`
                    : 'Agent did not call the transfer tool and returned no explanation.',
            ],
        };
    }

    // 5. Tentukan status dari hasil tool
    //    AUTHORIZED (dari guardian dry-run) → ALLOW (siap dikonfirmasi user)
    //    BLOCKED                            → BLOCKED (policy / risk violation)
    //    Nilai lain yang tidak dikenali     → BLOCKED (fail-safe)
    const status: RunAgentResult['status'] =
        toolResult.status === 'AUTHORIZED'
            ? 'ALLOW'
            : 'BLOCKED';

    // 6. Ambil action dari toolResult, atau fallback ke intent
    const action = toolResult.action || {
        recipient: intent.recipient,
        amount: intent.maxAmount,
        token: intent.token,
        chainId: intent.chainId,
    };

    // 7. Reasons: ambil dari toolResult
    const reasons: string[] = toolResult.reasons ? [...toolResult.reasons] : [];

    // 8. Return hasil lengkap
    return {
        intent,
        action,
        status,
        riskScore: toolResult.riskScore || 0,
        riskLevel: toolResult.riskLevel || 'LOW',
        reasons,
    };
}