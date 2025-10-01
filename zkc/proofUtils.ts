import { ethers } from 'ethers';
import { TradingData, Trade, Position, PriceData, RiskLimits } from './proofGenerator';
import { ProofData } from './proofVerifier';

/**
 * Utility class for managing trading data and proof generation
 */
export class TradingDataManager {
  /**
   * Validate trading data integrity
   */
  static validateTradingData(data: TradingData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate epoch ID
    if (data.epochId <= 0) {
      errors.push('Epoch ID must be positive');
    }

    // Validate NAV values
    if (data.initialNav <= 0 || data.finalNav <= 0) {
      errors.push('NAV values must be positive');
    }

    // Validate trades
    for (const trade of data.trades) {
      if (trade.quantity <= 0) {
        errors.push(`Trade ${trade.id}: Quantity must be positive`);
      }
      if (trade.price <= 0) {
        errors.push(`Trade ${trade.id}: Price must be positive`);
      }
      if (!['BUY', 'SELL'].includes(trade.side)) {
        errors.push(`Trade ${trade.id}: Invalid side`);
      }
      if (trade.slippage < 0 || trade.slippage > 10000) {
        errors.push(`Trade ${trade.id}: Slippage must be between 0 and 10000 basis points`);
      }
    }

    // Validate positions
    for (const position of data.positions) {
      if (position.quantity < 0) {
        errors.push(`Position ${position.asset}: Quantity cannot be negative`);
      }
      if (position.averagePrice <= 0) {
        errors.push(`Position ${position.asset}: Average price must be positive`);
      }
    }

    // Validate prices
    for (const price of data.prices) {
      if (price.price <= 0) {
        errors.push(`Price ${price.pair}: Price must be positive`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate trading statistics
   */
  static calculateTradingStats(data: TradingData): {
    totalTrades: number;
    totalVolume: number;
    averageTradeSize: number;
    winRate: number;
    maxDrawdown: number;
    sharpeRatio: number;
  } {
    const totalTrades = data.trades.length;
    const totalVolume = data.trades.reduce((sum, trade) => sum + (trade.quantity * trade.price), 0);
    const averageTradeSize = totalTrades > 0 ? totalVolume / totalTrades : 0;

    // Calculate win rate (simplified - based on price movements)
    let winningTrades = 0;
    for (const trade of data.trades) {
      const priceData = data.prices.find(p => p.pair === trade.pair);
      if (priceData) {
        if (trade.side === 'BUY' && priceData.price > trade.price) {
          winningTrades++;
        } else if (trade.side === 'SELL' && priceData.price < trade.price) {
          winningTrades++;
        }
      }
    }
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    // Calculate max drawdown
    const navChange = (data.finalNav - data.initialNav) / data.initialNav;
    const maxDrawdown = navChange < 0 ? Math.abs(navChange) * 100 : 0;

    // Calculate Sharpe ratio (simplified)
    const returns = data.trades.map(trade => {
      const priceData = data.prices.find(p => p.pair === trade.pair);
      return priceData ? (priceData.price - trade.price) / trade.price : 0;
    });
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const sharpeRatio = variance > 0 ? avgReturn / Math.sqrt(variance) : 0;

    return {
      totalTrades,
      totalVolume,
      averageTradeSize,
      winRate,
      maxDrawdown,
      sharpeRatio
    };
  }

  /**
   * Generate mock trading data for testing
   */
  static generateMockTradingData(epochId: number): TradingData {
    const initialNav = 2500000; // $2.5M
    const finalNav = initialNav * (1 + (Math.random() - 0.4) * 0.1); // ±5% change

    const trades: Trade[] = [
      {
        id: `trade-${epochId}-1`,
        pair: 'BTC/USDT',
        side: Math.random() > 0.5 ? 'BUY' : 'SELL',
        quantity: Math.random() * 2 + 0.5,
        price: 95000 + Math.random() * 1000,
        timestamp: Date.now() - Math.random() * 86400000,
        slippage: Math.random() * 50 // 0-50 basis points
      },
      {
        id: `trade-${epochId}-2`,
        pair: 'ETH/USDT',
        side: Math.random() > 0.5 ? 'BUY' : 'SELL',
        quantity: Math.random() * 20 + 5,
        price: 3500 + Math.random() * 200,
        timestamp: Date.now() - Math.random() * 86400000,
        slippage: Math.random() * 50
      },
      {
        id: `trade-${epochId}-3`,
        pair: 'TON/USDT',
        side: Math.random() > 0.5 ? 'BUY' : 'SELL',
        quantity: Math.random() * 10000 + 1000,
        price: 5.2 + Math.random() * 0.2,
        timestamp: Date.now() - Math.random() * 86400000,
        slippage: Math.random() * 30
      }
    ];

    const positions: Position[] = [
      {
        asset: 'BTC',
        quantity: Math.random() * 5 + 1,
        averagePrice: 95000 + Math.random() * 1000,
        unrealizedPnl: (Math.random() - 0.5) * 10000
      },
      {
        asset: 'ETH',
        quantity: Math.random() * 50 + 10,
        averagePrice: 3500 + Math.random() * 200,
        unrealizedPnl: (Math.random() - 0.5) * 5000
      },
      {
        asset: 'TON',
        quantity: Math.random() * 50000 + 10000,
        averagePrice: 5.2 + Math.random() * 0.2,
        unrealizedPnl: (Math.random() - 0.5) * 1000
      }
    ];

    const prices: PriceData[] = [
      {
        pair: 'BTC/USDT',
        price: 95000 + Math.random() * 1000,
        timestamp: Date.now(),
        source: 'binance'
      },
      {
        pair: 'ETH/USDT',
        price: 3500 + Math.random() * 200,
        timestamp: Date.now(),
        source: 'binance'
      },
      {
        pair: 'TON/USDT',
        price: 5.2 + Math.random() * 0.2,
        timestamp: Date.now(),
        source: 'binance'
      }
    ];

    return {
      epochId,
      initialNav,
      finalNav,
      trades,
      positions,
      prices
    };
  }

  /**
   * Generate mock risk limits
   */
  static generateMockRiskLimits(): RiskLimits {
    return {
      maxPositionSize: 500000, // $500k
      maxSlippage: 100, // 1%
      maxDailyTurnover: 2000000, // $2M
      maxDrawdown: 500 // 5%
    };
  }
}

/**
 * Utility class for proof data management
 */
export class ProofDataManager {
  /**
   * Store proof data locally
   */
  static storeProof(proofData: ProofData, key: string): void {
    const serialized = JSON.stringify(proofData);
    localStorage.setItem(`proof_${key}`, serialized);
  }

  /**
   * Retrieve proof data from local storage
   */
  static retrieveProof(key: string): ProofData | null {
    const serialized = localStorage.getItem(`proof_${key}`);
    if (!serialized) return null;
    
    try {
      return JSON.parse(serialized);
    } catch (error) {
      console.error('Error parsing stored proof:', error);
      return null;
    }
  }

  /**
   * List all stored proofs
   */
  static listStoredProofs(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('proof_')) {
        keys.push(key.replace('proof_', ''));
      }
    }
    return keys;
  }

  /**
   * Delete stored proof
   */
  static deleteProof(key: string): void {
    localStorage.removeItem(`proof_${key}`);
  }

  /**
   * Clear all stored proofs
   */
  static clearAllProofs(): void {
    const keys = this.listStoredProofs();
    keys.forEach(key => this.deleteProof(key));
  }
}

/**
 * Utility class for data formatting and conversion
 */
export class DataFormatter {
  /**
   * Format number with appropriate precision
   */
  static formatNumber(value: number, decimals: number = 2): string {
    return value.toFixed(decimals);
  }

  /**
   * Format percentage with basis points
   */
  static formatPercentage(basisPoints: number, decimals: number = 2): string {
    return (basisPoints / 100).toFixed(decimals) + '%';
  }

  /**
   * Format currency
   */
  static formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value);
  }

