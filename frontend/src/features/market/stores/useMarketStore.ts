import { create } from 'zustand';
import type { Timeframe } from '../services';

type SortOrder =
  | 'market_cap_desc'
  | 'market_cap_asc'
  | 'price_desc'
  | 'price_asc';

interface MarketState {
  selectedCoinId: string | null;
  timeframe: Timeframe;
  searchQuery: string;
  sortOrder: SortOrder;
  setSelectedCoinId: (coinId: string | null) => void;
  setTimeframe: (timeframe: Timeframe) => void;
  setSearchQuery: (query: string) => void;
  setSortOrder: (order: SortOrder) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  selectedCoinId: null,
  timeframe: '1d',
  searchQuery: '',
  sortOrder: 'market_cap_desc',
  setSelectedCoinId: (coinId) => set({ selectedCoinId: coinId }),
  setTimeframe: (timeframe) => set({ timeframe }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortOrder: (order) => set({ sortOrder: order }),
}));
