import dotenv from "dotenv";
import { runAgent } from "./agent";

dotenv.config({ path: ".env.local" });

async function main() {
    console.log("=== GUARDIAN AGENT TEST ===");

    const result = await runAgent({
        userIntent: "Send 50 USDT to Alice.",
        recipient: "0x742d35Cc6634C0532925a3b844Bc9e7598f0b0d8",
        maxAmount: 100,
    });

    console.log("\n=== AGENT TEXT ===");
    console.log(result.text);

    console.log("\n=== STEPS ===");
    console.dir(result.steps, { depth: 10 });
}

main().catch((error) => {
    console.error("\nAgent test failed:");
    console.error(error);
    process.exit(1);
});