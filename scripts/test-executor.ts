// scripts/test-executor.ts
import 'dotenv/config';
import { getAddress } from 'viem'; // ✅ import getAddress
import { executeTransfer } from '../lib/blockchain/executor';

// ✅ Gunakan getAddress untuk validasi checksum
const ALICE = getAddress("0x742d35Cc6634C0532925a3b844Bc9e7598f0b0d8");

async function test() {
    console.log('🧪 Testing executor with real transaction...\n');
    console.log(`   Sending to: ${ALICE}`);

    const result = await executeTransfer({
        recipient: ALICE,
        amount: 0.01,
        token: "USDT",
        chainId: 97,
    });

    console.log('Result:', result);
    if (result.success) {
        console.log(`\n✅ Transaction successful!`);
        console.log(`   TX Hash: ${result.txHash}`);
        console.log(`   Block: ${result.blockNumber}`);
        console.log(`   BscScan: https://testnet.bscscan.com/tx/${result.txHash}`);
    } else {
        console.log(`\n❌ Transaction failed: ${result.error}`);
    }
}

test().catch(console.error);