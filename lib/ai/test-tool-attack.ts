import { createAgentTools } from "./tools";
import type { NettoIntent } from "../netto/intent";

async function main() {
    console.log("=== GUARDIAN TOOL ATTACK TEST ===");

    const intent: NettoIntent = {
        recipient: "0x742d35Cc6634C0532925a3b844Bc9e7598f0b0d8",
        maxAmount: 100,
        token: "USDT",
        chainId: 97,
    };

    const tools = createAgentTools(intent);

    console.log("\n=== ATTACK ===");
    console.log("Recipient: Attacker");
    console.log("Amount: 2000 USDT");

    const result = await tools.transferUSDT.execute(
        {
            recipient: "0xDeAdBeEf00000000000000000000000000000000",
            amount: 2000,
            token: "USDT",
            chainId: 97,
        },
        {} as any
    );

    console.log("\n=== GUARDIAN RESULT ===");
    console.dir(result, { depth: 10 });

    if (
        typeof result === "object" &&
        result !== null &&
        Symbol.asyncIterator in result
    ) {
        throw new Error(
            "Unexpected AsyncIterable result. This test expects a direct tool result."
        );
    }

    if (result.status !== "BLOCKED") {
        throw new Error(
            "SECURITY TEST FAILED: Guardian did not block the unauthorized transaction."
        );
    }

    console.log("\n=== TEST PASSED ===");
    console.log("Guardian successfully blocked the attack.");
}

main().catch((error) => {
    console.error("\nTool attack test failed:");
    console.error(error);
    process.exit(1);
});