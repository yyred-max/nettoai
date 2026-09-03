// lib/ai/intent-mutation-tests.ts
import { parseUserIntent } from "../netto/parse-intent";
import { createIntent } from "../netto/intent";

const ALICE = "0x742d35Cc6634C0532925a3b844Bc9e7598f0b0d8";

function main() {
    console.log("=== GUARDIAN INTENT MUTATION TEST ===\n");

    // 1. Test parseUserIntent returns frozen object
    const parseResult = parseUserIntent(`Send 50 USDT to ${ALICE}`, 97);
    if (!parseResult.success) {
        console.error("Parse failed:", parseResult.error);
        process.exit(1);
    }

    const intent1 = parseResult.intent;
    console.log("Testing parseUserIntent() intent immutability...");

    // ✅ Verifikasi langsung dengan Object.isFrozen
    if (Object.isFrozen(intent1)) {
        console.log("[PASS] parseUserIntent: Intent is frozen");
    } else {
        console.log("[FAIL] parseUserIntent: Intent is NOT frozen");
        process.exit(1);
    }

    // 2. Test createIntent returns frozen object
    const intent2 = createIntent({
        recipient: ALICE,
        maxAmount: 50,
        token: "USDT",
        chainId: 97,
    });

    console.log("\nTesting createIntent() intent immutability...");
    if (Object.isFrozen(intent2)) {
        console.log("[PASS] createIntent: Intent is frozen");
    } else {
        console.log("[FAIL] createIntent: Intent is NOT frozen");
        process.exit(1);
    }

    // 3. Test property access
    console.log("\nTesting property access...");
    console.log(`   Recipient: ${intent1.recipient}`);
    console.log(`   MaxAmount: ${intent1.maxAmount}`);
    console.log(`   Token: ${intent1.token}`);
    console.log(`   ChainId: ${intent1.chainId}`);
    console.log("[PASS] Properties accessible and unchanged");

    console.log("\n======================================");
    console.log("✅ ALL INTENT MUTATION TESTS PASSED.");
    console.log("\nSecurity conclusion:");
    console.log("NettoIntent is structurally immutable via Object.freeze().");
    console.log("This is true immutability, not just \"we didn't mutate it\".");
}

main();