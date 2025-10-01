// Service facade that switches between mock and real implementations
import { mockWalletService } from './mock/wallet';
import { mockVaultService } from './mock/vault';
import { mockAdminService } from './mock/admin';
import { mockPricesService } from './mock/prices';

// TODO: Import real TON services when ready
// import { tonWalletService } from './ton/wallet';
// import { tonVaultService } from './ton/vault';
// import { tonAdminService } from './ton/admin';
// import { tonPricesService } from './ton/prices';
import { tonWalletService } from './ton/wallet';

export const getWalletService = (demoMode: boolean) => {
  return demoMode ? mockWalletService : tonWalletService;
};

export const getVaultService = (demoMode: boolean) => {
  return demoMode ? mockVaultService : mockVaultService; // : tonVaultService
};

export const getAdminService = (demoMode: boolean) => {
  return demoMode ? mockAdminService : mockAdminService; // : tonAdminService
};

export const getPricesService = (demoMode: boolean) => {
  return demoMode ? mockPricesService : mockPricesService; // : tonPricesService
};
