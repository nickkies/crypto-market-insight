import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { marketService, type Timeframe } from '../services';
import { useRateLimitCountdown } from '@/features/common/hooks';

interface UseOhlcvOptions {
  coinId: string | null;
  timeframe?: Timeframe;
}

export const useOhlcv = ({ coinId, timeframe = '1d' }: UseOhlcvOptions) => {
  const [retryTrigger, setRetryTrigger] = useState(0);

  const triggerRetry = useCallback(() => {
    setRetryTrigger((t) => t + 1);
  }, []);

  const query = useQuery({
    queryKey: ['ohlcv', coinId, timeframe, retryTrigger],
    queryFn: () => marketService.getOhlcv(coinId!, timeframe),
    enabled: !!coinId,
    retry: false,
  });

  const { countdown, isRateLimited } = useRateLimitCountdown(
    query.error as { status?: number; retryAfterSeconds?: number | null },
    { onCountdownEnd: triggerRetry },
  );

  const retry = useCallback(() => {
    if (!isRateLimited) {
      triggerRetry();
    }
  }, [isRateLimited, triggerRetry]);

  return {
    ...query,
    countdown,
    retry,
  };
};
