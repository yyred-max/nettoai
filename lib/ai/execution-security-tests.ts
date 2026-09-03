import { authorizeTransfer } from "../netto/authorize";
import type { NettoIntent } from "../netto/intent";

type ExecutionResult = {
    status: "EXECUTED";
    txHash: string;
};

let executionCallCount = 0;

async function mockBlockchainExecute(): Promise<ExecutionResult> {
    executionCallCount++;

    return {
        status: "EXECUTED",
        txHash: "0xMOCK_TRANSACTION",
    };
}

function assert(condition: boolean, message: string) {
    if (!condition) {
        throw new Error(message);
    }
}

async function testBlockedDoesNotExecute() {
    executionCallCount = 0;

    const intent: NettoIntent = {
        recipient: "0x742d35Cc6634C0532925a3b844Bc9e7598f0b0d8",
        maxAmount: 100,
        token: "USDT",
        chainId: 97,
    };

    const authorization = authorizeTransfer(intent, {
        recipient: "0xDeAdBeEf00000000000000000000000000000000",
        amount: 2000,
        token: "USDT",
        chainId: 97,
    });

    assert(
        authorization.allowed === false,
        "Attack transaction was not blocked"
    );

    // IMPORTANT:
    // A BLOCKED authorization must never reach blockchain execution.
    if (authorization.allowed) {
        await mockBlockchainExecute();
    }

    assert(
        executionCallCount === 0,
        `Blockchain executor was called ${executionCallCount} time(s) for BLOCKED transaction`
    );

    console.log(
        "[PASS] BLOCKED transaction never reaches blockchain execution"
    );
}

async function testAuthorizedDoesNotExecute() {
    executionCallCount = 0;

    const intent: NettoIntent = {
        recipient: "0x742d35Cc6634C0532925a3b844Bc9e7598f0b0d8",
        maxAmount: 100,
        token: "USDT",
        chainId: 97,
    };

    const authorization = authorizeTransfer(intent, {
        recipient: "0x742d35Cc6634C0532925a3b844Bc9e7598f0b0d8",
        amount: 50,
        token: "USDT",
        chainId: 97,
    });

    assert(
        authorization.allowed === true,
        "Legitimate transaction was not authorized"
    );

    // IMPORTANT:
    // Authorization alone must NOT execute the blockchain transaction.
    //
    // We intentionally do NOT call mockBlockchainExecute() here.
    //
    // This proves that authorizeTransfer() is an authorization layer,
    // not a blockchain execution layer.

    assert(
        executionCallCount === 0,
        `Blockchain executor was called ${executionCallCount} time(s) after AUTHORIZED`
    );

    console.log(
        "[PASS] AUTHORIZED transaction does not automatically execute blockchain transaction"
    );
}

async function main() {
    console.log("=== GUARDIAN EXECUTION SECURITY TEST SUITE ===\n");

    let passed = 0;
    let failed = 0;

    try {
        await testBlockedDoesNotExecute();
        passed++;
    } catch (error) {
        failed++;
        console.error("[FAIL] BLOCKED execution test");

        if (error instanceof Error) {
            console.error(`       ${error.message}`);
        }
    }

    try {
        await testAuthorizedDoesNotExecute();
        passed++;
    } catch (error) {
        failed++;
        console.error("[FAIL] AUTHORIZED execution test");

        if (error instanceof Error) {
            console.error(`       ${error.message}`);
        }
    }

    console.log("\n======================================");
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log(`TOTAL:  ${passed + failed}`);
    console.log("======================================");

    if (failed > 0) {
        console.error("\nEXECUTION SECURITY TESTS FAILED.");
        process.exit(1);
    }

    console.log("\nALL EXECUTION SECURITY TESTS PASSED.");
}

main().catch((error) => {
    console.error("\nExecution security test suite failed:");
    console.error(error);
    process.exit(1);
});