import { groth16 } from 'snarkjs';
import { ethers } from 'ethers';

export interface TradingData {
  epochId: number;
  initialNav: number;
  finalNav: number;
  trades: Trade[];
  positions: Position[];
  prices: PriceData[];
}

export interface Trade {
  id: string;
  pair: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: number;
  slippage: number;
}

export interface Position {
  asset: string;
  quantity: number;
  averagePrice: number;
  unrealizedPnl: number;
}

export interface PriceData {
  pair: string;
  price: number;
  timestamp: number;
  source: string;
}

export interface RiskLimits {
  maxPositionSize: number;
  maxSlippage: number; // in basis points
  maxDailyTurnover: number;
  maxDrawdown: number; // in basis points
}

export interface ProofInputs {
  // Public inputs
  epochId: string;
  initialNav: string;
  finalNav: string;
  reportedPnl: string;
  highWatermark: string;
  totalFees: string;
  
  // Risk limits (public)
  maxPositionSize: string;
  maxSlippage: string;
  maxDailyTurnover: string;
  maxDrawdown: string;
  positionSize: string;
  slippage: string;
  dailyTurnover: string;
  currentDrawdown: string;
  
  // Private inputs (commitments)
  tradeCommitment: string;
  priceDataCommitment: string;
  positionCommitment: string;
  riskDataCommitment: string;
}

export interface ProofResult {
  proof: any;
  publicSignals: string[];
  verifiedPnl: number;
  newHighWatermark: boolean;
  performanceFee: number;
  riskCompliant: boolean;
}

export class TradingProofGenerator {
  private wasmPath: string;
  private zkeyPath: string;
  private vkeyPath: string;

  constructor(wasmPath: string, zkeyPath: string, vkeyPath: string) {
    this.wasmPath = wasmPath;
    this.zkeyPath = zkeyPath;
    this.vkeyPath = vkeyPath;
  }

