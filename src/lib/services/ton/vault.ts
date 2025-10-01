import { VaultStats, MyPosition, EpochSummary, VaultEvent, Address } from '@/types/vault';
import { TonClient, Address as TonAddress } from '@ton/ton';
import { getHttpEndpoint } from '@orbs-network/ton-access';
import { Vault } from '../../../../contracts/wrappers/Vault';

// Deployed contract addresses
const VAULT_ADDRESS = 'EQDTcD9WeuhIJzaEpiPVacF-8Q7-GTWRrmeiLcjYhf7jrkXi';
const TRADER_ACCOUNT_ADDRESS = 'EQBascgtPO02miH-Xb9cNsb8LPZf9IwK-xQ-DhS1vjgqg_6i';
const TRADE_LOGGER_ADDRESS = 'EQAo4CLpCcpjaPpxEfGFJnBeCNjlP4NiS_geCYTO9HsaZ8f2';

class TonVaultService {
  private client: TonClient | null = null;
  private vault: Vault | null = null;

  private async getClient(): Promise<TonClient> {
    if (!this.client) {
      const endpoint = await getHttpEndpoint({ network: 'testnet' });
      this.client = new TonClient({ endpoint });
      this.vault = Vault.createFromAddress(TonAddress.parse(VAULT_ADDRESS));
    }
    return this.client;
  }

  async getVaultStats(): Promise<VaultStats> {
    try {
      const client = await this.getClient();
      if (!this.vault) throw new Error('Vault not initialized');

      const vaultContract = client.open(this.vault as any);
      const vaultData = await vaultContract.getVaultData();

      // Convert bigint to string for display
      const totalShares = vaultData.totalShares.toString();
      const totalAssets = vaultData.totalAssets.toString();
      const totalProfit = vaultData.totalProfit.toString();

      // Calculate price per share
      const pricePerShare = vaultData.totalShares > 0n
        ? (Number(vaultData.totalAssets) / Number(vaultData.totalShares)).toFixed(6)
        : '1.000000';

      // Convert nanoTON to TON for display (1 TON = 10^9 nanoTON)
      const totalAssetsTON = (Number(vaultData.totalAssets) / 1e9).toFixed(2);
      const totalProfitTON = (Number(vaultData.totalProfit) / 1e9).toFixed(2);

      // Calculate high watermark (simplified - using current price per share)
      const highWatermark = pricePerShare;

      return {
        epochId: Date.now(), // TODO: Implement epoch tracking
        nav: totalAssetsTON,
        pricePerShare,
        totalAssets: totalAssetsTON,
        totalShares,
        lastVerifiedEpoch: 0, // TODO: Implement epoch verification tracking
        highWatermark,
      };
    } catch (error) {
      console.error('Error fetching vault stats:', error);
      throw new Error('Failed to fetch vault statistics');
    }
  }

  async getMyPosition(addr: Address): Promise<MyPosition> {
    try {
      const client = await this.getClient();
      if (!this.vault) throw new Error('Vault not initialized');

      const vaultContract = client.open(this.vault as any);
      const userAddress = TonAddress.parse(addr);

      // Get user shares
      const userShares = await vaultContract.getUserShares(userAddress);
      
      // Get user balance value (in nanoTON)
      const userBalanceValue = await vaultContract.getUserBalanceValue(userAddress);

      // Get vault data for calculations
      const vaultData = await vaultContract.getVaultData();

      // Convert to TON
      const withdrawableTON = (Number(userBalanceValue) / 1e9).toFixed(2);
      const sharesStr = userShares.toString();

      // TODO: Track deposited amount (would need to be stored separately or tracked via events)
      // For now, calculate based on initial 1:1 ratio assumption
      const depositedTON = (Number(userShares) / 1e9).toFixed(2);

      // Calculate unrealized P&L
      const unrealizedPnl = Number(withdrawableTON) > 0 && Number(depositedTON) > 0
        ? ((Number(withdrawableTON) - Number(depositedTON)) / Number(depositedTON)) * 100
        : 0;

      return {
        shares: sharesStr,
        deposited: depositedTON,
        withdrawable: withdrawableTON,
        unrealizedPnlPct: parseFloat(unrealizedPnl.toFixed(2)),
      };
    } catch (error) {
      console.error('Error fetching user position:', error);
      throw new Error('Failed to fetch user position');
    }
  }

  async depositUSDT(amount: string, senderAddress: Address): Promise<string> {
    try {
      // Convert TON amount to nanoTON
      const amountNano = BigInt(Math.floor(parseFloat(amount) * 1e9));

      // TODO: Integrate with TonConnect to send transaction
      // This requires the wallet connection to be passed in
      console.log('Deposit transaction prepared:', {
        to: VAULT_ADDRESS,
        amount: amountNano.toString(),
        from: senderAddress,
      });

      // Return mock transaction hash for now
      // In production, this would return the actual transaction hash
      throw new Error('Deposit requires TonConnect integration - please use demo mode for now');
    } catch (error) {
      console.error('Error depositing:', error);
      throw error;
    }
  }

  async withdrawShares(amountShares: string, senderAddress: Address): Promise<string> {
    try {
      // Convert shares to bigint
      const sharesBigInt = BigInt(amountShares);

      // TODO: Integrate with TonConnect to send transaction
      console.log('Withdraw transaction prepared:', {
        to: VAULT_ADDRESS,
        shares: sharesBigInt.toString(),
        from: senderAddress,
      });

      // Return mock transaction hash for now
      throw new Error('Withdraw requires TonConnect integration - please use demo mode for now');
    } catch (error) {
      console.error('Error withdrawing:', error);
      throw error;
    }
  }

  async getEpochs(): Promise<EpochSummary[]> {
    // TODO: Implement epoch tracking via TradeLogger contract
    // For now, return empty array
    return [];
  }

  async getEvents(limit: number = 50): Promise<VaultEvent[]> {
    // TODO: Implement event tracking via blockchain transaction history
    // This would require parsing transaction messages from the vault contract
    return [];
  }

  // Utility method to get contract addresses
  getContractAddresses() {
    return {
      vault: VAULT_ADDRESS,
      traderAccount: TRADER_ACCOUNT_ADDRESS,
      tradeLogger: TRADE_LOGGER_ADDRESS,
    };
  }
}

export const tonVaultService = new TonVaultService();
