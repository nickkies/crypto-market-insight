import { useMutation, type UseMutateFunction } from '@tanstack/react-query';
import { backtestService } from '../services';
import type { BacktestRequestDto, BacktestResult } from '../types';
import { ApiError, isApiError } from '@/features/common/api';

interface RateLimitError {
  isRateLimit: true;
  retryAfter: number;
  message: string;
}

interface UseRunBacktestResult {
  runBacktest: UseMutateFunction<BacktestResult, Error, BacktestRequestDto>;
  data: BacktestResult | undefined;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  rateLimitError: RateLimitError | null;
  reset: () => void;
}

export function useRunBacktest(): UseRunBacktestResult {
  const mutation = useMutation({
    mutationFn: backtestService.runBacktest,
  });

  // Rate Limit 에러 파싱
  let rateLimitError: RateLimitError | null = null;
  if (mutation.error && isApiError(mutation.error)) {
    const apiError = mutation.error as ApiError;
    if (apiError.isRateLimitError) {
      // Retry-After 헤더는 ApiError에서 추출 (기본값 60초)
      const retryAfter = 60;
      rateLimitError = {
        isRateLimit: true,
        retryAfter,
        message: `요청이 너무 많습니다. ${retryAfter}초 후 다시 시도해주세요.`,
      };
    }
  }

  return {
    runBacktest: mutation.mutate,
    data: mutation.data,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    rateLimitError,
    reset: mutation.reset,
  };
}
