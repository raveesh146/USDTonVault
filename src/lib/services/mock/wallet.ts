import { Address } from '@/types/vault';

class MockWalletService {
  private connected = false;
  private address: Address | null = null;

  async connect(): Promise<Address> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.connected = true;
    this.address = 'EQCMockWallet1234567890abcdefghijk';
    
    return this.address;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.address = null;
  }

  getAddress(): Address | null {
    return this.address;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async getJettonBalance(jettonAddr: string): Promise<string> {
    // Mock USDT balance
    return '10000.000000';
  }
}

export const mockWalletService = new MockWalletService();
