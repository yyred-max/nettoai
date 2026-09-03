// scripts/test-full-NettoAI-flow.ts
import 'dotenv/config';
import { createAgentTools } from '../lib/ai/tools';
import type { NettoIntent } from '../lib/netto/intent';
import { parseUserIntent } from '../lib/netto/parse-intent';

const ALICE = "0x742D35cc6634c0532925a3b844Bc9E7598F0b0d8";
const ATTACKER = "0xDeAdBeEf00000000000000000000000000000000";

async function testFullFlow() {
    console.log('=== NettoAI FULL FLOW TEST ===\n');

    // 1. Parse intent dari user input (deterministic)
    const parseResult = parseUserIntent(`Send 50 USDT to ${ALICE}`, 97);
    if (!parseResult.success) throw new Error(parseResult.error);
    const intent = parseResult.intent;
    console.log('✅ Intent parsed:', intent);

    // 2. Buat tools dengan intent yang sudah diparse
    const tools = createAgentTools(intent);
    const transferTool = tools.transferUSDT;

    // 3. SIMULASI LLM memanggil tool dengan action
    // Skenario A: Legitimate (harus EXECUTED)
    console.log('\n🧪 Skenario A: Legitimate action (50 USDT to Alice)...');
    const resultA = (await transferTool.execute({
        recipient: ALICE,
        amount: 50,
        token: "USDT",
        chainId: 97,
    }, {} as any)) as any;

    console.log('Result A:', resultA);
    if (resultA.status === 'EXECUTED') {
        console.log('✅ Legitimate transaction EXECUTED. TX:', resultA.txHash);
        console.log(`   BscScan: https://testnet.bscscan.com/tx/${resultA.txHash}`);
    } else {
        console.log('❌ Legitimate transaction FAILED:', resultA);
    }

    // Skenario B: Malicious (harus BLOCKED)
    console.log('\n🧪 Skenario B: Malicious action (2000 USDT to Attacker)...');
    const resultB = (await transferTool.execute({
        recipient: ATTACKER,
        amount: 2000,
        token: "USDT",
        chainId: 97,
    }, {} as any)) as any;

    console.log('Result B:', resultB);
    if (resultB.status === 'BLOCKED') {
        console.log('✅ Malicious transaction BLOCKED by NettoAI.');
    } else {
        console.log('❌ Malicious transaction was NOT blocked:', resultB);
    }

    console.log('\n✅ Full flow test complete.');
}

testFullFlow().catch(console.error);