import { useState, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { marketService } from '../services';
import { useRateLimitCountdown } from '@/features/common/hooks';

const PAGE_SIZE = 20;

interface UseCoinsInfiniteOptions {
  keyword?: string;
  category?: string;
}

export const useCoinsInfinite = ({
  keyword,
  category,
}: UseCoinsInfiniteOptions = {}) => {
  const [retryTrigger, setRetryTrigger] = useState(0);

  const triggerRetry = useCallback(() => {
    setRetryTrigger((t) => t + 1);
  }, []);

  const query = useInfiniteQuery({
    queryKey: ['coins', { keyword, category, retryTrigger }],
    queryFn: ({ pageParam = 1 }) =>
      marketService.getCoins({
        page: pageParam,
        size: PAGE_SIZE,
        keyword: keyword || undefined,
        category: category || undefined,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.coins.length < PAGE_SIZE) {
        return undefined;
      }
      return lastPage.page + 1;
    },
    initialPageParam: 1,
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
