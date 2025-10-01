import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type TraderAccountConfig = {
    owner: Address;
    vault: Address;
    totalTrades: number;
    profitBalance: bigint;
};

export function traderAccountConfigToCell(config: TraderAccountConfig): Cell {
    return beginCell()
        .storeAddress(config.owner)
        .storeAddress(config.vault)
        .storeUint(config.totalTrades, 32)
        .storeCoins(config.profitBalance)
        .endCell();
}

export const TraderOpcodes = {
    executeTrade: 0x10,
    setVault: 0x11,
    withdrawProfit: 0x12,
};

export class TraderAccount implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new TraderAccount(address);
    }

    static createFromConfig(config: TraderAccountConfig, code: Cell, workchain = 0) {
        const data = traderAccountConfigToCell(config);
        const init = { code, data };
        return new TraderAccount(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendExecuteTrade(
        provider: ContractProvider,
        via: Sender,
        opts: {
            tradeType: number; // 0=buy, 1=sell
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
                .storeUint(TraderOpcodes.executeTrade, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(opts.tradeType, 8)
                .storeCoins(opts.tradeAmount)
                .storeAddress(opts.tokenAddress)
                .endCell(),
        });
    }

    async sendSetVault(
        provider: ContractProvider,
        via: Sender,
        opts: {
            vaultAddress: Address;
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(TraderOpcodes.setVault, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeAddress(opts.vaultAddress)
                .endCell(),
        });
    }

    async sendWithdrawProfit(
        provider: ContractProvider,
        via: Sender,
        opts: {
            amount: bigint;
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(TraderOpcodes.withdrawProfit, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeCoins(opts.amount)
                .endCell(),
        });
    }

    async getTraderData(provider: ContractProvider) {
        const result = await provider.get('get_trader_data', []);
        return {
            owner: result.stack.readAddress(),
            vault: result.stack.readAddress(),
            totalTrades: result.stack.readNumber(),
            profitBalance: result.stack.readBigNumber(),
        };
    }

    async getTotalTrades(provider: ContractProvider) {
        const result = await provider.get('get_total_trades', []);
        return result.stack.readNumber();
    }

    async getProfitBalance(provider: ContractProvider) {
        const result = await provider.get('get_profit_balance', []);
        return result.stack.readBigNumber();
    }
}
