# Copy Trading Vault Contracts

## Overview

This project implements a copy trading vault system on TON blockchain where users can stake TON tokens in vaults that automatically mirror trades from designated traders.

## Contract Architecture

### 1. **Vault Contract** (`vault.fc`)

The main contract that manages user deposits, withdrawals, and coordinates copy trading.

**Key Features:**
- Users deposit TON to receive vault shares
- Share-based accounting system (similar to ERC-4626)
- Automatic trade mirroring from designated trader
- Profit tracking and proof of performance
- Emergency pause mechanism for safety
- Owner-controlled operations

**Storage:**
- `trader_address`: Address of the trader to copy
- `owner_address`: Vault owner/admin address
- `total_shares`: Total shares issued to depositors
- `total_assets`: Total TON held in vault
- `total_profit`: Cumulative profit/loss
- `is_paused`: Emergency pause flag
- `balances_dict`: User address → shares mapping
- `trade_history_dict`: Trade ID → trade details

**Operations:**
- `op_deposit (0x01)`: Deposit TON and receive shares
- `op_withdraw (0x02)`: Burn shares and withdraw TON
- `op_mirror_trade (0x03)`: Mirror a trade from trader (trader-only)
- `op_update_profit (0x04)`: Update profit metrics (trader/owner-only)
- `op_emergency_pause (0x05)`: Pause/unpause vault (owner-only)

**Getters:**
- `get_vault_data()`: Returns vault statistics
- `get_user_shares(address)`: Get user's share balance
- `get_user_balance_value(address)`: Get user's TON value
- `get_total_profit()`: Get cumulative profit

### 2. **Trader Account Contract** (`trader_account.fc`)

Represents a trader's account that emits trade events to connected vaults.

**Key Features:**
- Trader executes trades through this contract
- Automatically notifies connected vault of trades
- Tracks trade count and profit
- Owner can withdraw accumulated profits

**Storage:**
- `owner_address`: Trader's address
- `vault_address`: Connected vault address
- `total_trades`: Number of trades executed
- `profit_balance`: Accumulated profit

**Operations:**
- `op_execute_trade (0x10)`: Execute a trade and notify vault
- `op_set_vault (0x11)`: Set/update connected vault address
- `op_withdraw_profit (0x12)`: Withdraw accumulated profit

**Getters:**
- `get_trader_data()`: Returns all trader data
- `get_total_trades()`: Get trade count
- `get_profit_balance()`: Get profit balance

### 3. **Trade Logger Contract** (`trade_logger.fc`)

Records all trades for historical tracking and proof of profits.

**Key Features:**
- Immutable trade history
- Performance metrics tracking
- Proof of profit/loss for transparency
- Query individual trades by ID

**Storage:**
- `vault_address`: Associated vault
- `trader_address`: Associated trader
- `trade_count`: Total trades logged
- `total_volume`: Cumulative trade volume
- `total_pnl`: Total profit/loss
- `trades_dict`: Trade ID → trade details

**Operations:**
- `op_log_trade (0x20)`: Log a new trade
- `op_update_performance (0x21)`: Update performance metrics

**Getters:**
- `get_performance_stats()`: Get overall performance
- `get_trade_by_id(id)`: Get specific trade details
- `get_trade_count()`: Get total trades
- `get_total_pnl()`: Get total P&L
- `get_addresses()`: Get vault and trader addresses

## System Flow

### Deposit Flow
1. User sends TON to Vault with `op_deposit`
2. Vault calculates shares based on current ratio
3. User receives shares proportional to deposit
4. Shares represent ownership in vault's assets

### Trade Execution Flow
1. Trader executes trade via TraderAccount contract
2. TraderAccount emits trade event to Vault
3. Vault receives `op_mirror_trade` message
4. Vault stores trade in history
5. (Future) Vault executes same trade on DEX
6. TradeLogger records trade for proof

### Withdrawal Flow
1. User sends `op_withdraw` with shares to burn
2. Vault calculates TON amount based on share ratio
3. Vault burns user's shares
4. Vault sends TON back to user
5. Total shares and assets updated

## MVP Limitations

For the MVP, the following are simplified:
- **No actual DEX integration**: Trades are logged but not executed
- **Single vault**: System designed for one vault initially
- **Manual profit updates**: Profits must be manually updated
- **Basic event system**: Uses direct messages instead of sophisticated event system

## Future Enhancements

1. **DEX Integration**: Integrate with TON DEX (DeDust, STON.fi) for actual trade execution
2. **Multiple Vaults**: Factory contract to create multiple vaults
3. **Advanced Risk Management**: Stop-loss, position limits, drawdown protection
4. **Automated Profit Calculation**: Oracle-based profit tracking
5. **Fee System**: Performance fees and management fees
6. **Governance**: DAO for vault parameter changes
7. **Cross-chain**: Bridge to other chains

## Deployment Guide

### 1. Deploy Vault
```typescript
const vault = Vault.createFromConfig({
    trader: traderAddress,
    owner: ownerAddress,
    totalShares: 0n,
    totalAssets: 0n,
    totalProfit: 0n,
    isPaused: false,
}, code);
```

### 2. Deploy Trader Account
```typescript
const trader = TraderAccount.createFromConfig({
    owner: traderAddress,
    vault: vaultAddress,
    totalTrades: 0,
    profitBalance: 0n,
}, code);
```

### 3. Deploy Trade Logger
```typescript
const logger = TradeLogger.createFromConfig({
    vault: vaultAddress,
    trader: traderAddress,
    tradeCount: 0,
    totalVolume: 0n,
    totalPnl: 0n,
}, code);
```

## Testing

Run tests with:
```bash
npm test
```

## Security Considerations

1. **Access Control**: Only authorized addresses can execute critical operations
2. **Emergency Pause**: Owner can pause vault in case of issues
3. **Share-based Accounting**: Prevents inflation attacks
4. **Reentrancy Protection**: FunC's execution model prevents reentrancy
5. **Integer Overflow**: Use `muldiv` for safe arithmetic

## License

MIT
