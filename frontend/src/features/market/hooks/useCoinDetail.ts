import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { marketService } from '../services';
import { useRateLimitCountdown } from '@/features/common/hooks';

export const useCoinDetail = (coinId: string | null) => {
  const [retryTrigger, setRetryTrigger] = useState(0);

  const triggerRetry = useCallback(() => {
    setRetryTrigger((t) => t + 1);
  }, []);

  const query = useQuery({
    queryKey: ['coin', coinId, retryTrigger],
    queryFn: () => marketService.getCoinDetail(coinId!),
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
