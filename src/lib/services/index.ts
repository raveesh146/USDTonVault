// Service facade that switches between mock and real implementations
import { mockWalletService } from './mock/wallet';
import { mockVaultService } from './mock/vault';
import { mockAdminService } from './mock/admin';
import { mockPricesService } from './mock/prices';

// Real TON services
import { tonWalletService } from './ton/wallet';
import { tonVaultService } from './ton/vault';
import { tonAdminService } from './ton/admin';
import { tonPricesService } from './ton/prices';

// Type definitions for services
export type WalletService = typeof mockWalletService;
export type VaultService = typeof mockVaultService;
export type AdminService = typeof mockAdminService;
export type PricesService = typeof mockPricesService;

export const getWalletService = (demoMode: boolean): WalletService => {
  return demoMode ? mockWalletService : (tonWalletService as any);
};

export const getVaultService = (demoMode: boolean): VaultService => {
  return demoMode ? mockVaultService : (tonVaultService as any);
};

export const getAdminService = (demoMode: boolean): AdminService => {
  return demoMode ? mockAdminService : (tonAdminService as any);
};

export const getPricesService = (demoMode: boolean): PricesService => {
  return demoMode ? mockPricesService : (tonPricesService as any);
};
