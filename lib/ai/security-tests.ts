import { authorizeTransfer } from "../netto/authorize";
import type { NettoIntent } from "../netto/intent";

type TestCase = {
    name: string;
    recipient: string;
    amount: number;
    token: string;
    expectedStatus: "AUTHORIZED" | "BLOCKED";
};

const intent: NettoIntent = {
    recipient: "0x742d35Cc6634C0532925a3b844Bc9e7598f0b0d8",
    maxAmount: 100,
    token: "USDT",
    chainId: 97,
};

const tests: TestCase[] = [
    {
        name: "Legitimate transfer",
        recipient: "0x742d35Cc6634C0532925a3b844Bc9e7598f0b0d8",
        amount: 50,
        token: "USDT",
        expectedStatus: "AUTHORIZED",
    },
    {
        name: "Maximum allowed amount",
        recipient: "0x742d35Cc6634C0532925a3b844Bc9e7598f0b0d8",
        amount: 100,
        token: "USDT",
        expectedStatus: "AUTHORIZED",
    },
    {
        name: "Amount exceeds limit",
        recipient: "0x742d35Cc6634C0532925a3b844Bc9e7598f0b0d8",
        amount: 101,
        token: "USDT",
        expectedStatus: "BLOCKED",
    },
    {
        name: "Wrong recipient",
        recipient: "Bob",
        amount: 50,
        token: "USDT",
        expectedStatus: "BLOCKED",
    },
    {
        name: "Attacker + excessive amount",
        recipient: "0xDeAdBeEf00000000000000000000000000000000",
        amount: 2000,
        token: "USDT",
        expectedStatus: "BLOCKED",
    },
    {
        name: "Zero amount",
        recipient: "0x742d35Cc6634C0532925a3b844Bc9e7598f0b0d8",
        amount: 0,
        token: "USDT",
        expectedStatus: "BLOCKED",
    },
    {
        name: "Negative amount",
        recipient: "0x742d35Cc6634C0532925a3b844Bc9e7598f0b0d8",
        amount: -50,
        token: "USDT",
        expectedStatus: "BLOCKED",
    },
    {
        name: "Wrong token",
        recipient: "0x742d35Cc6634C0532925a3b844Bc9e7598f0b0d8",
        amount: 50,
        token: "ETH",
        expectedStatus: "BLOCKED",
    },
    {
        name: "Tiny amount",
        recipient: "0x742d35Cc6634C0532925a3b844Bc9e7598f0b0d8",
        amount: 0.000001,
        token: "USDT",
        expectedStatus: "AUTHORIZED",
    },
    {
        name: "Large attack",
        recipient: "0xDeAdBeEf00000000000000000000000000000000",
        amount: 999999,
        token: "USDT",
        expectedStatus: "BLOCKED",
    },
];

console.log("=== GUARDIAN SECURITY TEST SUITE ===\n");

let passed = 0;
let failed = 0;

for (const test of tests) {
    let actualStatus: "AUTHORIZED" | "BLOCKED";

    try {
        const result = authorizeTransfer(intent, {
            recipient: test.recipient,
            amount: test.amount,
            token: test.token,
            chainId: 97, // ✅ BSC Testnet
        });

        actualStatus = result.allowed ? "AUTHORIZED" : "BLOCKED";

        if (actualStatus === test.expectedStatus) {
            passed++;

            console.log(`[PASS] ${test.name}`);
            console.log(
                `       ${test.recipient} | ${test.amount} ${test.token} | ${actualStatus}`
            );
        } else {
            failed++;

            console.log(`[FAIL] ${test.name}`);
            console.log(
                `       Expected: ${test.expectedStatus}`
            );
            console.log(
                `       Actual:   ${actualStatus}`
            );
        }
    } catch (error) {
        failed++;

        console.log(`[FAIL] ${test.name}`);
        console.log("       Test threw an unexpected error:");
        console.log(`       ${String(error)}`);
    }

    console.log("");
}

console.log("====================================");
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log(`TOTAL:  ${tests.length}`);
console.log("====================================");

if (failed > 0) {
    console.log("\nSECURITY TESTS FAILED.");
    process.exit(1);
}

console.log("\nALL SECURITY TESTS PASSED.");
process.exit(0);
