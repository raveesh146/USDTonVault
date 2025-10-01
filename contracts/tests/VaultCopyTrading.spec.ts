import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano, Address } from '@ton/core';
import { Vault } from '../wrappers/Vault';
import { TraderAccount } from '../wrappers/TraderAccount';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Vault Copy Trading', () => {
    let vaultCode: Cell;
    let traderCode: Cell;

    beforeAll(async () => {
        vaultCode = await compile('Vault');
        traderCode = await compile('TraderAccount');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let trader: SandboxContract<TreasuryContract>;
    let user1: SandboxContract<TreasuryContract>;
    let user2: SandboxContract<TreasuryContract>;
    let vault: SandboxContract<Vault>;
    let traderAccount: SandboxContract<TraderAccount>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        deployer = await blockchain.treasury('deployer');
        trader = await blockchain.treasury('trader');
        user1 = await blockchain.treasury('user1');
        user2 = await blockchain.treasury('user2');

        // Deploy trader account first
        traderAccount = blockchain.openContract(
            TraderAccount.createFromConfig(
                {
                    owner: trader.address,
                    vault: Address.parse('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c'), // Placeholder
                    totalTrades: 0,
                    profitBalance: 0n,
                },
                traderCode
            )
        );

        await traderAccount.sendDeploy(deployer.getSender(), toNano('0.05'));

        // Deploy vault
        vault = blockchain.openContract(
            Vault.createFromConfig(
                {
                    trader: trader.address,
                    owner: deployer.address,
                    totalShares: 0n,
                    totalAssets: 0n,
                    totalProfit: 0n,
                    isPaused: false,
                },
                vaultCode
            )
        );

        const deployResult = await vault.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: vault.address,
            deploy: true,
            success: true,
        });

        // Link vault to trader account
        await traderAccount.sendSetVault(trader.getSender(), {
            vaultAddress: vault.address,
            value: toNano('0.05'),
        });
    });

    it('should deploy vault successfully', async () => {
        const vaultData = await vault.getVaultData();
        expect(vaultData.totalShares).toBe(0n);
        expect(vaultData.totalAssets).toBe(0n);
        expect(vaultData.totalProfit).toBe(0n);
        expect(vaultData.isPaused).toBe(0);
    });

    it('should allow user to deposit', async () => {
        const depositAmount = toNano('10');

        const result = await vault.sendDeposit(user1.getSender(), {
            value: depositAmount,
        });

        expect(result.transactions).toHaveTransaction({
            from: user1.address,
            to: vault.address,
            success: true,
        });

        const vaultData = await vault.getVaultData();
        expect(vaultData.totalAssets).toBeGreaterThan(0n);
        expect(vaultData.totalShares).toBeGreaterThan(0n);

        const userShares = await vault.getUserShares(user1.address);
        expect(userShares).toBeGreaterThan(0n);
    });

    it('should calculate shares correctly for multiple deposits', async () => {
        // First deposit - 1:1 ratio
        await vault.sendDeposit(user1.getSender(), {
            value: toNano('10'),
        });

        const data1 = await vault.getVaultData();
        const shares1 = await vault.getUserShares(user1.address);

        // Second deposit - same user
        await vault.sendDeposit(user1.getSender(), {
            value: toNano('10'),
        });

        const data2 = await vault.getVaultData();
        const shares2 = await vault.getUserShares(user1.address);

        expect(shares2).toBeGreaterThan(shares1);
        expect(data2.totalAssets).toBeGreaterThan(data1.totalAssets);
    });

    it('should allow user to withdraw', async () => {
        // Deposit first
        await vault.sendDeposit(user1.getSender(), {
            value: toNano('10'),
        });

        const sharesBefore = await vault.getUserShares(user1.address);
        const sharesToWithdraw = sharesBefore / 2n;

        // Withdraw half
        const result = await vault.sendWithdraw(user1.getSender(), {
            shares: sharesToWithdraw,
            value: toNano('0.05'),
        });

        expect(result.transactions).toHaveTransaction({
            from: user1.address,
            to: vault.address,
            success: true,
        });

        const sharesAfter = await vault.getUserShares(user1.address);
        expect(sharesAfter).toBeLessThan(sharesBefore);
    });

    it('should fail withdrawal with insufficient shares', async () => {
        await vault.sendDeposit(user1.getSender(), {
            value: toNano('10'),
        });

        const userShares = await vault.getUserShares(user1.address);

        // Try to withdraw more than owned
        const result = await vault.sendWithdraw(user1.getSender(), {
            shares: userShares + 1000n,
            value: toNano('0.05'),
        });

        expect(result.transactions).toHaveTransaction({
            from: user1.address,
            to: vault.address,
            success: false,
        });
    });

    it('should handle multiple users correctly', async () => {
        // User 1 deposits
        await vault.sendDeposit(user1.getSender(), {
            value: toNano('10'),
        });

        // User 2 deposits
        await vault.sendDeposit(user2.getSender(), {
            value: toNano('5'),
        });

        const shares1 = await vault.getUserShares(user1.address);
        const shares2 = await vault.getUserShares(user2.address);

        expect(shares1).toBeGreaterThan(shares2);

        const vaultData = await vault.getVaultData();
        expect(vaultData.totalAssets).toBeGreaterThan(toNano('14')); // 10 + 5 - fees
    });

    it('should allow owner to pause vault', async () => {
        const result = await vault.sendEmergencyPause(deployer.getSender(), {
            value: toNano('0.05'),
        });

        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: vault.address,
            success: true,
        });

        const vaultData = await vault.getVaultData();
        expect(vaultData.isPaused).toBe(1);
    });

    it('should prevent deposits when paused', async () => {
        // Pause vault
        await vault.sendEmergencyPause(deployer.getSender(), {
            value: toNano('0.05'),
        });

        // Try to deposit
        const result = await vault.sendDeposit(user1.getSender(), {
            value: toNano('10'),
        });

        expect(result.transactions).toHaveTransaction({
            from: user1.address,
            to: vault.address,
            success: false,
        });
    });

    it('should allow owner to unpause vault', async () => {
        // Pause
        await vault.sendEmergencyPause(deployer.getSender(), {
            value: toNano('0.05'),
        });

        // Unpause
        await vault.sendEmergencyPause(deployer.getSender(), {
            value: toNano('0.05'),
        });

        const vaultData = await vault.getVaultData();
        expect(vaultData.isPaused).toBe(0);

        // Should be able to deposit now
        const result = await vault.sendDeposit(user1.getSender(), {
            value: toNano('10'),
        });

        expect(result.transactions).toHaveTransaction({
            from: user1.address,
            to: vault.address,
            success: true,
        });
    });

    it('should update profit correctly', async () => {
        const newProfit = toNano('5');

        const result = await vault.sendUpdateProfit(deployer.getSender(), {
            newProfit: newProfit,
            value: toNano('0.05'),
        });

        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: vault.address,
            success: true,
        });

        const totalProfit = await vault.getTotalProfit();
        expect(totalProfit).toBe(newProfit);
    });

    it('should prevent unauthorized profit updates', async () => {
        const result = await vault.sendUpdateProfit(user1.getSender(), {
            newProfit: toNano('5'),
            value: toNano('0.05'),
        });

        expect(result.transactions).toHaveTransaction({
            from: user1.address,
            to: vault.address,
            success: false,
        });
    });

    it('should allow trader to execute trades', async () => {
        const tokenAddress = Address.parse('EQD__________________________________________0vo');

        const result = await traderAccount.sendExecuteTrade(trader.getSender(), {
            tradeType: 0, // buy
            tradeAmount: toNano('1'),
            tokenAddress: tokenAddress,
            value: toNano('0.1'),
        });

        expect(result.transactions).toHaveTransaction({
            from: trader.address,
            to: traderAccount.address,
            success: true,
        });

        const traderData = await traderAccount.getTraderData();
        expect(traderData.totalTrades).toBe(1);
    });
});
