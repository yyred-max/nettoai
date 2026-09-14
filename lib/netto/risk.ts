// lib/netto/risk.ts
import { ViolationCode, type PolicyViolation } from "./policy";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type RiskResult = {
    score: number;
    level: RiskLevel;
    reasons: string[]; // akan diisi dari policy.violations di authorize.ts
};

// ═══════════════════════════════════════════════════════════════════
// Bobot risiko terpusat — WAJIB punya entry untuk setiap ViolationCode
// ═══════════════════════════════════════════════════════════════════
const VIOLATION_WEIGHTS: Record<ViolationCode, number> = {
    // ── Intent mismatch (AI hallucination) ──
    [ViolationCode.RECIPIENT_MISMATCH]: 50,
    [ViolationCode.TOKEN_MISMATCH]: 30,
    [ViolationCode.AMOUNT_EXCEEDS_LIMIT]: 40,

    // ── Amount validation ──
    [ViolationCode.AMOUNT_NOT_FINITE]: 100,
    [ViolationCode.AMOUNT_INVALID_ZERO]: 40,

    // ── Chain validation ──
    [ViolationCode.CHAIN_ID_INVALID]: 100,
    [ViolationCode.CHAIN_ID_MISMATCH]: 100,

    // ── Global safety caps (NEW) ──
    [ViolationCode.AMOUNT_EXCEEDS_GLOBAL_CAP]: 75,
    [ViolationCode.TOKEN_NOT_ALLOWED]: 55,
    [ViolationCode.CHAIN_ID_NOT_ALLOWED]: 60,
    [ViolationCode.BLACKLISTED_RECIPIENT]: 95,
    [ViolationCode.SELF_TRANSFER]: 25,
};

export function calculateRisk(
    violations: PolicyViolation[]
): RiskResult {
    let score = 0;

    for (const violation of violations) {
        // `?? 0` lebih aman dari `|| 0` (menghindari bug jika weight = 0)
        score += VIOLATION_WEIGHTS[violation.code] ?? 0;
    }

    // ✅ Cap score di 100 — mencegah overflow dari akumulasi multi-violation
    score = Math.min(score, 100);

    let level: RiskLevel;
    if (score >= 80) {
        level = "CRITICAL";
    } else if (score >= 50) {
        level = "HIGH";
    } else if (score >= 30) {
        level = "MEDIUM";
    } else {
        level = "LOW";
    }

    return {
        score,
        level,
        reasons: [], // reasons final diambil dari policy.violations di authorize.ts
    };
}