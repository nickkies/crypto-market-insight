import { useQuery } from '@tanstack/react-query';
import { marketService } from '../services';

export const useCoinDetail = (coinId: string | null) => {
  return useQuery({
    queryKey: ['coin', coinId],
    queryFn: () => marketService.getCoinDetail(coinId!),
    enabled: !!coinId,
  });
};
