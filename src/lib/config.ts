// Configuration from environment variables
// In a real Next.js app, these would come from process.env.NEXT_PUBLIC_*
// For this Vite app, we'll use import.meta.env.VITE_* or hardcoded defaults

export const config = {
  network: 'ton_testnet',
  vaultAddress: 'EQCvaultaddress1234567890abcdefghijk',
  controllerAddress: 'EQCcontrolleraddress1234567890abcd',
  verifierAddress: 'EQCverifieraddress1234567890abcde',
  baseJettonUSDT: 'EQCjettonusdt1234567890abcdefghij',
  priceAttesterPubkey: '0xabc123def456789...',
  adminWallet: 'EQCadminwalletaddress1234567890abc',
};

export const isAdmin = (address: string | null): boolean => {
  return address === config.adminWallet;
};
