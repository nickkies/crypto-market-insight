import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favorites: string[];
  addFavorite: (coinId: string) => void;
  removeFavorite: (coinId: string) => void;
  toggleFavorite: (coinId: string) => void;
  isFavorite: (coinId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (coinId) =>
        set((state) => ({
          favorites: state.favorites.includes(coinId)
            ? state.favorites
            : [...state.favorites, coinId],
        })),
      removeFavorite: (coinId) =>
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== coinId),
        })),
      toggleFavorite: (coinId) => {
        const { favorites } = get();
        if (favorites.includes(coinId)) {
          set({ favorites: favorites.filter((id) => id !== coinId) });
        } else {
          set({ favorites: [...favorites, coinId] });
        }
      },
      isFavorite: (coinId) => get().favorites.includes(coinId),
    }),
    {
      name: 'crypto-favorites',
    },
  ),
);
