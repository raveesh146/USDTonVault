import { TradingProofGenerator, TradingData } from '../proofGenerator';
import { TradingDataManager } from '../proofUtils';

/**
 * Example script for generating a trading proof
 */
async function generateProofExample() {
  console.log('🚀 Starting proof generation example...');

  try {
    // Initialize the proof generator
    const generator = new TradingProofGenerator(
      './trading_proof.wasm',
      './trading_proof_0001.zkey',
      './verification_key.json'
    );

    // Generate mock trading data
    const tradingData = TradingDataManager.generateMockTradingData(47);
    const riskLimits = TradingDataManager.generateMockRiskLimits();
    const highWatermark = 947; // 9.47% in basis points

    console.log('📊 Trading Data:', {
      epochId: tradingData.epochId,
      initialNav: tradingData.initialNav,
      finalNav: tradingData.finalNav,
      trades: tradingData.trades.length,
      positions: tradingData.positions.length
    });

    // Validate trading data
    const validation = TradingDataManager.validateTradingData(tradingData);
    if (!validation.isValid) {
      console.error('❌ Invalid trading data:', validation.errors);
      return;
    }

    console.log('✅ Trading data validation passed');

    // Generate the proof
    console.log('🔐 Generating proof...');
    const startTime = Date.now();
    
    const proofResult = await generator.generateProof(tradingData, riskLimits, highWatermark);
    
    const endTime = Date.now();
    console.log(`✅ Proof generated in ${endTime - startTime}ms`);

    // Display results
    console.log('📋 Proof Results:', {
      verifiedPnl: proofResult.verifiedPnl,
      newHighWatermark: proofResult.newHighWatermark,
      performanceFee: proofResult.performanceFee,
      riskCompliant: proofResult.riskCompliant
    });

    // Format proof for chain
    const chainProof = generator.formatProofForChain(proofResult.proof);
    console.log('🔗 Chain-formatted proof:', chainProof);

    // Calculate proof hash
    const proofHash = require('crypto')
      .createHash('sha256')
      .update(JSON.stringify(proofResult))
      .digest('hex');
    
    console.log('🔑 Proof Hash:', proofHash);

    // Store proof locally (for demonstration)
    const proofData = {
      proof: chainProof,
      publicSignals: proofResult.publicSignals,
      metadata: {
        epochId: tradingData.epochId,
        generatedAt: new Date().toISOString(),
        proofHash
      }
    };

    const fs = require('fs');
    fs.writeFileSync(
      `./proofs/proof_epoch_${tradingData.epochId}.json`,
      JSON.stringify(proofData, null, 2)
    );

    console.log(`💾 Proof saved to ./proofs/proof_epoch_${tradingData.epochId}.json`);

    // Calculate trading statistics
    const stats = TradingDataManager.calculateTradingStats(tradingData);
    console.log('📈 Trading Statistics:', stats);

  } catch (error) {
    console.error('❌ Error generating proof:', error);
  }
}

/**
 * Batch proof generation for multiple epochs
 */
async function generateBatchProofs(epochCount: number = 5) {
  console.log(`🚀 Generating proofs for ${epochCount} epochs...`);

  const generator = new TradingProofGenerator(
    './trading_proof.wasm',
    './trading_proof_0001.zkey',
    './verification_key.json'
  );

  const results = [];

  for (let i = 0; i < epochCount; i++) {
    try {
      console.log(`\n📊 Processing epoch ${i + 1}/${epochCount}...`);
      
      const tradingData = TradingDataManager.generateMockTradingData(i + 1);
      const riskLimits = TradingDataManager.generateMockRiskLimits();
      const highWatermark = 900 + Math.random() * 100; // 9-10%

      const proofResult = await generator.generateProof(tradingData, riskLimits, highWatermark);
      
      results.push({
        epochId: tradingData.epochId,
        proofResult,
        tradingData
      });

      console.log(`✅ Epoch ${i + 1} proof generated`);
    } catch (error) {
      console.error(`❌ Error generating proof for epoch ${i + 1}:`, error);
    }
  }

  console.log(`\n🎉 Batch generation complete! Generated ${results.length} proofs`);
  
  // Save batch results
  const fs = require('fs');
  fs.writeFileSync(
    './proofs/batch_results.json',
    JSON.stringify(results, null, 2)
  );

  return results;
}

// Run the example if this script is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--batch')) {
    const epochCount = parseInt(args[args.indexOf('--batch') + 1]) || 5;
    generateBatchProofs(epochCount);
  } else {
    generateProofExample();
  }
}

export { generateProofExample, generateBatchProofs };
