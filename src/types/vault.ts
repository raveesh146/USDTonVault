export type Address = string;

export interface VaultStats {
  epochId: number;
  nav: string;
  pricePerShare: string;
  totalAssets: string;
  totalShares: string;
  lastVerifiedEpoch: number;
  highWatermark: string;
}

export interface MyPosition {
  shares: string;
  deposited: string;
  withdrawable: string;
  unrealizedPnlPct: number;
}

export interface TradeEvent {
  id: string;
  epochId: number;
  pair: string;
  side: "BUY" | "SELL";
  qty: string;
  price: string;
  ts: number;
}

export interface DepositEvent {
  id: string;
  epochId: number;
  user: Address;
  amount: string;
  shares: string;
  ts: number;
  type: "DEPOSIT";
}

export interface WithdrawEvent {
  id: string;
  epochId: number;
  user: Address;
  shares: string;
  amount: string;
  ts: number;
  type: "WITHDRAW";
}

export type VaultEvent = TradeEvent | DepositEvent | WithdrawEvent;

export interface EpochSummary {
  epochId: number;
  pnlPct: number;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  proofTx?: string;
}

export interface ProofBundle {
  epochId: number;
  publicInputs: any;
  proof: any;
  proofHash: string;
}

export interface RiskLimits {
  maxPositionUsd: number;
  maxSlippageBps: number;
  maxDailyTurnoverUsd: number;
  maxDrawdownBps: number;
}

export interface NavDataPoint {
  ts: number;
  nav: number;
}
