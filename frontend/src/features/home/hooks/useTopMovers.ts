import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { marketService } from '@/features/market/services';

type FilterType = 'all' | 'gainers' | 'losers';

interface UseTopMoversOptions {
  filter?: FilterType;
  count?: number;
}

export function useTopMovers({
  filter = 'all',
  count = 10,
}: UseTopMoversOptions = {}) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['topMovers'],
    queryFn: () => marketService.getCoins({ page: 1, size: 50 }),
    staleTime: 5 * 60 * 1000,
  });

  const topMovers = useMemo(() => {
    if (!data?.coins) return [];

    let filtered = [...data.coins];

    if (filter === 'gainers') {
      filtered = filtered.filter((coin) => coin.priceChangePercentage24h > 0);
    } else if (filter === 'losers') {
      filtered = filtered.filter((coin) => coin.priceChangePercentage24h < 0);
    }

    return filtered
      .sort(
        (a, b) =>
          Math.abs(b.priceChangePercentage24h) -
          Math.abs(a.priceChangePercentage24h),
      )
      .slice(0, count);
  }, [data, filter, count]);

  return {
    data: topMovers,
    isLoading,
    isError,
    error,
    refetch,
  };
}
