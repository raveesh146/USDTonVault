
# 🔐 USDTonVault

### Zero-Knowledge Proof-Verified Investment Vault on TON Blockchain

## 🎯 Overview

USDTonVault is a decentralized asset management protocol on **TON** that lets followers deposit **stablecoins** into trader-led vaults.

* Followers **deposit stablecoins** → receive vault shares.
* A **leader trader** executes trades on their behalf.
* At the end of each **epoch**, the vault’s performance (PnL, risk limits) is **verified with zero-knowledge proofs**.
* Followers can withdraw **stablecoins only** (principal ± profit).
* Traders earn performance fees in stablecoins, based on **zk-verified results**.

### Why USDTonVault?

Traditional DeFi investment managers face an impossible choice: reveal their strategies and lose their competitive edge, or hide them and lose investor trust. USDTonVault eliminates this dilemma through cutting-edge zero-knowledge cryptography.

## 🎯 The Problem

Current DeFi investment managers face a trust paradox:

| Challenge | Impact |
|-----------|--------|
| ❌ **Reveal strategies** | Lose competitive edge to copycats |
| ❌ **Hide strategies** | Investors can't verify honest accounting |
| ❌ **Manual trading** | Slow execution, emotional decisions |
| ❌ **Complex UIs** | Retail users excluded from sophisticated strategies |

**USDTonVault solves all of these.**

This creates the **first trustless, privacy-preserving, and verifiable copy-trading system on TON**.

---

## ✨ Key Features

* **💵 Stablecoin-Denominated**: Users always deposit and withdraw in TON-stablecoins (e.g., USDT).
* **Epoch-based accounting**: Trading performance measured in fixed cycles (epochs).
* **Verifiable Performance** - zk-SNARK proofs verify PnL without revealing individual trades
* **Isolated vaults per trader**: Each trader operates their own strategy vault with custom fee structures.
* **Follower safety**: Vault contracts enforce exposure limits and support emergency pause.
* **Transparent + Private**: Public zk proofs verify profits, while individual trades remain private.
* **💰 Fair Fees** - High-water mark based performance fees only on verified profits

### 🎯 For Strategy Leaders
- **🤫 Strategy Privacy** - Prove results without exposing trading logic or alpha
- **⚡ Automated Execution** - Execute trades programmatically across multiple DEXes and earn share of the profit
- **📊 Transparent Metrics** - Build reputation with cryptographically verified track record
- **🔐 Trustless Management** - No custody risk, all funds secured by smart contracts

### 🔧 Technical Excellence
- **Zero-Knowledge Proofs** - Groth16/Plonk circuits verify accounting without revealing data
- **TON Integration** - Native TON blockchain smart contracts (Tact/FunC)
- **Modern UI** - Beautiful React interface with shadcn/ui components
- **Real-time Updates** - Live performance tracking and metrics dashboard

## 🎨 User Interface

### Features

Our modern, intuitive interface provides:

- **🎨 Beautiful Design** - Clean, professional UI built with shadcn/ui components
- **📱 Responsive** - Mobile-first design that works on all devices
- **⚡ Fast** - Optimized with Vite for instant page loads
- **♿ Accessible** - WCAG compliant with Radix UI primitives

### User Journey

1. **🔗 Connect Wallet**
   - One-click TON Connect integration
   - Support for all major TON wallets
   - Secure, non-custodial connection

2. **💰 Deposit Funds**
   - Enter USDT amount (e.g., 100 USDT)
   - Approve token transfer
   - Receive proportional vault shares
   - View updated portfolio balance

3. **📊 Monitor Performance**
   - Real-time PnL tracking
   - Historical trade data
   - Risk metrics dashboard

4. **✅ Verify Proofs**
   - Automatic zk proof generation
   - On-chain verification status
   - Transparent audit trail

5. **💸 Withdraw**
   - Redeem shares for USDT + profits
   - Instant calculation of withdrawal amount
   - High-water mark fee display
   - Confirm and execute withdrawal

## 🏗️ Architecture

### Smart Contracts

1. **Vault Contract** (Tact/FunC)
   - Holds user deposits in USDT jettons
   - Mints/burns proportional vault shares
   - Manages fees and withdrawals
   - Enforces verified performance metrics

2. **Execution Controller**
   - Routes approved trades to DEX adapters
   - Enforces position limits and risk caps
   - Emits trade events for zk proof generation
   - Only callable by whitelisted leader

3. **DEX Adapters**
   - Minimal wrappers for DeDust, Ston.fi
   - Strict parameter validation
   - Funds flow: Vault → Adapter → Vault only

4. **zk Verifier Contract**
   - On-chain Groth16/Plonk proof verification
   - Validates PnL calculations and risk metrics
   - Stores verification keys
   - Emits `ProofAccepted` events

## 🔄 Core Flows

### 1. Deposit Flow
```
User approves USDT → Vault.deposit(amount) → Mint shares proportional to NAV
```

### 2. Trading Flow
```
Leader calls Controller.execute(actions) → Check limits → Route to DEX adapter → Emit events
```

### 3. Epoch Close & Verification
```
Orchestrator computes NAV → Generate zk proof → Submit to Verifier → ProofAccepted event
```

### 4. Withdrawal Flow
```
User calls Vault.withdraw(shares) → Calculate USDT amount → Burn shares → Transfer USDT
```

