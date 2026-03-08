import { create } from "zustand";

interface SupplyChainState {
  activeCommodity: string | null;
  toggleCommodity: (symbol: string) => void;
  clearCommodity: () => void;
}

export const useSupplyChainStore = create<SupplyChainState>((set) => ({
  activeCommodity: null,
  toggleCommodity: (symbol) =>
    set((s) => ({
      activeCommodity: s.activeCommodity === symbol ? null : symbol,
    })),
  clearCommodity: () => set({ activeCommodity: null }),
}));
