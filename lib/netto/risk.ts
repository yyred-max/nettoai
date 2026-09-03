// lib/netto/risk.ts
import { ViolationCode, type PolicyViolation } from "./policy";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type RiskResult = {
    score: number;
    level: RiskLevel;
    reasons: string[]; // akan diisi dari policy.violations di authorize.ts
};

// Bobot risiko terpusat — sesuai dengan kode sebelumnya
const VIOLATION_WEIGHTS: Record<ViolationCode, number> = {
    [ViolationCode.RECIPIENT_MISMATCH]: 50,
    [ViolationCode.TOKEN_MISMATCH]: 30,
    [ViolationCode.AMOUNT_NOT_FINITE]: 100,
    [ViolationCode.AMOUNT_INVALID_ZERO]: 40,
    [ViolationCode.AMOUNT_EXCEEDS_LIMIT]: 40,
    [ViolationCode.CHAIN_ID_INVALID]: 100,
    [ViolationCode.CHAIN_ID_MISMATCH]: 100,
};

export function calculateRisk(
    violations: PolicyViolation[]
): RiskResult {
    let score = 0;

    for (const violation of violations) {
        score += VIOLATION_WEIGHTS[violation.code] || 0;
    }

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