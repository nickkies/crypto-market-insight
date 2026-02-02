import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { marketService } from '../services';
import { useRateLimitCountdown } from '@/features/common/hooks';

interface UseIndicatorsOptions {
  coinId: string | null;
  period?: number;
}

export const useIndicators = ({
  coinId,
  period = 365,
}: UseIndicatorsOptions) => {
  const [retryTrigger, setRetryTrigger] = useState(0);

  const triggerRetry = useCallback(() => {
    setRetryTrigger((t) => t + 1);
  }, []);

  const query = useQuery({
    queryKey: ['indicators', coinId, period, retryTrigger],
    queryFn: () => marketService.getIndicators(coinId!, period),
    enabled: !!coinId,
    staleTime: 5 * 60 * 1000, // 5분
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
