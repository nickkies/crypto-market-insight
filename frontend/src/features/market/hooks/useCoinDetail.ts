import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { marketService } from '../services';

const RATE_LIMIT_COOLDOWN = 60;

export const useCoinDetail = (coinId: string | null) => {
  const [countdown, setCountdown] = useState(0);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const query = useQuery({
    queryKey: ['coin', coinId, retryTrigger],
    queryFn: () => marketService.getCoinDetail(coinId!),
    enabled: !!coinId && countdown === 0,
    retry: false,
  });

  const isRateLimitError = (query.error as { status?: number })?.status === 429;

  useEffect(() => {
    if (isRateLimitError && countdown === 0) {
      setCountdown(RATE_LIMIT_COOLDOWN);
    }
  }, [isRateLimitError, countdown]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setRetryTrigger((t) => t + 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const retry = useCallback(() => {
    if (countdown === 0) {
      setRetryTrigger((t) => t + 1);
    }
  }, [countdown]);

  return {
    ...query,
    countdown,
    retry,
  };
};
