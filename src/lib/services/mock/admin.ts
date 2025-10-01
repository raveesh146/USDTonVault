import { RiskLimits, ProofBundle, TradeEvent } from '@/types/vault';
import { mockVaultService } from './vault';

let mockRiskLimits: RiskLimits = {
  maxPositionUsd: 500000,
  maxSlippageBps: 100,
  maxDailyTurnoverUsd: 1000000,
  maxDrawdownBps: 2000,
};

class MockAdminService {
  async executeTrade(params: {
    venue: string;
    pair: string;
    side: 'BUY' | 'SELL';
    amount: string;
    minOut: string;
    deadline: number;
  }): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockPrice = params.side === 'BUY' ? '5.25' : '5.28';
    
    const trade: TradeEvent = {
      id: `trade-${Date.now()}`,
      epochId: 5,
      pair: params.pair,
      side: params.side,
      qty: params.amount,
      price: mockPrice,
      ts: Date.now(),
    };
    
    mockVaultService.addTradeEvent(trade);
    
    return `mock-trade-tx-${Date.now()}`;
  }

  async closeEpoch(epochId?: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    mockVaultService.closeEpoch();
  }

  async submitProof(bundle: ProofBundle): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    mockVaultService.submitProof(bundle.epochId);
    return `mock-proof-tx-${Date.now()}`;
  }

  async getRiskLimits(): Promise<RiskLimits> {
    return mockRiskLimits;
  }

  async setRiskLimits(limits: RiskLimits): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 800));
    mockRiskLimits = limits;
    return `mock-limits-tx-${Date.now()}`;
  }
}

export const mockAdminService = new MockAdminService();
