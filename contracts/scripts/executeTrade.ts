import { Address, toNano } from '@ton/core';
import { TraderAccount } from '../wrappers/TraderAccount';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Trader Account address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const traderAccount = provider.open(TraderAccount.createFromAddress(address));

    // Get trader data
    const traderData = await traderAccount.getTraderData();
    ui.write('\n=== Trader Account Data ===');
    ui.write(`Owner: ${traderData.owner}`);
    ui.write(`Vault: ${traderData.vault}`);
    ui.write(`Total Trades: ${traderData.totalTrades}`);
    ui.write(`Profit Balance: ${traderData.profitBalance} nanoTON`);

    // Ask what action to perform
    const action = await ui.choose('What would you like to do?', 
        ['Execute Trade', 'Set Vault', 'Withdraw Profit', 'View Only'], 
        (c) => c
    );

    if (action === 'Execute Trade') {
        const tradeTypeStr = await ui.choose('Trade type?', ['Buy', 'Sell'], (c) => c);
        const tradeType = tradeTypeStr === 'Buy' ? 0 : 1;
        
        const amountStr = await ui.input('Enter trade amount (in TON):');
        const amount = toNano(amountStr);
        
        const tokenAddressStr = await ui.input('Enter token address:');
        const tokenAddress = Address.parse(tokenAddressStr);
        
        await traderAccount.sendExecuteTrade(provider.sender(), {
            tradeType: tradeType,
            tradeAmount: amount,
            tokenAddress: tokenAddress,
            value: toNano('0.1'),
        });
        
        ui.write(`Executing ${tradeTypeStr.toLowerCase()} trade for ${amountStr} TON...`);
        ui.write('This will notify the connected vault to mirror the trade.');
        
    } else if (action === 'Set Vault') {
        const vaultAddressStr = await ui.input('Enter vault address:');
        const vaultAddress = Address.parse(vaultAddressStr);
        
        await traderAccount.sendSetVault(provider.sender(), {
            vaultAddress: vaultAddress,
            value: toNano('0.05'),
        });
        
        ui.write(`Setting vault to ${vaultAddressStr}...`);
        
    } else if (action === 'Withdraw Profit') {
        const amountStr = await ui.input('Enter amount to withdraw (in TON):');
        const amount = toNano(amountStr);
        
        if (amount > traderData.profitBalance) {
            ui.write('Error: Insufficient profit balance!');
            return;
        }
        
        await traderAccount.sendWithdrawProfit(provider.sender(), {
            amount: amount,
            value: toNano('0.05'),
        });
        
        ui.write(`Withdrawing ${amountStr} TON profit...`);
    }
}
