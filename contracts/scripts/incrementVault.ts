import { Address, toNano } from '@ton/core';
import { Vault } from '../wrappers/Vault';
import { NetworkProvider, sleep } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Vault address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const vault = provider.open(Vault.createFromAddress(address));

    // Deposit TON to vault
    const depositAmount = toNano('1.0'); // 1 TON
    
    const dataBefore = await vault.getVaultData();
    ui.write(`Total assets before: ${dataBefore.totalAssets}`);
    ui.write(`Total shares before: ${dataBefore.totalShares}`);

    await vault.sendDeposit(provider.sender(), {
        value: depositAmount,
    });

    ui.write('Waiting for deposit to complete...');

    let dataAfter = await vault.getVaultData();
    let attempt = 1;
    while (dataAfter.totalAssets === dataBefore.totalAssets) {
        ui.setActionPrompt(`Attempt ${attempt}`);
        await sleep(2000);
        dataAfter = await vault.getVaultData();
        attempt++;
    }

    ui.clearActionPrompt();
    ui.write('Deposit successful!');
    ui.write(`Total assets after: ${dataAfter.totalAssets}`);
    ui.write(`Total shares after: ${dataAfter.totalShares}`);
}
