import { VaultStats, MyPosition, EpochSummary, VaultEvent, Address, DepositEvent, WithdrawEvent, TradeEvent } from '@/types/vault';

// Mock state
let mockNav = 1050000; // $1,050,000
let mockTotalShares = 1000000;
let mockUserShares = 5000;
let mockUserDeposited = 5000;
let mockEpochId = 5;

const mockEpochs: EpochSummary[] = [
  { epochId: 5, pnlPct: 0, status: 'PENDING' },
  { epochId: 4, pnlPct: 12.34, status: 'VERIFIED', proofTx: '0xabc123...' },
  { epochId: 3, pnlPct: -3.21, status: 'VERIFIED', proofTx: '0xdef456...' },
  { epochId: 2, pnlPct: 8.76, status: 'VERIFIED', proofTx: '0xghi789...' },
  { epochId: 1, pnlPct: 5.43, status: 'VERIFIED', proofTx: '0xjkl012...' },
];

const mockEvents: VaultEvent[] = [
  {
    id: 'trade-1',
    epochId: 5,
    pair: 'TON/USDT',
    side: 'BUY',
    qty: '10000',
    price: '5.25',
    ts: Date.now() - 3600000,
  } as TradeEvent,
  {
    id: 'deposit-1',
    epochId: 5,
    user: 'EQCUser1234567890',
    amount: '5000',
    shares: '5000',
    ts: Date.now() - 7200000,
    type: 'DEPOSIT',
  } as DepositEvent,
];

class MockVaultService {
  async getVaultStats(): Promise<VaultStats> {
    const pricePerShare = (mockNav / mockTotalShares).toFixed(6);
    
    return {
      epochId: mockEpochId,
      nav: mockNav.toFixed(2),
      pricePerShare,
      totalAssets: mockNav.toFixed(2),
      totalShares: mockTotalShares.toString(),
      lastVerifiedEpoch: 4,
      highWatermark: '1.15',
    };
  }

  async getMyPosition(addr: Address): Promise<MyPosition> {
    const pricePerShare = mockNav / mockTotalShares;
    const withdrawable = (mockUserShares * pricePerShare).toFixed(2);
    const unrealizedPnl = ((parseFloat(withdrawable) - mockUserDeposited) / mockUserDeposited) * 100;
    
    return {
      shares: mockUserShares.toString(),
      deposited: mockUserDeposited.toFixed(2),
      withdrawable,
      unrealizedPnlPct: parseFloat(unrealizedPnl.toFixed(2)),
    };
  }

  async depositUSDT(amount: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const amountNum = parseFloat(amount);
    const pricePerShare = mockNav / mockTotalShares;
    const sharesReceived = Math.floor(amountNum / pricePerShare);
    
    mockUserShares += sharesReceived;
    mockUserDeposited += amountNum;
    mockTotalShares += sharesReceived;
    mockNav += amountNum;
    
    const depositEvent: DepositEvent = {
      id: `deposit-${Date.now()}`,
      epochId: mockEpochId,
      user: 'EQCMockWallet1234567890abcdefghijk',
      amount: amount,
      shares: sharesReceived.toString(),
      ts: Date.now(),
      type: 'DEPOSIT',
    };
    
    mockEvents.unshift(depositEvent);
    
    return `mock-tx-${Date.now()}`;
  }

  async withdrawShares(amountShares: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const sharesNum = parseFloat(amountShares);
    const pricePerShare = mockNav / mockTotalShares;
    const usdtOut = sharesNum * pricePerShare;
    
    mockUserShares -= sharesNum;
    mockTotalShares -= sharesNum;
    mockNav -= usdtOut;
    
    const withdrawEvent: WithdrawEvent = {
      id: `withdraw-${Date.now()}`,
      epochId: mockEpochId,
      user: 'EQCMockWallet1234567890abcdefghijk',
      shares: amountShares,
      amount: usdtOut.toFixed(2),
      ts: Date.now(),
      type: 'WITHDRAW',
    };
    
    mockEvents.unshift(withdrawEvent);
    
    return `mock-tx-${Date.now()}`;
  }

  async getEpochs(): Promise<EpochSummary[]> {
    return mockEpochs;
  }

  async getEvents(limit: number = 50): Promise<VaultEvent[]> {
    return mockEvents.slice(0, limit);
  }

  // Helper for admin actions
  addTradeEvent(trade: TradeEvent) {
    mockEvents.unshift(trade);
    
    // Simulate NAV change based on trade
    const tradeValue = parseFloat(trade.qty) * parseFloat(trade.price);
    const impact = Math.random() * 0.02 - 0.01; // -1% to +1%
    mockNav += tradeValue * impact;
  }

  closeEpoch() {
    const currentPnl = Math.random() * 20 - 5; // -5% to +15%
    mockEpochs[0] = { ...mockEpochs[0], pnlPct: parseFloat(currentPnl.toFixed(2)) };
    mockEpochId++;
    mockEpochs.unshift({ epochId: mockEpochId, pnlPct: 0, status: 'PENDING' });
  }

  submitProof(epochId: number) {
    const index = mockEpochs.findIndex(e => e.epochId === epochId);
    if (index !== -1) {
      mockEpochs[index] = {
        ...mockEpochs[index],
        status: 'VERIFIED',
        proofTx: `0xmock${Date.now()}`,
      };
    }
  }
}

export const mockVaultService = new MockVaultService();
