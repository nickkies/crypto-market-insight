export type Category = 'all' | 'layer-1' | 'defi' | 'meme' | 'gaming' | 'ai';
export type ApiCategory = 'LAYER_1' | 'DEFI' | 'MEME' | 'GAMING' | 'AI';

export interface CategoryOption {
  value: Category;
  label: string;
  color: string;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 'all', label: 'All', color: '#6366f1' },
  { value: 'layer-1', label: 'Layer-1', color: '#3b82f6' },
  { value: 'defi', label: 'DeFi', color: '#8b5cf6' },
  { value: 'meme', label: 'Meme', color: '#f59e0b' },
  { value: 'gaming', label: 'Gaming', color: '#10b981' },
  { value: 'ai', label: 'AI', color: '#ec4899' },
];

export const CATEGORY_TO_API: Record<Category, ApiCategory | undefined> = {
  all: undefined,
  'layer-1': 'LAYER_1',
  defi: 'DEFI',
  meme: 'MEME',
  gaming: 'GAMING',
  ai: 'AI',
};
