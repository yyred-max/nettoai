import dotenv from "dotenv";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

dotenv.config({ path: ".env.local" });

async function main() {
    const result = await generateText({
        model: google("gemini-3.5-flash-lite"),
        prompt: "Jawab singkat: apakah Guardian siap?",
    });

    console.log("=== GEMINI TEST ===");
    console.log(result.text);
}

main().catch((error) => {
    console.error("Gemini test failed:");
    console.error(error);
    process.exit(1);
});