  /**
   * Format timestamp
   */
  static formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }

  /**
   * Convert wei to ether
   */
  static weiToEther(wei: string): string {
    return ethers.utils.formatEther(wei);
  }

  /**
   * Convert ether to wei
   */
  static etherToWei(ether: string): string {
    return ethers.utils.parseEther(ether).toString();
  }
}

/**
 * Utility class for proof validation
 */
export class ProofValidator {
  /**
   * Validate proof data structure
   */
  static validateProofStructure(proofData: any): boolean {
    if (!proofData || typeof proofData !== 'object') {
      return false;
    }

    // Check proof structure
    const { proof, publicSignals } = proofData;
    if (!proof || !publicSignals) {
      return false;
    }

    // Check proof format
    if (!proof.a || !proof.b || !proof.c) {
      return false;
    }

    // Check public signals
    if (!Array.isArray(publicSignals) || publicSignals.length < 10) {
      return false;
    }

    return true;
  }

  /**
   * Validate proof values
   */
  static validateProofValues(proofData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.validateProofStructure(proofData)) {
      errors.push('Invalid proof structure');
      return { isValid: false, errors };
    }

    const { publicSignals } = proofData;

    // Validate epoch ID
    const epochId = parseInt(publicSignals[4]);
    if (epochId <= 0) {
      errors.push('Invalid epoch ID');
    }

    // Validate NAV values
    const initialNav = parseInt(publicSignals[5]);
    const finalNav = parseInt(publicSignals[6]);
    if (initialNav <= 0 || finalNav <= 0) {
      errors.push('Invalid NAV values');
    }

    // Validate PnL
    const reportedPnl = parseInt(publicSignals[7]);
    if (Math.abs(reportedPnl) > 10000) { // More than 100%
      errors.push('PnL exceeds reasonable bounds');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default {
  TradingDataManager,
  ProofDataManager,
  DataFormatter,
  ProofValidator
};
