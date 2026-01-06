import { useQuery } from '@tanstack/react-query';
import { marketService, type Timeframe } from '../services';

interface UseOhlcvOptions {
  coinId: string | null;
  timeframe?: Timeframe;
}

export const useOhlcv = ({ coinId, timeframe = '1d' }: UseOhlcvOptions) => {
  return useQuery({
    queryKey: ['ohlcv', coinId, timeframe],
    queryFn: () => marketService.getOhlcv(coinId!, timeframe),
    enabled: !!coinId,
  });
};
