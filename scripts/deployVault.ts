import { toNano, Address } from '@ton/core';
import { Vault } from '../wrappers/Vault';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    // Get trader and owner addresses
    const ui = provider.ui();
    const traderAddressStr = await ui.input('Enter trader address:');
    const traderAddress = Address.parse(traderAddressStr);
    
    const ownerAddress = provider.sender().address!;
    
    const vault = provider.open(
        Vault.createFromConfig(
            {
                trader: traderAddress,
                owner: ownerAddress,
                totalShares: 0n,
                totalAssets: 0n,
                totalProfit: 0n,
                isPaused: false,
            },
            await compile('Vault')
        )
    );

    await vault.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(vault.address);

    console.log('Vault deployed at:', vault.address);
    const vaultData = await vault.getVaultData();
    console.log('Vault data:', vaultData);
}
