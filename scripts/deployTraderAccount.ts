import { toNano, Address } from '@ton/core';
import { TraderAccount } from '../wrappers/TraderAccount';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    // Get vault address
    const ui = provider.ui();
    const vaultAddressStr = await ui.input('Enter vault address (or leave empty for none):');
    const vaultAddress = vaultAddressStr ? Address.parse(vaultAddressStr) : Address.parse('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c');
    
    const ownerAddress = provider.sender().address!;
    
    const traderAccount = provider.open(
        TraderAccount.createFromConfig(
            {
                owner: ownerAddress,
                vault: vaultAddress,
                totalTrades: 0,
                profitBalance: 0n,
            },
            await compile('TraderAccount')
        )
    );

    await traderAccount.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(traderAccount.address);

    console.log('TraderAccount deployed at:', traderAccount.address);
    const traderData = await traderAccount.getTraderData();
    console.log('Trader data:', traderData);
}
