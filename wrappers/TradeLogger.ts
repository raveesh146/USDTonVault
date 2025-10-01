import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type TradeLoggerConfig = {
    vault: Address;
    trader: Address;
    tradeCount: number;
    totalVolume: bigint;
    totalPnl: bigint;
};

export function tradeLoggerConfigToCell(config: TradeLoggerConfig): Cell {
    return beginCell()
        .storeAddress(config.vault)
        .storeAddress(config.trader)
        .storeUint(config.tradeCount, 32)
        .storeCoins(config.totalVolume)
        .storeCoins(config.totalPnl)
        .storeDict(null)
        .endCell();
}

export const TradeLoggerOpcodes = {
    logTrade: 0x20,
    updatePerformance: 0x21,
};

export class TradeLogger implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new TradeLogger(address);
    }

    static createFromConfig(config: TradeLoggerConfig, code: Cell, workchain = 0) {
        const data = tradeLoggerConfigToCell(config);
        const init = { code, data };
        return new TradeLogger(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendLogTrade(
        provider: ContractProvider,
        via: Sender,
        opts: {
            timestamp: number;
            tradeType: number; // 0=buy, 1=sell
            tradeAmount: bigint;
            tokenAddress: Address;
            pnl: bigint;
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(TradeLoggerOpcodes.logTrade, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(opts.timestamp, 32)
                .storeUint(opts.tradeType, 8)
                .storeCoins(opts.tradeAmount)
                .storeAddress(opts.tokenAddress)
                .storeCoins(opts.pnl)
                .endCell(),
        });
    }

    async sendUpdatePerformance(
        provider: ContractProvider,
        via: Sender,
        opts: {
            newPnl: bigint;
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(TradeLoggerOpcodes.updatePerformance, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeCoins(opts.newPnl)
                .endCell(),
        });
    }

    async getPerformanceStats(provider: ContractProvider) {
        const result = await provider.get('get_performance_stats', []);
        return {
            tradeCount: result.stack.readNumber(),
            totalVolume: result.stack.readBigNumber(),
            totalPnl: result.stack.readBigNumber(),
        };
    }

    async getTradeById(provider: ContractProvider, tradeId: number) {
        const result = await provider.get('get_trade_by_id', [{ type: 'int', value: BigInt(tradeId) }]);
        return {
            timestamp: result.stack.readNumber(),
            tradeType: result.stack.readNumber(),
            tradeAmount: result.stack.readBigNumber(),
            tokenAddress: result.stack.readAddress(),
            pnl: result.stack.readBigNumber(),
        };
    }

    async getTradeCount(provider: ContractProvider) {
        const result = await provider.get('get_trade_count', []);
        return result.stack.readNumber();
    }

    async getTotalPnl(provider: ContractProvider) {
        const result = await provider.get('get_total_pnl', []);
        return result.stack.readBigNumber();
    }

    async getAddresses(provider: ContractProvider) {
        const result = await provider.get('get_addresses', []);
        return {
            vault: result.stack.readAddress(),
            trader: result.stack.readAddress(),
        };
    }
}
