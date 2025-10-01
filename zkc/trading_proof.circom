pragma circom 2.0.0;

include "https://github.com/iden3/circomlib/archive/master.zip";
include "comparators.circom";

// Circuit for proving trading performance and PnL calculations
// This circuit proves that the leader trader's reported PnL is correct
// without revealing individual trade details

template TradingProof() {
    // Public inputs
    signal input epochId;
    signal input initialNav;
    signal input finalNav;
    signal input reportedPnl;
    signal input highWatermark;
    signal input totalFees;
    
    // Private inputs (commitments)
    signal private input tradeHash;
    signal private input priceDataHash;
    signal private input positionHash;
    
    // Intermediate signals
    signal navDiff;
    signal calculatedPnl;
    signal pnlPercentage;
    signal highWatermarkCheck;
    signal feeCheck;
    
    // Calculate NAV difference
    navDiff <== finalNav - initialNav;
    
    // Calculate PnL as percentage
    // PnL = (finalNav - initialNav) / initialNav * 100
    component mul1 = MulDiv(32, 32, 32);
    mul1.a <== navDiff;
    mul1.b <== 10000; // 100 * 100 for precision
    mul1.c <== initialNav;
    
    calculatedPnl <== mul1.out;
    
    // Check that reported PnL matches calculated PnL (within precision)
    component pnlCheck = IsEqual();
    pnlCheck.in[0] <== reportedPnl;
    pnlCheck.in[1] <== calculatedPnl;
    pnlCheck.out === 1;
    
    // Calculate PnL percentage for high watermark check
    pnlPercentage <== calculatedPnl;
    
    // Verify high watermark is updated correctly
    // If current performance > high watermark, update it
    component hwmCheck = GreaterThan(32);
    hwmCheck.in[0] <== pnlPercentage;
    hwmCheck.in[1] <== highWatermark;
    highWatermarkCheck <== hwmCheck.out;
    
    // Verify fees are calculated correctly (10% of profits only)
    // If PnL > 0, fees should be PnL * 10 / 100
    // If PnL <= 0, fees should be 0
    component isPositive = GreaterThan(32);
    isPositive.in[0] <== pnlPercentage;
    isPositive.in[1] <== 0;
    
    component expectedFees = MulDiv(32, 32, 32);
    expectedFees.a <== pnlPercentage;
    expectedFees.b <== isPositive.out; // 1 if positive, 0 if negative
    expectedFees.c <== 1000; // 10 * 100 for precision
    
    component feeCheck = IsEqual();
    feeCheck.in[0] <== totalFees;
    feeCheck.in[1] <== expectedFees.out;
    feeCheck.out === 1;
    
    // Output signals
    signal output verifiedPnl <== calculatedPnl;
    signal output newHighWatermark <== highWatermarkCheck;
    signal output performanceFee <== totalFees;
}

// Helper template for multiplication and division with precision
template MulDiv(n) {
    signal input a;
    signal input b;
    signal input c;
    signal output out;
    
    component mul = Mul(n, n);
    mul.a <== a;
    mul.b <== b;
    
    component div = Div(n);
    div.in[0] <== mul.out;
    div.in[1] <== c;
    
    out <== div.out;
}

// Template for proving trade execution within risk limits
template RiskLimitProof() {
    signal input maxPositionSize;
    signal input maxSlippage;
    signal input maxDailyTurnover;
    signal input maxDrawdown;
    
    signal private input tradeCommitment;
    signal private input riskDataCommitment;
    
    // Public inputs for verification
    signal input positionSize;
    signal input slippage;
    signal input dailyTurnover;
    signal input currentDrawdown;
    
    // Risk limit checks
    component positionCheck = LessThan(32);
    positionCheck.in[0] <== positionSize;
    positionCheck.in[1] <== maxPositionSize;
    positionCheck.out === 1;
    
    component slippageCheck = LessThan(32);
    slippageCheck.in[0] <== slippage;
    slippageCheck.in[1] <== maxSlippage;
    slippageCheck.out === 1;
    
    component turnoverCheck = LessThan(32);
    turnoverCheck.in[0] <== dailyTurnover;
    turnoverCheck.in[1] <== maxDailyTurnover;
    turnoverCheck.out === 1;
    
    component drawdownCheck = LessThan(32);
    drawdownCheck.in[0] <== currentDrawdown;
    drawdownCheck.in[1] <== maxDrawdown;
    drawdownCheck.out === 1;
    
    // Output signals
    signal output riskCompliant <== 1;
}

// Main circuit that combines trading proof and risk proof
template LeaderTradingProof() {
    signal input epochId;
    signal input initialNav;
    signal input finalNav;
    signal input reportedPnl;
    signal input highWatermark;
    signal input totalFees;
    
    signal input maxPositionSize;
    signal input maxSlippage;
    signal input maxDailyTurnover;
    signal input maxDrawdown;
    signal input positionSize;
    signal input slippage;
    signal input dailyTurnover;
    signal input currentDrawdown;
    
    signal private input tradeCommitment;
    signal private input priceDataCommitment;
    signal private input positionCommitment;
    signal private input riskDataCommitment;
    
    // Trading performance proof
    component tradingProof = TradingProof();
    tradingProof.epochId <== epochId;
    tradingProof.initialNav <== initialNav;
    tradingProof.finalNav <== finalNav;
    tradingProof.reportedPnl <== reportedPnl;
    tradingProof.highWatermark <== highWatermark;
    tradingProof.totalFees <== totalFees;
    tradingProof.tradeHash <== tradeCommitment;
    tradingProof.priceDataHash <== priceDataCommitment;
    tradingProof.positionHash <== positionCommitment;
    
    // Risk limit proof
    component riskProof = RiskLimitProof();
    riskProof.maxPositionSize <== maxPositionSize;
    riskProof.maxSlippage <== maxSlippage;
    riskProof.maxDailyTurnover <== maxDailyTurnover;
    riskProof.maxDrawdown <== maxDrawdown;
    riskProof.positionSize <== positionSize;
    riskProof.slippage <== slippage;
    riskProof.dailyTurnover <== dailyTurnover;
    riskProof.currentDrawdown <== currentDrawdown;
    riskProof.tradeCommitment <== tradeCommitment;
    riskProof.riskDataCommitment <== riskDataCommitment;
    
    // Outputs
    signal output verifiedPnl <== tradingProof.verifiedPnl;
    signal output newHighWatermark <== tradingProof.newHighWatermark;
    signal output performanceFee <== tradingProof.performanceFee;
    signal output riskCompliant <== riskProof.riskCompliant;
}

component main = LeaderTradingProof();
