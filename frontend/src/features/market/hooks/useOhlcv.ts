import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { marketService, type Timeframe } from '../services';

interface UseOhlcvOptions {
  coinId: string | null;
  timeframe?: Timeframe;
}

const RATE_LIMIT_COOLDOWN = 60; // 60초

export const useOhlcv = ({ coinId, timeframe = '1d' }: UseOhlcvOptions) => {
  const [countdown, setCountdown] = useState(0);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const query = useQuery({
    queryKey: ['ohlcv', coinId, timeframe, retryTrigger],
    queryFn: () => marketService.getOhlcv(coinId!, timeframe),
    enabled: !!coinId && countdown === 0,
    retry: false,
  });

  const isRateLimitError = (query.error as { status?: number })?.status === 429;

  // Rate limit 에러 발생 시 카운트다운 시작
  useEffect(() => {
    if (isRateLimitError && countdown === 0) {
      setCountdown(RATE_LIMIT_COOLDOWN);
    }
  }, [isRateLimitError, countdown]);

  // 카운트다운 타이머
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
