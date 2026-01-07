import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favorites: string[];
  addFavorite: (coinId: string) => void;
  removeFavorite: (coinId: string) => void;
  toggleFavorite: (coinId: string) => void;
  isFavorite: (coinId: string) => boolean;
  setFavorites: (favorites: string[]) => void;
  mergeFavorites: (serverFavorites: string[]) => string[];
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
      setFavorites: (favorites) => set({ favorites }),
      mergeFavorites: (serverFavorites) => {
        const localFavorites = get().favorites;
        // 합집합: 서버 + 로컬에만 있는 것
        const merged = [...new Set([...serverFavorites, ...localFavorites])];
        set({ favorites: merged });
        // 로컬에만 있던 것 반환
        return localFavorites.filter((id) => !serverFavorites.includes(id));
      },
    }),
    {
      name: 'crypto-favorites',
    },
  ),
);