  /**
   * Generate a commitment hash for trade data
   */
  private generateTradeCommitment(trades: Trade[]): string {
    const tradeData = trades.map(trade => ({
      pair: trade.pair,
      side: trade.side,
      quantity: trade.quantity,
      price: trade.price,
      timestamp: trade.timestamp
    }));
    
    return ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ['tuple(string pair, uint8 side, uint256 quantity, uint256 price, uint256 timestamp)[]'],
        [tradeData]
      )
    );
  }

  /**
   * Generate a commitment hash for price data
   */
  private generatePriceCommitment(prices: PriceData[]): string {
    const priceData = prices.map(price => ({
      pair: price.pair,
      price: price.price,
      timestamp: price.timestamp
    }));
    
    return ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ['tuple(string pair, uint256 price, uint256 timestamp)[]'],
        [priceData]
      )
    );
  }

  /**
   * Generate a commitment hash for position data
   */
  private generatePositionCommitment(positions: Position[]): string {
    const positionData = positions.map(pos => ({
      asset: pos.asset,
      quantity: pos.quantity,
      averagePrice: pos.averagePrice
    }));
    
    return ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ['tuple(string asset, uint256 quantity, uint256 averagePrice)[]'],
        [positionData]
      )
    );
  }

  /**
   * Generate a commitment hash for risk data
   */
  private generateRiskCommitment(riskData: any): string {
    return ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ['bytes32'],
        [ethers.utils.keccak256(JSON.stringify(riskData))]
      )
    );
  }

  /**
   * Calculate trading metrics from trade data
   */
  private calculateMetrics(tradingData: TradingData, riskLimits: RiskLimits) {
    const totalPositionSize = tradingData.positions.reduce((sum, pos) => sum + (pos.quantity * pos.averagePrice), 0);
    const maxSlippage = Math.max(...tradingData.trades.map(t => t.slippage));
    const dailyTurnover = tradingData.trades.reduce((sum, trade) => sum + (trade.quantity * trade.price), 0);
    
    // Calculate current drawdown (simplified)
    const peakNav = Math.max(tradingData.initialNav, tradingData.finalNav);
    const currentDrawdown = ((peakNav - tradingData.finalNav) / peakNav) * 10000; // in basis points
    
    const reportedPnl = ((tradingData.finalNav - tradingData.initialNav) / tradingData.initialNav) * 10000; // in basis points
    const totalFees = reportedPnl > 0 ? Math.floor(reportedPnl * 0.1) : 0; // 10% of profits only

    return {
      totalPositionSize,
      maxSlippage,
      dailyTurnover,
      currentDrawdown,
      reportedPnl,
      totalFees
    };
  }

  /**
   * Generate proof inputs from trading data
   */
  private generateProofInputs(
    tradingData: TradingData,
    riskLimits: RiskLimits,
    highWatermark: number
  ): ProofInputs {
    const metrics = this.calculateMetrics(tradingData, riskLimits);
    
    return {
      // Public inputs
      epochId: tradingData.epochId.toString(),
      initialNav: tradingData.initialNav.toString(),
      finalNav: tradingData.finalNav.toString(),
      reportedPnl: metrics.reportedPnl.toString(),
      highWatermark: highWatermark.toString(),
      totalFees: metrics.totalFees.toString(),
      
      // Risk limits
      maxPositionSize: riskLimits.maxPositionSize.toString(),
      maxSlippage: riskLimits.maxSlippage.toString(),
      maxDailyTurnover: riskLimits.maxDailyTurnover.toString(),
      maxDrawdown: riskLimits.maxDrawdown.toString(),
      positionSize: metrics.totalPositionSize.toString(),
      slippage: metrics.maxSlippage.toString(),
      dailyTurnover: metrics.dailyTurnover.toString(),
      currentDrawdown: metrics.currentDrawdown.toString(),
      
      // Private commitments
      tradeCommitment: this.generateTradeCommitment(tradingData.trades),
      priceDataCommitment: this.generatePriceCommitment(tradingData.prices),
      positionCommitment: this.generatePositionCommitment(tradingData.positions),
      riskDataCommitment: this.generateRiskCommitment(riskLimits)
    };
  }

  /**
   * Generate a zk proof for trading performance
   */
  async generateProof(
    tradingData: TradingData,
    riskLimits: RiskLimits,
    highWatermark: number
  ): Promise<ProofResult> {
    try {
      const inputs = this.generateProofInputs(tradingData, riskLimits, highWatermark);
      
      console.log('Generating proof with inputs:', inputs);
      
      // Generate the proof using groth16
      const { proof, publicSignals } = await groth16.fullProve(
        inputs,
        this.wasmPath,
        this.zkeyPath
      );

      // Verify the proof locally
      const vkey = await fetch(this.vkeyPath).then(r => r.json());
      const res = await groth16.verify(vkey, publicSignals, proof);
      
      if (!res) {
        throw new Error('Proof verification failed');
      }

      // Extract outputs from public signals
      const verifiedPnl = parseInt(publicSignals[0]);
      const newHighWatermark = publicSignals[1] === '1';
      const performanceFee = parseInt(publicSignals[2]);
      const riskCompliant = publicSignals[3] === '1';

      return {
        proof,
        publicSignals,
        verifiedPnl,
        newHighWatermark,
        performanceFee,
        riskCompliant
      };
    } catch (error) {
      console.error('Error generating proof:', error);
      throw error;
    }
  }

  /**
   * Verify a proof
   */
  async verifyProof(proof: any, publicSignals: string[]): Promise<boolean> {
    try {
      const vkey = await fetch(this.vkeyPath).then(r => r.json());
      return await groth16.verify(vkey, publicSignals, proof);
    } catch (error) {
      console.error('Error verifying proof:', error);
      return false;
    }
  }

  /**
   * Format proof for on-chain submission
   */
  formatProofForChain(proof: any): {
    a: [string, string];
    b: [[string, string], [string, string]];
    c: [string, string];
  } {
    return {
      a: [proof.pi_a[0], proof.pi_a[1]],
      b: [
        [proof.pi_b[0][1], proof.pi_b[0][0]],
        [proof.pi_b[1][1], proof.pi_b[1][0]]
      ],
      c: [proof.pi_c[0], proof.pi_c[1]]
    };
  }
}

export default TradingProofGenerator;
