Alright — here’s a polished, hackathon-ready **README.md** you can drop into your zkCopyVault repo. It’s structured for clarity, professionalism, and to impress both judges and developers.

---

# zkCopyVault 🛡️💰

**Stablecoin-based zk-verified copy-trading vaults on TON**

---

## 📖 Overview

zkCopyVault is a decentralized asset management protocol on **TON** that lets followers deposit **stablecoins** into trader-led vaults.

* Followers **deposit stablecoins** → receive vault shares.
* A **leader trader** executes trades on their behalf.
* At the end of each **epoch**, the vault’s performance (PnL, risk limits) is **verified with zero-knowledge proofs**.
* Followers can withdraw **stablecoins only** (principal ± profit).
* Traders earn performance fees in stablecoins, based on **zk-verified results**.

This creates the **first trustless, privacy-preserving, and verifiable copy-trading system on TON**.

---

## ✨ Key Features

* **Stablecoin in/out**: Users always deposit and withdraw in TON-stablecoins (e.g., USDT).
* **Epoch-based accounting**: Trading performance measured in fixed cycles (epochs).
* **zk proofs of performance**: PnL and risk compliance verified without exposing raw trades.
* **Isolated vaults per trader**: Each trader operates their own strategy vault with custom fee structures.
* **Follower safety**: Vault contracts enforce exposure limits and support emergency pause.
* **Transparent + Private**: Public zk proofs verify profits, while individual trades remain private.

---

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

---

## 🚀 Quickstart

### Prerequisites

* Node.js 18+
* pnpm or npm
* TON wallet (e.g., Tonkeeper, MyTonWallet)
* Deployed testnet contracts (see `/contracts`)

### Install

```bash
git clone https://github.com/your-org/zkcopyvault.git
cd zkcopyvault
pnpm install
```

### Run frontend

```bash
pnpm dev
```

Frontend runs on [http://localhost:3000](http://localhost:3000).

### Environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_NETWORK=ton_testnet
NEXT_PUBLIC_VAULT_FACTORY=EQCxxxx...
NEXT_PUBLIC_VERIFIER=EQCyyyy...
NEXT_PUBLIC_USDT_JETTON=EQCzzzz...
NEXT_PUBLIC_ADMIN_WALLET=EQCadmin...
```

---

## 🔑 User Flows

### For Followers

1. **Deposit** USDT into a trader’s vault → receive shares.
2. View live NAV and past epoch performance.
3. **Withdraw** at any time → always receive USDT.

### For Traders

1. Register and deploy a new vault via the factory.
2. Execute trades through the Trader Account contract.
3. At epoch close, generate zk proof of PnL.
4. Submit proof → claim performance fees.

---

## 📊 Example Epoch Cycle

* **Epoch #1:** +5.43% ✅ Verified
* **Epoch #2:** +8.76% ✅ Verified
* **Epoch #3:** –3.21% ✅ Verified
* **Epoch #4:** +12.34% ✅ Verified
* **Epoch #5:** 0.00% ⏳ Pending

Each verified epoch strengthens trust between traders and followers.

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

## 🌍 Roadmap

* [x] Stablecoin deposit/withdraw flow.
* [x] Epoch tracking + zk PnL proofs.
* [ ] Risk compliance proofs.
* [ ] Multi-vault leaderboard.
* [ ] DAO governance for vault whitelisting.

---

## 🤝 Contributing

Pull requests welcome! For major changes, open an issue first to discuss.
Make sure to update tests as appropriate.

---

## 📜 License

MIT © 2025 zkCopyVault Team

---

## ⚡ Hackathon Pitch One-liner

> **zkCopyVault** — deposit stablecoins, follow pro traders, exit with stablecoins + zk-verified profits. Private strategies, public trust.

---

Would you like me to also generate a **diagram (Mermaid / Excalidraw)** for the README showing the flow (User → Vault → Trader → Verifier → Withdraw), so judges immediately grasp the system?
 