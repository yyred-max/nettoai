// authorize.ts
import type { NettoIntent } from "./intent";
import { checkPolicy, type TransferAction } from "./policy";
import { calculateRisk } from "./risk";

export type AuthorizationResult = {
    allowed: boolean;
    riskScore: number;
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    reasons: string[]; // ← type tetap string[] untuk kompatibilitas SDK
    action: TransferAction;
    intent: NettoIntent;
};

export function authorizeTransfer(
    intent: NettoIntent,
    action: TransferAction
): AuthorizationResult {
    const policy = checkPolicy(intent, action);
    const risk = calculateRisk(policy.violations);

    const allowed = policy.allowed && risk.level !== "CRITICAL";
    const reasons = policy.violations.map((v) => v.message);

    if (risk.level === "CRITICAL" && reasons.length === 0) {
        reasons.push("Critical risk level detected.");
    }

    const result = {
        allowed,
        riskScore: risk.score,
        riskLevel: risk.level,
        reasons: Object.freeze(reasons) as string[], // ← freeze runtime, tapi type string[]
        action: Object.freeze({ ...action }),        // deep freeze copy
        intent: Object.freeze(intent),               // intent sudah frozen
    };

    return Object.freeze(result); // freeze seluruh proof
}