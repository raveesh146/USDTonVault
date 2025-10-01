import { NavDataPoint } from '@/types/vault';

class MockPricesService {
  async getNavSeries(): Promise<NavDataPoint[]> {
    // Generate 30 days of mock NAV data with realistic growth
    const data: NavDataPoint[] = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    let nav = 900000;
    
    for (let i = 30; i >= 0; i--) {
      const variance = (Math.random() - 0.48) * 15000;
      nav += variance;
      nav = Math.max(nav, 850000);
      
      data.push({
        ts: now - (i * dayMs),
        nav: parseFloat(nav.toFixed(2)),
      });
    }
    
    return data;
  }

  async getSpot(pair: string): Promise<number> {
    const prices: Record<string, number> = {
      'TON/USDT': 5.26,
      'BTC/USDT': 95420.50,
      'ETH/USDT': 3580.25,
    };
    
    return prices[pair] || 0;
  }
}

export const mockPricesService = new MockPricesService();
