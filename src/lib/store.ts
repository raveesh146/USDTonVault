import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VaultStats, MyPosition, VaultEvent, EpochSummary, RiskLimits, NavDataPoint } from '@/types/vault';

interface AppState {
  // Wallet
  walletAddress: string | null;
  usdtBalance: string;
  setWalletAddress: (address: string | null) => void;
  setUsdtBalance: (balance: string) => void;

  // Demo mode
  demoMode: boolean;
  toggleDemoMode: () => void;
  setDemoMode: (value: boolean) => void;

  // Vault data
  vaultStats: VaultStats | null;
  myPosition: MyPosition | null;
  events: VaultEvent[];
  epochs: EpochSummary[];
  navSeries: NavDataPoint[];
  riskLimits: RiskLimits | null;

  setVaultStats: (stats: VaultStats) => void;
  setMyPosition: (position: MyPosition) => void;
  setEvents: (events: VaultEvent[]) => void;
  addEvent: (event: VaultEvent) => void;
  setEpochs: (epochs: EpochSummary[]) => void;
  updateEpoch: (epochId: number, updates: Partial<EpochSummary>) => void;
  setNavSeries: (series: NavDataPoint[]) => void;
  setRiskLimits: (limits: RiskLimits) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      walletAddress: null,
      usdtBalance: '0',
      demoMode: false,
      vaultStats: null,
      myPosition: null,
      events: [],
      epochs: [],
      navSeries: [],
      riskLimits: null,

      // Actions
      setWalletAddress: (address) => set({ walletAddress: address }),
      setUsdtBalance: (balance) => set({ usdtBalance: balance }),
      toggleDemoMode: () => set((state) => ({ demoMode: !state.demoMode })),
      setDemoMode: (value: boolean) => set({ demoMode: value }),
      
      setVaultStats: (stats) => set({ vaultStats: stats }),
      setMyPosition: (position) => set({ myPosition: position }),
      setEvents: (events) => set({ events }),
      addEvent: (event) => set((state) => ({ events: [event, ...state.events] })),
      setEpochs: (epochs) => set({ epochs }),
      updateEpoch: (epochId, updates) => set((state) => ({
        epochs: state.epochs.map((e) => 
          e.epochId === epochId ? { ...e, ...updates } : e
        ),
      })),
      setNavSeries: (series) => set({ navSeries: series }),
      setRiskLimits: (limits) => set({ riskLimits: limits }),
    }),
    {
      name: 'zk-copy-vault-storage',
      partialize: (state) => ({ 
        demoMode: state.demoMode,
        walletAddress: state.walletAddress,
      }),
    }
  )
);
