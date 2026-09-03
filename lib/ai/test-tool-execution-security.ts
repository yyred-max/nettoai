import { createAgentTools } from "./tools";
import type { NettoIntent } from "../netto/intent";

type ToolResult = {
    status: string;
    message: string;
    riskScore: number;
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    reasons: string[];
};

function assertToolResult(
    result: ToolResult | AsyncIterable<ToolResult>
): ToolResult {
    if (
        typeof result === "object" &&
        result !== null &&
        Symbol.asyncIterator in result
    ) {
        throw new Error("Unexpected AsyncIterable tool result.");
    }

    return result as ToolResult;
}

async function main() {
    console.log("=== GUARDIAN TOOL EXECUTION SECURITY TEST ===");

    const ALICE_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc9e7598f0b0d8";

    const intent: NettoIntent = {
        recipient: ALICE_ADDRESS,
        maxAmount: 100,
        token: "USDT",
        chainId: 97,
    };

    const tools = createAgentTools(intent);
    const transferTool = tools.transferUSDT;

    let passed = 0;
    let failed = 0;

    // ==========================================
    // TEST 1: BLOCKED must never execute
    // ==========================================

    try {
        const blockedResult = assertToolResult(
            await transferTool.execute(
                {
                    recipient: "0xDeAdBeEf00000000000000000000000000000000",
                    amount: 2000,
                    token: "USDT",
                    chainId: 97,
                },
                {} as any
            )
        );

        if (blockedResult.status !== "BLOCKED") {
            throw new Error(
                `Expected BLOCKED, got ${blockedResult.status}`
            );
        }

        console.log(
            "[PASS] BLOCKED transaction never reaches blockchain execution"
        );

        passed++;
    } catch (error) {
        console.log("[FAIL] BLOCKED transaction test");
        console.error(error);
        failed++;
    }

    // ==========================================
    // TEST 2: AUTHORIZED → executor dipanggil
    // ==========================================

    try {
        const authorizedResult = assertToolResult(
            await transferTool.execute(
                {
                    recipient: ALICE_ADDRESS,
                    amount: 50,
                    token: "USDT",
                    chainId: 97,
                },
                {} as any
            )
        );

        if (authorizedResult.status !== "EXECUTED") {
            throw new Error(
                `Expected EXECUTED, got ${authorizedResult.status}`
            );
        }

        console.log(
            "[PASS] AUTHORIZED transaction reaches executor"
        );

        passed++;
    } catch (error) {
        console.log("[FAIL] AUTHORIZED execution boundary test");
        console.error(error);
        failed++;
    }

    console.log("\n======================================");
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log("======================================");

    if (failed > 0) {
        console.log("\nEXECUTION SECURITY TESTS FAILED.");
        process.exit(1);
    }

    console.log("\nALL EXECUTION SECURITY TESTS PASSED.");
}

main().catch((error) => {
    console.error("\nTest suite failed:");
    console.error(error);
    process.exit(1);
});