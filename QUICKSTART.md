# Quick Start Guide - Copy Trading Vault

## Overview

This guide will help you quickly deploy and test the copy trading vault system on TON blockchain.

## Prerequisites

- Node.js installed
- TON wallet with testnet TON
- Blueprint CLI installed

## Installation

```bash
cd contracts
npm install
```

## Build Contracts

```bash
npm run build
```

This will compile all three contracts:
- `vault.fc` - Main vault contract
- `trader_account.fc` - Trader account contract
- `trade_logger.fc` - Trade logging contract

## Deployment Steps

### Step 1: Deploy Trader Account

First, deploy the trader account contract:

```bash
npm run start -- deployTraderAccount
```

When prompted:
- Enter vault address (or leave empty for now)
- Save the deployed trader account address

### Step 2: Deploy Vault

Deploy the vault contract:

```bash
npm run start -- deployVault
```

When prompted:
- Enter the trader account address from Step 1
- Save the deployed vault address

### Step 3: Link Vault to Trader Account

If you didn't set the vault address in Step 1, you need to link them now using the trader account's `setVault` operation.

### Step 4: Deploy Trade Logger (Optional)

Deploy the trade logger for historical tracking:

```bash
npm run start -- deployTradeLogger
```

When prompted:
- Enter vault address
- Enter trader address

## Testing the System

### Test 1: Deposit to Vault

```bash
npm run start -- interactVault <vault_address>
```

Choose "Deposit" and enter amount (e.g., 1 TON)

### Test 2: Check Vault Status

```bash
npm run start -- interactVault <vault_address>
```

Choose "View Only" to see:
- Total assets in vault
- Your shares
- Your position value
- Profit/loss

### Test 3: Withdraw from Vault

```bash
npm run start -- interactVault <vault_address>
```

Choose "Withdraw" and enter shares to burn

## Running Tests

Run the test suite:

```bash
npm test
```

## Contract Addresses (Save These)

After deployment, save these addresses:

```
Vault Address: _______________
Trader Account Address: _______________
Trade Logger Address: _______________
```

## Common Operations

### Deposit TON
```typescript
await vault.sendDeposit(sender, {
    value: toNano('1.0'), // Amount to deposit
});
```

### Withdraw TON
```typescript
await vault.sendWithdraw(sender, {
    shares: 1000n, // Shares to burn
    value: toNano('0.05'), // Gas fee
});
```

### Execute Trade (Trader Only)
```typescript
await traderAccount.sendExecuteTrade(sender, {
    tradeType: 0, // 0=buy, 1=sell
    tradeAmount: toNano('0.5'),
    tokenAddress: tokenAddr,
    value: toNano('0.1'),
});
```

### Update Profit (Owner/Trader Only)
```typescript
await vault.sendUpdateProfit(sender, {
    newProfit: toNano('0.5'),
    value: toNano('0.05'),
});
```

### Emergency Pause (Owner Only)
```typescript
await vault.sendEmergencyPause(sender, {
    value: toNano('0.05'),
});
```

## Troubleshooting

### Contract not deployed
- Check if you have enough TON for gas fees
- Verify the address is correct
- Wait a few seconds and try again

### Transaction failed
- Ensure you have the correct permissions (owner/trader)
- Check if vault is paused
- Verify you have sufficient balance/shares

### Can't withdraw
- Check if you have enough shares
- Ensure vault has enough TON
- Verify vault is not paused

## Next Steps

1. **Integrate with DEX**: Add actual trade execution logic
2. **Add Frontend**: Build React/Vue app to interact with contracts
3. **Implement Monitoring**: Set up event listeners for trades
4. **Add More Traders**: Deploy multiple vaults for different traders
5. **Implement Fees**: Add performance and management fees

## Support

For issues or questions, refer to:
- `CONTRACTS_README.md` - Detailed contract documentation
- `README.md` - Project overview
- TON documentation: https://ton.org/docs

## Security Notes

⚠️ **Important**: 
- This is MVP code - audit before mainnet deployment
- Test thoroughly on testnet first
- Keep private keys secure
- Use emergency pause if issues arise
- Monitor vault regularly
