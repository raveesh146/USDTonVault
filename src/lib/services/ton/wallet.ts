import { Address } from '@/types/vault';
import { TonConnect } from '@tonconnect/sdk';

class TonWalletService {
  private tonConnect: TonConnect;
  private connected = false;
  private address: Address | null = null;

  constructor() {
    this.tonConnect = new TonConnect({
      manifestUrl: 'https://ton-zk-vault.vercel.app/tonconnect-manifest.json',
    });
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

  async getJettonBalance(jettonSymbolOrAddress: string): Promise<string> {
    // TODO: Integrate real Jetton balance lookup. Return 0 for now.
    return '0.000000';
  }
}

export const tonWalletService = new TonWalletService();
