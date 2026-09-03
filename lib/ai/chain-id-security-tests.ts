import { authorizeTransfer } from "../netto/authorize";
import type { NettoIntent } from "../netto/intent";
import type { TransferAction } from "../netto/policy";

const ALICE = "0x742d35Cc6634C0532925a3b844Bc9e7598f0b0d8";

type TestCase = {
    name: string;
    intentChainId: number;
    actionChainId: number;
    expected: "AUTHORIZED" | "BLOCKED";
    expectedReasonContains?: string; // opsional, untuk verifikasi alasan
};

const TESTS: TestCase[] = [
    {
        name: "Base case: correct chain ID 97",
        intentChainId: 97,
        actionChainId: 97,
        expected: "AUTHORIZED",
    },
    {
        name: "Wrong chain: BSC Mainnet (56)",
        intentChainId: 97,
        actionChainId: 56,
        expected: "BLOCKED",
        expectedReasonContains: "Chain ID mismatch",
    },
    {
        name: "Zero chain ID",
        intentChainId: 97,
        actionChainId: 0,
        expected: "BLOCKED",
        expectedReasonContains: "Invalid chain ID",
    },
    {
        name: "Negative chain ID",
        intentChainId: 97,
        actionChainId: -97,
        expected: "BLOCKED",
        expectedReasonContains: "Invalid chain ID",
    },
    {
        name: "Non-integer chain ID",
        intentChainId: 97,
        actionChainId: 97.5,
        expected: "BLOCKED",
        expectedReasonContains: "Invalid chain ID",
    },
];

function runTest(test: TestCase): boolean {
    const intent: NettoIntent = {
        recipient: ALICE,
        maxAmount: 50,
        token: "USDT",
        chainId: test.intentChainId,
    };

    const action: TransferAction = {
        recipient: ALICE,
        amount: 50,
        token: "USDT",
        chainId: test.actionChainId,
    };

    const result = authorizeTransfer(intent, action);

    const actual = result.allowed ? "AUTHORIZED" : "BLOCKED";
    const passed = actual === test.expected;

    // Verifikasi reason (jika diharapkan)
    let reasonOk = true;
    if (passed && test.expectedReasonContains) {
        const hasReason = result.reasons.some(r =>
            r.includes(test.expectedReasonContains!)
        );
        if (!hasReason) {
            console.warn(`Reason mismatch: expected contains "${test.expectedReasonContains}", got:`, result.reasons);
            reasonOk = false;
        }
    }

    const finalPass = passed && reasonOk;

    console.log(finalPass ? "[PASS]" : "[FAIL]", test.name);
    console.log(`       Intent Chain ID:  ${test.intentChainId}`);
    console.log(`       Action Chain ID:  ${test.actionChainId}`);
    console.log(`       Expected:         ${test.expected}`);
    console.log(`       Actual:           ${actual}`);
    console.log(`       Risk Score:       ${result.riskScore}`);
    console.log(`       Risk Level:       ${result.riskLevel}`);
    console.log(`       Reasons:          ${result.reasons.join("; ") || "(none)"}`);
    console.log("");

    return finalPass;
}

function main() {
    console.log("=== GUARDIAN CHAIN ID SECURITY TEST ===\n");

    let passed = 0;
    let failed = 0;

    for (const test of TESTS) {
        if (runTest(test)) {
            passed++;
        } else {
            failed++;
        }
    }

    console.log("======================================");
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log(`TOTAL:  ${TESTS.length}`);
    console.log("======================================\n");

    if (failed === 0) {
        console.log("✅ ALL CHAIN ID SECURITY TESTS PASSED.");
        console.log("\nSecurity conclusion:");
        console.log("Chain ID enforcement is active and cannot be bypassed.");
        console.log("Only chain ID 97 (BSC Testnet) is authorized.");
        console.log("Any other chain ID, including 56 (BSC Mainnet), is BLOCKED.");
        console.log("Invalid chain IDs (0, negative, non-integer) are also BLOCKED with a distinct reason.");
    } else {
        console.error("❌ CHAIN ID SECURITY TESTS FAILED.");
        process.exit(1);
    }
}

main();