import dotenv from "dotenv";
import { runAgent } from "./agent";

dotenv.config({ path: ".env.local" });

async function main() {
    console.log("=== NETTOAI AGENT TEST ===");

    const userInput = "Send 50 USDT to Alice.";

    const result = await runAgent(userInput);

    console.log("\n=== AGENT RESULT ===");
    console.log("Status:", result.status);
    console.log("Intent:", result.intent);
    console.log("Action:", result.action);
    console.log("Risk Score:", result.riskScore);
    console.log("Risk Level:", result.riskLevel);
    console.log("Reasons:", result.reasons);
}

main().catch((error) => {
    console.error("\nAgent test failed:");
    console.error(error);
    process.exit(1);
});