import { VaultStats, MyPosition, EpochSummary, VaultEvent, Address, DepositEvent, WithdrawEvent, TradeEvent } from '@/types/vault';

// Mock state - More realistic starting values
let mockNav = 2847500; // $2,847,500 - realistic vault size
let mockTotalShares = 1000000;
let mockUserShares = 25000; // User has $71,188 worth
let mockUserDeposited = 65000; // User deposited $65k, now worth $71k
let mockEpochId = 47; // More realistic epoch number

const mockEpochs: EpochSummary[] = [
  { epochId: 47, pnlPct: 0, status: 'PENDING' },
  { epochId: 46, pnlPct: 3.24, status: 'VERIFIED', proofTx: '0x4a7b2c8f9e1d3a5b6c7d8e9f0a1b2c3d4e5f6789012345678901234567890abcd' },
  { epochId: 45, pnlPct: -1.87, status: 'VERIFIED', proofTx: '0x3f6e1a7c9d2b4e5f8a1c3d6e9f2b5c8d1e4f7a0b3c6d9e2f5a8b1c4d7e0f3a6b9' },
  { epochId: 44, pnlPct: 5.91, status: 'VERIFIED', proofTx: '0x2e5d0a6b9c1e4f7a0d3b6e9c2f5a8d1e4b7c0f3a6d9e2c5f8b1a4d7e0c3f6a9b2' },
  { epochId: 43, pnlPct: 2.18, status: 'VERIFIED', proofTx: '0x1d4c9f5a8e2b6d0c3f7a1e4b8d2c6f0a3e7b1d5c9f2a6e0b4d8c1f5a9e3b7d0c4' },
  { epochId: 42, pnlPct: 7.43, status: 'VERIFIED', proofTx: '0x0c3b8e4a7f1d5c9e2b6f0a3d7c1e5b9f2a6d0c4e8b1f5a9e3c7d0b4f8a2e6c1d5' },
  { epochId: 41, pnlPct: -2.34, status: 'VERIFIED', proofTx: '0xf2a7d1b5e9c3f6a0d4e8b2c6f1a5d9e3c7b0f4a8d2e6c1f5a9b3d7e0c4f8a2b6' },
  { epochId: 40, pnlPct: 4.67, status: 'VERIFIED', proofTx: '0xe1b6c0f4a8d2e6c1f5a9b3d7e0c4f8a2b6d0e4f8c2a6b1d5e9f3c7a0d4e8b2f6' },
];

const mockEvents: VaultEvent[] = [
  {
    id: 'trade-47-1',
    epochId: 47,
    pair: 'BTC/USDT',
    side: 'BUY',
    qty: '2.5',
    price: '95420.50',
    ts: Date.now() - 1800000, // 30 minutes ago
  } as TradeEvent,
  {
    id: 'trade-47-2',
    epochId: 47,
    pair: 'ETH/USDT',
    side: 'SELL',
    qty: '15.0',
    price: '3580.25',
    ts: Date.now() - 3600000, // 1 hour ago
  } as TradeEvent,
  {
    id: 'deposit-47-1',
    epochId: 47,
    user: 'EQCUser1234567890abcdefghijklmnopqrstuvwxyz',
    amount: '25000',
    shares: '8789',
    ts: Date.now() - 7200000, // 2 hours ago
    type: 'DEPOSIT',
  } as DepositEvent,
  {
    id: 'trade-47-3',
    epochId: 47,
    pair: 'TON/USDT',
    side: 'BUY',
    qty: '5000',
    price: '5.26',
    ts: Date.now() - 10800000, // 3 hours ago
  } as TradeEvent,
  {
    id: 'withdraw-46-1',
    epochId: 46,
    user: 'EQCAnother1234567890abcdefghijklmnopqrstuvw',
    shares: '5000',
    amount: '14425.50',
    ts: Date.now() - 86400000, // 1 day ago
    type: 'WITHDRAW',
  } as WithdrawEvent,
  {
    id: 'trade-46-1',
    epochId: 46,
    pair: 'SOL/USDT',
    side: 'BUY',
    qty: '100',
    price: '98.45',
    ts: Date.now() - 172800000, // 2 days ago
  } as TradeEvent,
  {
    id: 'deposit-46-1',
    epochId: 46,
    user: 'EQCTrader1234567890abcdefghijklmnopqrstuvwx',
    amount: '50000',
    shares: '17578',
    ts: Date.now() - 259200000, // 3 days ago
    type: 'DEPOSIT',
  } as DepositEvent,
  {
    id: 'trade-46-2',
    epochId: 46,
    pair: 'AVAX/USDT',
    side: 'SELL',
    qty: '250',
    price: '28.75',
    ts: Date.now() - 345600000, // 4 days ago
  } as TradeEvent,
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
      lastVerifiedEpoch: 46,
      highWatermark: '1.0947', // 9.47% high watermark
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
