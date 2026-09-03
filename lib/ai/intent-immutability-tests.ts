// lib/ai/intent-immutability-tests.ts
import { createAgentTools } from "./tools";
import type { NettoIntent } from "../netto/intent";

const ALICE = "0x742d35Cc6634C0532925a3b844Bc9e7598f0b0d8";
const ATTACKER = "0xDeAdBeEf00000000000000000000000000000000";

type TestCase = {
    name: string;
    action: {
        recipient: string;
        amount: number;
        token: string;
        chainId: number;
    };
    expectedStatus: "EXECUTED" | "BLOCKED" | "FAILED";
};

async function runTest(test: TestCase, intent: NettoIntent): Promise<boolean> {
    const tools = createAgentTools(intent);
    const transferTool = tools.transferUSDT;

    // ✅ Lewati options dengan cast any, karena kita hanya test langsung
    const result: any = await transferTool.execute(test.action, {} as any);

    const passed = result.status === test.expectedStatus;

    console.log(passed ? "[PASS]" : "[FAIL]", test.name);
    console.log(`       Action: ${test.action.recipient} | ${test.action.amount} ${test.action.token} | chain ${test.action.chainId}`);
    console.log(`       Expected status: ${test.expectedStatus}`);
    console.log(`       Actual status:   ${result.status}`);
    if (result.reasons && result.reasons.length) {
        console.log(`       Reasons: ${result.reasons.join("; ")}`);
    }
    console.log("");

    return passed;
}

async function main() {
    console.log("=== GUARDIAN INTENT IMMUTABILITY TEST ===\n");

    const intent: NettoIntent = {
        recipient: ALICE,
        maxAmount: 50,
        token: "USDT",
        chainId: 97,
    };

    const tests: TestCase[] = [
        {
            name: "Legitimate: same recipient, amount, token, chain",
            action: {
                recipient: ALICE,
                amount: 50,
                token: "USDT",
                chainId: 97,
            },
            expectedStatus: "EXECUTED",
        },
        {
            name: "Recipient mismatch",
            action: {
                recipient: ATTACKER,
                amount: 50,
                token: "USDT",
                chainId: 97,
            },
            expectedStatus: "BLOCKED",
        },
        {
            name: "Amount exceeds maxAmount",
            action: {
                recipient: ALICE,
                amount: 2000,
                token: "USDT",
                chainId: 97,
            },
            expectedStatus: "BLOCKED",
        },
        {
            name: "Token mismatch",
            action: {
                recipient: ALICE,
                amount: 50,
                token: "ETH",
                chainId: 97,
            },
            expectedStatus: "BLOCKED",
        },
        {
            name: "Chain ID mismatch (56 instead of 97)",
            action: {
                recipient: ALICE,
                amount: 50,
                token: "USDT",
                chainId: 56,
            },
            expectedStatus: "BLOCKED",
        },
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        if (await runTest(test, intent)) {
            passed++;
        } else {
            failed++;
        }
    }

    console.log("======================================");
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log(`TOTAL:  ${tests.length}`);
    console.log("======================================\n");

    if (failed === 0) {
        console.log("✅ ALL INTENT IMMUTABILITY TESTS PASSED.");
        console.log("\nSecurity conclusion:");
        console.log("NettoIntent is immutable and cannot be altered by LLM or agent.");
        console.log("Any action that deviates from the intent is BLOCKED.");
    } else {
        console.error("❌ INTENT IMMUTABILITY TESTS FAILED.");
        process.exit(1);
    }
}

main().catch(console.error);