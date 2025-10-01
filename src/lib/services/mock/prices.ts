import { NavDataPoint } from '@/types/vault';

class MockPricesService {
  async getNavSeries(): Promise<NavDataPoint[]> {
    // Generate 30 days of mock NAV data with realistic growth and volatility
    const data: NavDataPoint[] = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    let nav = 2650000; // Start from $2.65M (more realistic)
    
    for (let i = 30; i >= 0; i--) {
      // More realistic daily volatility (0.5% to 3%)
      const dailyReturn = (Math.random() - 0.45) * 0.06; // -2.7% to +3.3%
      nav = nav * (1 + dailyReturn);
      
      // Ensure NAV doesn't go below a reasonable floor
      nav = Math.max(nav, 2200000);
      
      // Add some intraday volatility
      const intradayVariance = (Math.random() - 0.5) * 0.02; // ±1%
      nav = nav * (1 + intradayVariance);
      
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
      'SOL/USDT': 98.45,
      'AVAX/USDT': 28.75,
      'MATIC/USDT': 0.89,
      'LINK/USDT': 14.23,
      'UNI/USDT': 6.78,
      'AAVE/USDT': 89.12,
      'CRV/USDT': 0.67,
    };
    
    return prices[pair] || 0;
  }
}

export const mockPricesService = new MockPricesService();
