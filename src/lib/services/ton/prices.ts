// Price service for fetching real-time token prices
// This would integrate with a price oracle or API in production

export interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
}

class TonPricesService {
  private priceCache: Map<string, { price: TokenPrice; timestamp: number }> = new Map();
  private cacheDuration = 60000; // 1 minute cache

  async getPrice(symbol: string): Promise<number> {
    const cached = this.priceCache.get(symbol);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.cacheDuration) {
      return cached.price.price;
    }

    // TODO: Integrate with real price API (e.g., CoinGecko, DeDust, etc.)
    // For now, return mock prices
    const mockPrices: Record<string, number> = {
      TON: 5.26,
      BTC: 95420.50,
      ETH: 3580.25,
      USDT: 1.00,
      SOL: 98.45,
      AVAX: 28.75,
    };

    const price = mockPrices[symbol] || 0;
    
    this.priceCache.set(symbol, {
      price: { symbol, price, change24h: 0 },
      timestamp: now,
    });

    return price;
  }

  async getTokenPrice(symbol: string): Promise<TokenPrice> {
    const cached = this.priceCache.get(symbol);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.cacheDuration) {
      return cached.price;
    }

    // TODO: Integrate with real price API
    const mockPrices: Record<string, TokenPrice> = {
      TON: { symbol: 'TON', price: 5.26, change24h: 2.34 },
      BTC: { symbol: 'BTC', price: 95420.50, change24h: 1.87 },
      ETH: { symbol: 'ETH', price: 3580.25, change24h: -0.45 },
      USDT: { symbol: 'USDT', price: 1.00, change24h: 0.01 },
      SOL: { symbol: 'SOL', price: 98.45, change24h: 3.21 },
      AVAX: { symbol: 'AVAX', price: 28.75, change24h: -1.23 },
    };

    const tokenPrice = mockPrices[symbol] || { symbol, price: 0, change24h: 0 };
    
    this.priceCache.set(symbol, {
      price: tokenPrice,
      timestamp: now,
    });

    return tokenPrice;
  }

  async getMultiplePrices(symbols: string[]): Promise<Record<string, number>> {
    const prices: Record<string, number> = {};
    
    for (const symbol of symbols) {
      prices[symbol] = await this.getPrice(symbol);
    }

    return prices;
  }

  clearCache() {
    this.priceCache.clear();
  }
}

export const tonPricesService = new TonPricesService();
