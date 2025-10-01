import { toNano, Address, beginCell } from '@ton/core';
import { mnemonicToWalletKey } from '@ton/crypto';
import { TonClient, WalletContractV4, internal } from '@ton/ton';
import { TraderAccount } from '../wrappers/TraderAccount';
import { Vault } from '../wrappers/Vault';
import { TradeLogger } from '../wrappers/TradeLogger';
import { compile } from '@ton/blueprint';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config();

async function main() {
    // Load mnemonic from environment
    const mnemonic = process.env.MNEMONIC;
    if (!mnemonic) {
        console.error('❌ MNEMONIC not found in .env file');
        console.log('Please create a .env file with your mnemonic:');
        console.log('MNEMONIC="word1 word2 word3 ... word24"');
        process.exit(1);
    }

    const mnemonicArray = mnemonic.split(' ');
    if (mnemonicArray.length !== 24) {
        console.error('❌ Invalid mnemonic. Must be 24 words.');
        process.exit(1);
    }

    // Get network from env or default to testnet
    const network = process.env.NETWORK || 'testnet';
    const endpoint = network === 'mainnet' 
        ? 'https://toncenter.com/api/v2/jsonRPC'
        : 'https://testnet.toncenter.com/api/v2/jsonRPC';

    console.log(`🌐 Using network: ${network}`);
    console.log(`📡 Endpoint: ${endpoint}\n`);

    // Initialize TON client
    const client = new TonClient({ endpoint });

    // Create wallet from mnemonic
    const key = await mnemonicToWalletKey(mnemonicArray);
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
    const contract = client.open(wallet);

    // Get wallet balance
    const balance = await contract.getBalance();
    console.log(`💰 Wallet address: ${wallet.address}`);
    console.log(`💰 Balance: ${balance / 1000000000n} TON\n`);

    if (balance < toNano('0.5')) {
        console.error('❌ Insufficient balance. Need at least 0.5 TON for deployment.');
        console.log('Please fund your wallet and try again.');
        process.exit(1);
    }

    // Ask what to deploy
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (query: string): Promise<string> => {
        return new Promise(resolve => readline.question(query, resolve));
    };

    console.log('What would you like to deploy?');
    console.log('1. TraderAccount');
    console.log('2. Vault');
    console.log('3. TradeLogger');
    console.log('4. All contracts (in order)\n');

    const choice = await question('Enter your choice (1-4): ');

    let traderAccountAddress: Address | null = null;
    let vaultAddress: Address | null = null;

    switch (choice.trim()) {
        case '1':
            traderAccountAddress = await deployTraderAccount(client, wallet, key);
            break;
        case '2':
            const traderAddr = await question('Enter TraderAccount address: ');
            vaultAddress = await deployVault(client, wallet, key, Address.parse(traderAddr));
            break;
        case '3':
            const vAddr = await question('Enter Vault address: ');
            const tAddr = await question('Enter TraderAccount address: ');
            await deployTradeLogger(client, wallet, key, Address.parse(vAddr), Address.parse(tAddr));
            break;
        case '4':
            console.log('\n🚀 Deploying all contracts...\n');
            traderAccountAddress = await deployTraderAccount(client, wallet, key);
            if (traderAccountAddress) {
                vaultAddress = await deployVault(client, wallet, key, traderAccountAddress);
                if (vaultAddress && traderAccountAddress) {
                    await deployTradeLogger(client, wallet, key, vaultAddress, traderAccountAddress);
                }
            }
            break;
        default:
            console.log('❌ Invalid choice');
    }

    readline.close();
    console.log('\n✅ Deployment complete!');
}

