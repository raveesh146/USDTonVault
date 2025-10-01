// Contract Operation Codes
export const VaultOpcodes = {
    deposit: 0x01,
    withdraw: 0x02,
    mirrorTrade: 0x03,
    updateProfit: 0x04,
    emergencyPause: 0x05,
} as const;

export const TraderOpcodes = {
    executeTrade: 0x10,
    setVault: 0x11,
    withdrawProfit: 0x12,
} as const;

export const LoggerOpcodes = {
    logTrade: 0x20,
    updatePerformance: 0x21,
} as const;

// Error Codes
export const VaultErrors = {
    insufficientBalance: 101,
    invalidAmount: 102,
    unauthorized: 103,
    paused: 104,
} as const;

export const TraderErrors = {
    unauthorized: 201,
    invalidTrade: 202,
} as const;

export const LoggerErrors = {
    unauthorized: 301,
} as const;

// Trade Types
export const TradeType = {
    BUY: 0,
    SELL: 1,
} as const;

// Gas Estimates (in nanoTON)
export const GasEstimates = {
    deploy: '50000000', // 0.05 TON
    deposit: '20000000', // 0.02 TON
    withdraw: '30000000', // 0.03 TON
    executeTrade: '100000000', // 0.1 TON
    updateProfit: '10000000', // 0.01 TON
    emergencyPause: '10000000', // 0.01 TON
} as const;

// Contract Names
export const ContractNames = {
    VAULT: 'Vault',
    TRADER_ACCOUNT: 'TraderAccount',
    TRADE_LOGGER: 'TradeLogger',
} as const;

// Helper function to get operation name
export function getOperationName(opcode: number): string {
    const allOpcodes = {
        ...VaultOpcodes,
        ...TraderOpcodes,
        ...LoggerOpcodes,
    };
    
    for (const [name, code] of Object.entries(allOpcodes)) {
        if (code === opcode) {
            return name;
        }
    }
    
    return `Unknown(0x${opcode.toString(16)})`;
}

// Helper function to get error name
export function getErrorName(errorCode: number): string {
    const allErrors = {
        ...VaultErrors,
        ...TraderErrors,
        ...LoggerErrors,
    };
    
    for (const [name, code] of Object.entries(allErrors)) {
        if (code === errorCode) {
            return name;
        }
    }
    
    return `Unknown(${errorCode})`;
}
