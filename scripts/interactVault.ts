import { Address, toNano } from '@ton/core';
import { Vault } from '../wrappers/Vault';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Vault address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const vault = provider.open(Vault.createFromAddress(address));

    // Get vault data
    const vaultData = await vault.getVaultData();
    ui.write('\n=== Vault Data ===');
    ui.write(`Trader: ${vaultData.trader}`);
    ui.write(`Owner: ${vaultData.owner}`);
    ui.write(`Total Shares: ${vaultData.totalShares}`);
    ui.write(`Total Assets: ${vaultData.totalAssets}`);
    ui.write(`Total Profit: ${vaultData.totalProfit}`);
    ui.write(`Is Paused: ${vaultData.isPaused === 1 ? 'Yes' : 'No'}`);

    // Get user balance
    const userAddress = provider.sender().address!;
    const userShares = await vault.getUserShares(userAddress);
    const userValue = await vault.getUserBalanceValue(userAddress);
    
    ui.write('\n=== Your Position ===');
    ui.write(`Your Shares: ${userShares}`);
    ui.write(`Your Value: ${userValue} nanoTON`);

    // Ask what action to perform
    const action = await ui.choose('What would you like to do?', ['Deposit', 'Withdraw', 'View Only'], (c) => c);

    if (action === 'Deposit') {
        const amountStr = await ui.input('Enter amount to deposit (in TON):');
        const amount = toNano(amountStr);
        
        await vault.sendDeposit(provider.sender(), {
            value: amount,
        });
        
        ui.write(`Depositing ${amountStr} TON...`);
    } else if (action === 'Withdraw') {
        const sharesStr = await ui.input('Enter shares to withdraw:');
        const shares = BigInt(sharesStr);
        
        if (shares > userShares) {
            ui.write('Error: Insufficient shares!');
            return;
        }
        
        await vault.sendWithdraw(provider.sender(), {
            shares: shares,
            value: toNano('0.05'),
        });
        
        ui.write(`Withdrawing ${sharesStr} shares...`);
    }
}
