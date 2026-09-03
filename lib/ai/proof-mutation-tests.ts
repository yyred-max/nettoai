// lib/ai/proof-mutation-tests.ts
import { authorizeTransfer } from "../netto/authorize";
import type { NettoIntent } from "../netto/intent";

const ALICE = "0x742d35Cc6634C0532925a3b844Bc9e7598f0b0d8";
const ATTACKER = "0xDeAdBeEf00000000000000000000000000000000";

function main() {
    console.log("=== GUARDIAN PROOF MUTATION TEST ===\n");

    const intent: NettoIntent = Object.freeze({
        recipient: ALICE,
        maxAmount: 50,
        token: "USDT",
        chainId: 97,
    });

    const proof = authorizeTransfer(intent, {
        recipient: ALICE,
        amount: 50,
        token: "USDT",
        chainId: 97,
    });

    console.log("Is proof frozen?", Object.isFrozen(proof));
    console.log("Is proof.reasons frozen?", Object.isFrozen(proof.reasons));

    console.log("\n=== Testing proof immutability (shallow) ===");

    // ❌ Coba mutasi proof.allowed
    try {
        (proof as any).allowed = false;
        console.log("[FAIL] proof.allowed can be mutated");
        process.exit(1);
    } catch (e: any) {
        console.log("[PASS] proof.allowed is frozen (Error:", e.message, ")");
    }

    // ❌ Coba mutasi proof.reasons
    try {
        (proof as any).reasons.push("Hacked");
        console.log("[FAIL] proof.reasons can be mutated");
        process.exit(1);
    } catch (e: any) {
        console.log("[PASS] proof.reasons is frozen (Error:", e.message, ")");
    }

    // ❌ Coba tambahkan properti baru ke proof
    try {
        (proof as any).action = { recipient: "hack" };
        console.log("[FAIL] Can add new property 'action' to proof");
        process.exit(1);
    } catch (e: any) {
        console.log("[PASS] Cannot add new property to proof (Error:", e.message, ")");
    }

    // ============================================================
    // ✅ DEEP FREEZE TESTS — inilah yang sebelumnya belum diuji
    // ============================================================

    console.log("\n=== Testing deep freeze (nested objects) ===");

    // ❌ Coba mutasi properti di dalam action
    try {
        (proof as any).action.recipient = ATTACKER;
        console.log("[FAIL] proof.action.recipient can be mutated — DEEP FREEZE MISSING");
        process.exit(1);
    } catch (e: any) {
        console.log("[PASS] proof.action.recipient is frozen (Error:", e.message, ")");
    }

    // ❌ Coba mutasi properti di dalam intent
    try {
        (proof as any).intent.maxAmount = 9999;
        console.log("[FAIL] proof.intent.maxAmount can be mutated — DEEP FREEZE MISSING");
        process.exit(1);
    } catch (e: any) {
        console.log("[PASS] proof.intent.maxAmount is frozen (Error:", e.message, ")");
    }

    // ✅ Verifikasi bahwa proof memang memiliki action dan intent
    console.log("\n=== Checking proof structure ===");
    console.log("  proof has 'action' property:", 'action' in proof);
    console.log("  proof has 'intent' property:", 'intent' in proof);
    console.log("  proof.action is frozen:", Object.isFrozen(proof.action));
    console.log("  proof.intent is frozen:", Object.isFrozen(proof.intent));

    console.log("\n✅ ALL PROOF MUTATION TESTS PASSED.");
    console.log("GuardianProof is structurally immutable (deep freeze).");
    console.log("Nested objects (action, intent, reasons) are also frozen.");
}

main();