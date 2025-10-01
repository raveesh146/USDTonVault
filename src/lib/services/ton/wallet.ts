import { Address } from '@/types/vault';
import { TonConnect, Wallet } from '@tonconnect/sdk';
import { TonClient } from '@ton/ton';
import { getHttpEndpoint } from '@orbs-network/ton-access';

class TonWalletService {
  private tonConnect: TonConnect;
  private connected = false;
  private address: Address | null = null;
  private client: TonClient | null = null;

  constructor() {
    this.tonConnect = new TonConnect({
      manifestUrl: 'http://localhost:8080/tonconnect-manifest.json',
    });

    // Listen for connection status changes
    this.tonConnect.onStatusChange((wallet: Wallet | null) => {
      if (wallet) {
        this.connected = true;
        this.address = wallet.account.address as Address;
      } else {
        this.connected = false;
        this.address = null;
      }
    });
  }

  private async getClient(): Promise<TonClient> {
    if (!this.client) {
      const endpoint = await getHttpEndpoint({ network: 'testnet' });
      this.client = new TonClient({ endpoint });
    }
    return this.client;
  }

  async connect(): Promise<Address> {
    try {
      const wallets = await this.tonConnect.getWallets();
      if (wallets.length === 0) {
        throw new Error('No wallets available');
      }

      const wallet = wallets[0];
      const result = await this.tonConnect.connect(wallet);
      
      if (result && typeof result === 'object' && result !== null && 'account' in result) {
        this.connected = true;
        this.address = (result as any).account.address as Address;
        return this.address;
      }
      
      throw new Error('Connection rejected');
    } catch (error) {
      console.error('TonConnect error:', error);
      throw new Error('Failed to connect wallet');
    }
  }

  async disconnect(): Promise<void> {
    await this.tonConnect.disconnect();
    this.connected = false;
    this.address = null;
  }

  getAddress(): Address | null {
    return this.address;
  }

  isConnected(): boolean {
    return this.connected && !!this.address;
  }

  async getTonBalance(): Promise<string> {
    try {
      if (!this.address) {
        return '0.000000';
      }

      const client = await this.getClient();
      const balance = await client.getBalance(this.address as any);
      
      // Convert nanoTON to TON
      return (Number(balance) / 1e9).toFixed(6);
    } catch (error) {
      console.error('Error fetching TON balance:', error);
      return '0.000000';
    }
  }

  async getJettonBalance(jettonSymbolOrAddress: string): Promise<string> {
    // TODO: Integrate real Jetton balance lookup
    // This would require querying the Jetton wallet contract
    return '0.000000';
  }

  // Get the TonConnect instance for sending transactions
  getTonConnect(): TonConnect {
    return this.tonConnect;
  }

  // Send a transaction
  async sendTransaction(params: {
    to: string;
    value: string;
    payload?: string;
  }): Promise<string> {
    try {
      if (!this.connected) {
        throw new Error('Wallet not connected');
      }

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
        messages: [
          {
            address: params.to,
            amount: params.value,
            payload: params.payload,
          },
        ],
      };

      const result = await this.tonConnect.sendTransaction(transaction);
      return result.boc; // Return the transaction BOC
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw new Error('Failed to send transaction');
    }
  }
}

export const tonWalletService = new TonWalletService();
