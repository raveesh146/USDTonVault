# Copy Trading Vault - System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Copy Trading Vault System                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Users      │         │   Trader     │         │    Owner     │
│  (Investors) │         │              │         │   (Admin)    │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       │ Deposit/Withdraw       │ Execute Trades         │ Manage
       │                        │                        │
       ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                         VAULT CONTRACT                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Storage:                                                    │ │
│  │ - trader_address                                           │ │
│  │ - owner_address                                            │ │
│  │ - total_shares (share-based accounting)                   │ │
│  │ - total_assets (TON balance)                              │ │
│  │ - total_profit (P&L tracking)                             │ │
│  │ - is_paused (emergency control)                           │ │
│  │ - balances_dict (user → shares)                           │ │
│  │ - trade_history_dict (trade logs)                         │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────┬───────────────────────────▲───────────────────┘
                  │                           │
                  │ Mirror Trade Event        │ Trade Notification
                  │                           │
                  ▼                           │
┌─────────────────────────────────────────────┴───────────────────┐
│                    TRADER ACCOUNT CONTRACT                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Storage:                                                    │ │
│  │ - owner_address (trader)                                   │ │
│  │ - vault_address (connected vault)                          │ │
│  │ - total_trades (counter)                                   │ │
│  │ - profit_balance (accumulated profit)                      │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ Log Trade
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TRADE LOGGER CONTRACT                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Storage:                                                    │ │
│  │ - vault_address                                            │ │
│  │ - trader_address                                           │ │
│  │ - trade_count                                              │ │
│  │ - total_volume                                             │ │
│  │ - total_pnl                                                │ │
│  │ - trades_dict (immutable history)                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Deposit Flow

```
User                    Vault Contract
 │                           │
 │─── Deposit TON ──────────▶│
 │    (op_deposit)           │
 │                           │─── Calculate Shares
 │                           │    (based on ratio)
 │                           │
 │                           │─── Update Storage
 │                           │    - Add shares to user
 │                           │    - Increase total_shares
 │                           │    - Increase total_assets
 │                           │
 │◀─── Confirmation ─────────│
```

### 2. Trade Execution & Mirroring Flow

```
Trader              TraderAccount           Vault              DEX (Future)
  │                      │                    │                     │
  │─ Execute Trade ─────▶│                    │                     │
  │   (op_execute_trade) │                    │                     │
  │                      │                    │                     │
  │                      │─── Emit Event ────▶│                     │
  │                      │   (op_mirror_trade)│                     │
  │                      │                    │                     │
  │                      │─── Update Counter  │─── Store Trade ────│
  │                      │                    │    in History       │
  │                      │                    │                     │
  │                      │                    │─── Execute Trade ──▶│
  │                      │                    │    (Future MVP)     │
  │                      │                    │                     │
  │◀──── Confirmation ───│◀──── Success ──────│◀──── Result ────────│
```

### 3. Withdrawal Flow

```
User                    Vault Contract
 │                           │
 │─── Withdraw Request ─────▶│
 │    (shares to burn)       │
 │                           │─── Validate Shares
 │                           │    (user has enough?)
 │                           │
 │                           │─── Calculate TON Amount
 │                           │    (shares × total_assets / total_shares)
 │                           │
 │                           │─── Update Storage
 │                           │    - Burn user shares
 │                           │    - Decrease total_shares
 │                           │    - Decrease total_assets
 │                           │
 │◀─── Send TON ─────────────│
 │                           │
 │◀─── Confirmation ─────────│
```

## Share-Based Accounting

The vault uses a share-based system similar to ERC-4626:

```
First Deposit:
  shares = deposit_amount (1:1 ratio)

Subsequent Deposits:
  shares = (deposit_amount × total_shares) / total_assets

Withdrawal:
  amount = (shares_to_burn × total_assets) / total_shares

User Value:
  value = (user_shares × total_assets) / total_shares
```

### Example Scenario:

```
Initial State:
  total_shares = 0
  total_assets = 0 TON

User A deposits 10 TON:
  shares_A = 10 TON (1:1)
  total_shares = 10
  total_assets = 10 TON

Vault makes profit of 2 TON:
  total_shares = 10 (unchanged)
  total_assets = 12 TON

User B deposits 6 TON:
  shares_B = (6 × 10) / 12 = 5
  total_shares = 15
  total_assets = 18 TON

User A's value:
  value_A = (10 × 18) / 15 = 12 TON (2 TON profit)

User B's value:
  value_B = (5 × 18) / 15 = 6 TON (no profit yet)
```

