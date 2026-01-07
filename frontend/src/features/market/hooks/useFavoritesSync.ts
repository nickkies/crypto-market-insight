import { useEffect, useCallback, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth';
import { useFavoritesStore } from '../stores';
import { favoriteService } from '../services';

const FAVORITES_QUERY_KEY = ['favorites'];

export function useFavoritesSync() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { favorites, addFavorite, removeFavorite, toggleFavorite } =
    useFavoritesStore();
  const hasSyncedRef = useRef(false);

  // 서버에서 즐겨찾기 목록 조회
  const { data: serverFavorites, isLoading } = useQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: favoriteService.getFavorites,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5분
  });

  // 로그인 시 서버 데이터와 로컬 데이터 병합
  useEffect(() => {
    if (!isAuthenticated || !serverFavorites || hasSyncedRef.current) return;

    const serverCoinIds = serverFavorites.map((f) => f.coinId);
    const localCoinIds = favorites;

    // 로컬에만 있는 것들을 서버에 추가
    const localOnlyIds = localCoinIds.filter(
      (id) => !serverCoinIds.includes(id),
    );

    // 서버에만 있는 것들을 로컬에 추가
    serverCoinIds.forEach((coinId) => {
      if (!localCoinIds.includes(coinId)) {
        addFavorite(coinId);
      }
    });

    // 로컬에만 있는 것들을 서버에 추가 (백그라운드)
    localOnlyIds.forEach((coinId) => {
      favoriteService.addFavorite(coinId).catch(() => {
        // 실패해도 로컬 상태는 유지
      });
    });

    hasSyncedRef.current = true;
  }, [isAuthenticated, serverFavorites, favorites, addFavorite]);

  // 로그아웃 시 sync 상태 리셋
  useEffect(() => {
    if (!isAuthenticated) {
      hasSyncedRef.current = false;
    }
  }, [isAuthenticated]);

  // 즐겨찾기 추가 mutation
  const addMutation = useMutation({
    mutationFn: favoriteService.addFavorite,
    onMutate: async (coinId: string) => {
      // 낙관적 업데이트
      addFavorite(coinId);
      return { coinId };
    },
    onError: (_error, _coinId, context) => {
      // 롤백
      if (context?.coinId) {
        removeFavorite(context.coinId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
    },
  });

  // 즐겨찾기 삭제 mutation
  const removeMutation = useMutation({
    mutationFn: favoriteService.removeFavorite,
    onMutate: async (coinId: string) => {
      // 낙관적 업데이트
      removeFavorite(coinId);
      return { coinId };
    },
    onError: (_error, _coinId, context) => {
      // 롤백
      if (context?.coinId) {
        addFavorite(context.coinId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
    },
  });

  // 통합 토글 함수
  const syncToggleFavorite = useCallback(
    (coinId: string) => {
      if (!isAuthenticated) {
        // 비로그인 시 로컬만 사용
        toggleFavorite(coinId);
        return;
      }

      const isFav = favorites.includes(coinId);
      if (isFav) {
        removeMutation.mutate(coinId);
      } else {
        addMutation.mutate(coinId);
      }
    },
    [isAuthenticated, favorites, toggleFavorite, addMutation, removeMutation],
  );

  return {
    favorites,
    isLoading,
    isSyncing: addMutation.isPending || removeMutation.isPending,
    toggleFavorite: syncToggleFavorite,
    isFavorite: (coinId: string) => favorites.includes(coinId),
  };
}
