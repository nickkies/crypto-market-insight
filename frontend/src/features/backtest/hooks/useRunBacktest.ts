import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { backtestService } from '../services';
import type { BacktestRequestDto, BacktestResult } from '../types';
import { ApiError, isApiError } from '@/features/common/api';

interface RateLimitError {
  isRateLimit: true;
  retryAfter: number;
  message: string;
}

interface UseRunBacktestResult {
  runBacktest: (request: BacktestRequestDto) => void;
  data: BacktestResult | undefined;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  rateLimitError: RateLimitError | null;
  reset: () => void;
}

export function useRunBacktest(): UseRunBacktestResult {
  const queryClient = useQueryClient();
  const [request, setRequest] = useState<BacktestRequestDto | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const query = useQuery({
    queryKey: ['backtest', request, retryTrigger],
    queryFn: () => backtestService.runBacktest(request!),
    enabled: !!request,
    staleTime: 1000 * 60 * 30, // 30분 (같은 파라미터면 캐시 사용)
    retry: false,
  });

  // 새 백테스트 실행 성공 시 목록 갱신
  if (query.isSuccess && request) {
    queryClient.invalidateQueries({ queryKey: ['myBacktests'] });
  }

  // Rate Limit 에러 파싱
  let rateLimitError: RateLimitError | null = null;
  if (query.error && isApiError(query.error)) {
    const apiError = query.error as ApiError;
    if (apiError.isRateLimitError) {
      rateLimitError = {
        isRateLimit: true,
        retryAfter: 60,
        message: '요청이 너무 많습니다.',
      };
    }
  }

  const runBacktest = (newRequest: BacktestRequestDto) => {
    // 같은 request로 재시도할 때 캐시된 에러를 피하기 위해 trigger 증가
    setRetryTrigger((t) => t + 1);
    setRequest(newRequest);
  };

  const reset = () => {
    setRequest(null);
  };

  return {
    runBacktest,
    data: query.data,
    isPending: query.isPending && !!request,
    isError: query.isError,
    error: query.error,
    rateLimitError,
    reset,
  };
}
