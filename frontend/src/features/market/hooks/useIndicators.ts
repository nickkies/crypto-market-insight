import { useQuery } from '@tanstack/react-query';
import { marketService } from '../services';

interface UseIndicatorsOptions {
  coinId: string | null;
  period?: number;
}

export const useIndicators = ({
  coinId,
  period = 365,
}: UseIndicatorsOptions) => {
  return useQuery({
    queryKey: ['indicators', coinId, period],
    queryFn: () => marketService.getIndicators(coinId!, period),
    enabled: !!coinId,
    staleTime: 5 * 60 * 1000, // 5분
  });
};