async function deployTraderAccount(
    client: TonClient,
    wallet: WalletContractV4,
    key: any
): Promise<Address | null> {
    console.log('\n📦 Deploying TraderAccount...');
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const vaultInput = await new Promise<string>(resolve => {
        rl.question('Enter vault address (or press Enter to skip): ', (answer: string) => {
            rl.close();
            resolve(answer);
        });
    });

    const vaultAddress = vaultInput 
        ? Address.parse(vaultInput)
        : Address.parse('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c');

    const traderAccount = TraderAccount.createFromConfig(
        {
            owner: wallet.address,
            vault: vaultAddress,
            totalTrades: 0,
            profitBalance: 0n,
        },
        await compile('TraderAccount')
    );

    const openedTrader = client.open(traderAccount);
    
    // Send deploy transaction
    const seqno = await client.open(wallet).getSeqno();
    await client.open(wallet).sendTransfer({
        secretKey: key.secretKey,
        seqno: seqno,
        messages: [
            internal({
                to: openedTrader.address,
                value: toNano('0.05'),
                init: traderAccount.init,
                body: beginCell().endCell(),
            })
        ]
    });

    console.log('⏳ Waiting for deployment...');
    
    // Wait for deployment
    let attempts = 0;
    while (attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
            const state = await client.getContractState(openedTrader.address);
            if (state.state === 'active') {
                console.log('✅ TraderAccount deployed at:', openedTrader.address.toString());
                return openedTrader.address;
            }
        } catch (e) {
            // Continue waiting
        }
        attempts++;
    }

    console.log('❌ Deployment timeout');
    return null;
}

async function deployVault(
    client: TonClient,
    wallet: WalletContractV4,
    key: any,
    traderAddress: Address
): Promise<Address | null> {
    console.log('\n📦 Deploying Vault...');

    const vault = Vault.createFromConfig(
        {
            trader: traderAddress,
            owner: wallet.address,
            totalShares: 0n,
            totalAssets: 0n,
            totalProfit: 0n,
            isPaused: false,
        },
        await compile('Vault')
    );

    const openedVault = client.open(vault);
    
    const seqno = await client.open(wallet).getSeqno();
    await client.open(wallet).sendTransfer({
        secretKey: key.secretKey,
        seqno: seqno,
        messages: [
            internal({
                to: openedVault.address,
                value: toNano('0.05'),
                init: vault.init,
                body: beginCell().endCell(),
            })
        ]
    });

    console.log('⏳ Waiting for deployment...');
    
    let attempts = 0;
    while (attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
            const state = await client.getContractState(openedVault.address);
            if (state.state === 'active') {
                console.log('✅ Vault deployed at:', openedVault.address.toString());
                return openedVault.address;
            }
        } catch (e) {
            // Continue waiting
        }
        attempts++;
    }

    console.log('❌ Deployment timeout');
    return null;
}

async function deployTradeLogger(
    client: TonClient,
    wallet: WalletContractV4,
    key: any,
    vaultAddress: Address,
    traderAddress: Address
): Promise<Address | null> {
    console.log('\n📦 Deploying TradeLogger...');

    const tradeLogger = TradeLogger.createFromConfig(
        {
            vault: vaultAddress,
            trader: traderAddress,
            tradeCount: 0,
            totalVolume: 0n,
            totalPnl: 0n,
        },
        await compile('TradeLogger')
    );

    const openedLogger = client.open(tradeLogger);
    
    const seqno = await client.open(wallet).getSeqno();
    await client.open(wallet).sendTransfer({
        secretKey: key.secretKey,
        seqno: seqno,
        messages: [
            internal({
                to: openedLogger.address,
                value: toNano('0.05'),
                init: tradeLogger.init,
                body: beginCell().endCell(),
            })
        ]
    });

    console.log('⏳ Waiting for deployment...');
    
    let attempts = 0;
    while (attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
            const state = await client.getContractState(openedLogger.address);
            if (state.state === 'active') {
                console.log('✅ TradeLogger deployed at:', openedLogger.address.toString());
                return openedLogger.address;
            }
        } catch (e) {
            // Continue waiting
        }
        attempts++;
    }

    console.log('❌ Deployment timeout');
    return null;
}

main().catch(console.error);
