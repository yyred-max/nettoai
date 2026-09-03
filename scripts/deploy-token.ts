import 'dotenv/config';
import { parseEther } from 'viem';
import { publicClient, walletClient } from '../lib/blockchain/executor';
// ✅ Ganti import ke ERC20PresetMinterPauser
import ERC20PresetMinterPauser from '@openzeppelin/contracts/build/contracts/ERC20PresetMinterPauser.json';

const NAME = 'Guardian Test USDT';
const SYMBOL = 'gUSDT';
const INITIAL_SUPPLY = parseEther('1000000'); // 1 juta token

async function deploy() {
    console.log('🚀 Deploying Guardian Test USDT (PresetMinterPauser)...');
    console.log(`   Name: ${NAME}`);
    console.log(`   Symbol: ${SYMBOL}`);
    console.log(`   Initial Supply (to be minted): ${INITIAL_SUPPLY.toString()}`);

    // 1. Deploy contract dengan name dan symbol (2 params)
    const hash = await walletClient.deployContract({
        abi: ERC20PresetMinterPauser.abi,
        bytecode: ERC20PresetMinterPauser.bytecode as `0x${string}`,
        args: [NAME, SYMBOL], // ✅ Hanya 2 parameter
        account: walletClient.account!,
    });

    console.log(`   Deployment tx hash: ${hash}`);

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const tokenAddress = receipt.contractAddress!;
    console.log(`✅ Deployed at: ${tokenAddress}`);
    console.log(`   Block: ${receipt.blockNumber}`);

    // 2. Mint initial supply ke deployer
    console.log('\n🪙 Minting initial supply to deployer...');
    const { request } = await publicClient.simulateContract({
        address: tokenAddress,
        abi: ERC20PresetMinterPauser.abi,
        functionName: 'mint',
        args: [walletClient.account!.address, INITIAL_SUPPLY],
        account: walletClient.account!,
    });

    const mintHash = await walletClient.writeContract(request);
    const mintReceipt = await publicClient.waitForTransactionReceipt({ hash: mintHash });
    console.log(`✅ Minted ${INITIAL_SUPPLY.toString()} tokens`);
    console.log(`   Mint tx: ${mintHash}`);

    console.log('\n📝 Add this to your .env.local:');
    console.log(`TOKEN_ADDRESS=${tokenAddress}`);
}

deploy().catch(console.error);