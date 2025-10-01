import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type VaultConfig = {
    trader: Address;
    owner: Address;
    totalShares: bigint;
    totalAssets: bigint;
    totalProfit: bigint;
    isPaused: boolean;
};

export function vaultConfigToCell(config: VaultConfig): Cell {
    return beginCell()
        .storeAddress(config.trader)
        .storeAddress(config.owner)
        .storeUint(config.totalShares, 64)
        .storeCoins(config.totalAssets)
        .storeCoins(config.totalProfit)
        .storeUint(config.isPaused ? 1 : 0, 1)
        .storeDict(null)
        .storeDict(null)
        .endCell();
}

export const Opcodes = {
    deposit: 0x01,
    withdraw: 0x02,
    mirrorTrade: 0x03,
    updateProfit: 0x04,
    emergencyPause: 0x05,
};

export class Vault implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Vault(address);
    }

    static createFromConfig(config: VaultConfig, code: Cell, workchain = 0) {
        const data = vaultConfigToCell(config);
        const init = { code, data };
        return new Vault(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendDeposit(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.deposit, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .endCell(),
        });
    }

    async sendWithdraw(
        provider: ContractProvider,
        via: Sender,
        opts: {
            shares: bigint;
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.withdraw, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(opts.shares, 64)
                .endCell(),
        });
    }

    async sendMirrorTrade(
        provider: ContractProvider,
        via: Sender,
        opts: {
            tradeType: number;
            tradeAmount: bigint;
            tokenAddress: Address;
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.mirrorTrade, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(opts.tradeType, 8)
                .storeCoins(opts.tradeAmount)
                .storeAddress(opts.tokenAddress)
                .endCell(),
        });
    }

    async sendUpdateProfit(
        provider: ContractProvider,
        via: Sender,
        opts: {
            newProfit: bigint;
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.updateProfit, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeCoins(opts.newProfit)
                .endCell(),
        });
    }

    async sendEmergencyPause(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.emergencyPause, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .endCell(),
        });
    }

    async getVaultData(provider: ContractProvider) {
        const result = await provider.get('get_vault_data', []);
        return {
            totalShares: result.stack.readBigNumber(),
            totalAssets: result.stack.readBigNumber(),
            totalProfit: result.stack.readBigNumber(),
            isPaused: result.stack.readNumber(),
            trader: result.stack.readAddress(),
            owner: result.stack.readAddress(),
        };
    }

    async getUserShares(provider: ContractProvider, userAddress: Address) {
        const result = await provider.get('get_user_shares', [{ type: 'slice', cell: beginCell().storeAddress(userAddress).endCell() }]);
        return result.stack.readBigNumber();
    }

    async getUserBalanceValue(provider: ContractProvider, userAddress: Address) {
        const result = await provider.get('get_user_balance_value', [{ type: 'slice', cell: beginCell().storeAddress(userAddress).endCell() }]);
        return result.stack.readBigNumber();
    }

    async getTotalProfit(provider: ContractProvider) {
        const result = await provider.get('get_total_profit', []);
        return result.stack.readBigNumber();
    }
}