## Security Model

### Access Control Matrix

| Operation          | User | Trader | Owner | Anyone |
|-------------------|------|--------|-------|--------|
| Deposit           | ✓    | ✓      | ✓     | ✓      |
| Withdraw          | ✓    | ✓      | ✓     | ✓      |
| Mirror Trade      | ✗    | ✓      | ✗     | ✗      |
| Update Profit     | ✗    | ✓      | ✓     | ✗      |
| Emergency Pause   | ✗    | ✗      | ✓     | ✗      |
| Execute Trade     | ✗    | ✓      | ✗     | ✗      |
| Set Vault         | ✗    | ✓      | ✗     | ✗      |
| Withdraw Profit   | ✗    | ✓      | ✗     | ✗      |
| Log Trade         | ✗    | ✓      | ✗     | Vault  |

### Error Codes

**Vault Contract:**
- `101` - Insufficient balance
- `102` - Invalid amount
- `103` - Unauthorized access
- `104` - Contract paused

**Trader Account:**
- `201` - Unauthorized access
- `202` - Invalid trade

**Trade Logger:**
- `301` - Unauthorized access

## State Transitions

### Vault States

```
┌─────────────┐
│   ACTIVE    │◀──────────┐
│ (is_paused=0)│           │
└──────┬──────┘           │
       │                  │
       │ Emergency        │ Unpause
       │ Pause            │
       │                  │
       ▼                  │
┌─────────────┐           │
│   PAUSED    │───────────┘
│ (is_paused=1)│
└─────────────┘

Operations allowed in ACTIVE:
  - Deposit
  - Withdraw
  - Mirror Trade
  - Update Profit
  - Emergency Pause

Operations allowed in PAUSED:
  - Emergency Pause (to unpause)
```

## Gas Costs (Estimated)

| Operation          | Estimated Gas (TON) |
|-------------------|---------------------|
| Deploy Vault      | ~0.05               |
| Deploy Trader     | ~0.05               |
| Deploy Logger     | ~0.05               |
| Deposit           | ~0.01-0.02          |
| Withdraw          | ~0.02-0.03          |
| Execute Trade     | ~0.05-0.1           |
| Update Profit     | ~0.01               |
| Emergency Pause   | ~0.01               |

## Scalability Considerations

### Current MVP Limitations:
- Single vault per trader
- Manual profit updates
- No actual DEX integration
- Simple event system

### Future Scaling:
1. **Vault Factory Pattern**: Deploy multiple vaults
2. **Batch Operations**: Process multiple trades in one transaction
3. **Off-chain Indexing**: Use indexers for historical data
4. **Layer 2 Integration**: Move high-frequency trades off-chain

## Integration Points

### Frontend Integration:
```typescript
// Connect to vault
const vault = Vault.createFromAddress(vaultAddress);

// Get user position
const shares = await vault.getUserShares(userAddress);
const value = await vault.getUserBalanceValue(userAddress);

// Deposit
await vault.sendDeposit(sender, { value: toNano('10') });

// Withdraw
await vault.sendWithdraw(sender, { 
  shares: sharesToBurn, 
  value: toNano('0.05') 
});
```

### Backend Integration:
```typescript
// Monitor trades
const traderData = await traderAccount.getTraderData();
const totalTrades = traderData.totalTrades;

// Get performance
const stats = await tradeLogger.getPerformanceStats();
const pnl = stats.totalPnl;
```

## Future Enhancements

1. **Multi-Asset Support**: Trade multiple tokens
2. **Risk Management**: Stop-loss, position limits
3. **Fee System**: Performance and management fees
4. **Governance**: DAO for parameter changes
5. **Oracle Integration**: Real-time price feeds
6. **Cross-chain**: Bridge to other blockchains
7. **Social Features**: Leaderboards, ratings
8. **Advanced Analytics**: Performance metrics, Sharpe ratio

## References

- TON Documentation: https://ton.org/docs
- FunC Language: https://docs.ton.org/develop/func/overview
- Blueprint Framework: https://github.com/ton-org/blueprint
- ERC-4626 Standard: https://eips.ethereum.org/EIPS/eip-4626
