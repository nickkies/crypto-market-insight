import { client } from '@/features/common/api';

export interface FavoriteResponse {
  id: number;
  coinId: string;
  createdAt: string;
}

export const favoriteService = {
  getFavorites: async (): Promise<FavoriteResponse[]> => {
    const { data } = await client.get<FavoriteResponse[]>('/api/favorites');
    return data;
  },

  addFavorite: async (coinId: string): Promise<FavoriteResponse> => {
    const { data } = await client.post<FavoriteResponse>('/api/favorites', {
      coinId,
    });
    return data;
  },

  removeFavorite: async (coinId: string): Promise<void> => {
    await client.delete(`/api/favorites/${coinId}`);
  },
};