## 🔐 Zero-Knowledge Circuits

### MVP Circuit (PnL Verification)
**Public Inputs**: `epochId`, `NAV_before`, `NAV_after`, `ReportedPnL`, `RootTrades`, `RootPrices`

**Private Inputs**: Per-trade deltas, price samples, Merkle proofs

**Proves**:
- Trade history aggregates to exact NAV change
- Reported PnL matches actual NAV delta
- All data committed via Merkle roots (no cherry-picking)

Built with **circom + snarkjs** (Groth16)

## 💰 Fee Structure

- **Performance Fee**: Applied only on verified profits above high-water mark
- **Management Fee**: Optional pro-rata accrual
- **All fees denominated in USDT**

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

- **Node.js** >= 18
- **TON Wallet** with testnet USDT (for testing)
- **Git** for version control

## 🏗️ Architecture

### Smart Contracts

* **Vault Contract**

  * Holds stablecoin deposits.
  * Issues and burns shares.
  * Calculates NAV (Net Asset Value).
  * Distributes profits and fees.

* **Trader Account Contract**

  * Authorized by the vault to execute trades via approved DEX adapters.
  * Emits logs for zk proof generation.

* **Trade Logger**

  * Records trades and updates epoch journals.
  * Provides Merkle roots for zk circuits.

* **Verifier Contract**

  * Verifies zk-SNARK/Plonk proofs.
  * Accepts or rejects submitted epoch proofs.

### zk Circuits

* **PnL Proof**: Proves NAV_before → NAV_after matches claimed profit/loss.
* **Risk Proof**: Ensures trader respected max drawdown, position size, leverage caps.
* Built with **Circom/Noir**, verified via Groth16 for gas efficiency.

### Frontend

* Built with **Next.js + Tailwind + shadcn/ui**.
* Wallet connection via **TON Connect**.
* Deposit/withdraw UI, NAV chart, epoch proof explorer.
* Admin panel for trader actions (execute trade, submit proof).

## 📊 Example Epoch Cycle

* **Epoch #1:** +5.43% ✅ Verified
* **Epoch #2:** +8.76% ✅ Verified
* **Epoch #3:** –3.21% ✅ Verified
* **Epoch #4:** +12.34% ✅ Verified
* **Epoch #5:** 0.00% ⏳ Pending

Each verified epoch strengthens trust between traders and followers.

---

### Project Structure

```
USDTonvault/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   ├── pages/             # Page components
│   └── styles/            # Global styles
├── contracts/             # TON smart contracts (FunC)
├── zkc/                   # Zero-knowledge circuits
├── scripts/               # Deployment and utility scripts
├── tests/                 # Test suites
├── wrappers/              # Contract wrappers
└── public/                # Static assets
```
---

## 🛠 Development

### Contracts

* Written in **Tact/FunC**.
* Deploy with `ton-contract-executor` or `blueprint`.

### zk Proofs

* Circuits in `/zk` (Circom).
* Compile with `snarkjs`.
* Submit via `VerifierContract.submitProof()`.

### Frontend

* `/app` directory with Next.js App Router.
* Components: DepositModal, WithdrawModal, EpochCard, ProofExplorer.

---
## 📦 Tech Stack

### Frontend
- **Framework**: React 18.3 with TypeScript 5.8
- **Build Tool**: Vite 5.4 (Lightning-fast HMR)
- **UI Components**: shadcn/ui + Radix UI primitives
- **Styling**: Tailwind CSS 3.4 with custom design system
- **State Management**: Zustand 5.0
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router DOM 6.30

### Blockchain Integration
- **TON SDK**: @ton/core, @ton/ton
- **Wallet Connection**: TON Connect UI React
- **Smart Contracts**: FunC

### Zero-Knowledge
- **Proof System**: circom + snarkjs (Groth16)
- 
### Contract Addresses
Trader.func: kQBascgtPO02miH-Xb9cNsb8LPZf9IwK-xQ-DhS1vjgqg0Uo
[Trader.func]( https://testnet.tonscan.org/address/kQBascgtPO02miH-Xb9cNsb8LPZf9IwK-xQ-DhS1vjgqg0Uo)
Vault.func:  EQDTcD9WeuhIJzaEpiPVacF-8Q7-GTWRrmeiLcjYhf7jrkXi
[Vault.func](https://testnet.tonscan.org/address/kQDTcD9WeuhIJzaEpiPVacF-8Q7-GTWRrmeiLcjYhf7jrv5o)
TradeLogger: kQAo4CLpCcpjaPpxEfGFJnBeCNjlP4NiS_geCYTO9HsaZ3x8
[Tradelogger.func](https://testnet.tonscan.org/address/kQAo4CLpCcpjaPpxEfGFJnBeCNjlP4NiS_geCYTO9HsaZ3x8)

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

## 🙏 Acknowledgments

Built with ❤️ for the TON ecosystem by passionate developers who believe in trustless, transparent finance.


### Built With

This project leverages many excellent open-source technologies:
- React, TypeScript, Vite
- TON SDK, TON Connect
- shadcn/ui, Radix UI, Tailwind CSS
- And many more!


Made with 🔐 and ⚡ on TON

> **USDTonVault** — deposit stablecoins, follow pro traders, exit with stablecoins + zk-verified profits. Private strategies, public trust.
 
