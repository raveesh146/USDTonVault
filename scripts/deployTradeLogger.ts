import { toNano, Address } from '@ton/core';
import { TradeLogger } from '../wrappers/TradeLogger';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    // Get vault and trader addresses
    const ui = provider.ui();
    const vaultAddressStr = await ui.input('Enter vault address:');
    const vaultAddress = Address.parse(vaultAddressStr);
    
    const traderAddressStr = await ui.input('Enter trader address:');
    const traderAddress = Address.parse(traderAddressStr);
    
    const tradeLogger = provider.open(
        TradeLogger.createFromConfig(
            {
                vault: vaultAddress,
                trader: traderAddress,
                tradeCount: 0,
                totalVolume: 0n,
                totalPnl: 0n,
            },
            await compile('TradeLogger')
        )
    );

    await tradeLogger.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(tradeLogger.address);

    console.log('TradeLogger deployed at:', tradeLogger.address);
    const stats = await tradeLogger.getPerformanceStats();
    console.log('Initial stats:', stats);
}
