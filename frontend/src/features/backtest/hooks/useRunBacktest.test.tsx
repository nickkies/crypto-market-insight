import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useRunBacktest } from './useRunBacktest';
import { backtestService } from '../services';
import { ApiError } from '@/features/common/api';
import type { BacktestResult } from '../types';

vi.mock('../services', () => ({
  backtestService: {
    runBacktest: vi.fn(),
  },
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockBacktestResult: BacktestResult = {
  id: 1,
  coinId: 'bitcoin',
  strategyType: 'RSI',
  timeframe: '1d',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  metrics: {
    tradeCount: 5,
    winRate: 60,
    mdd: -10,
    cumulativeReturn: 15.5,
  },
  trades: [],
  equityCurve: [],
  drawdownCurve: [],
  createdAt: '2024-01-31T12:00:00Z',
};

const mockRequest = {
  coinId: 'bitcoin',
  strategyType: 'RSI' as const,
  timeframe: '1d',
  rsiParameters: { period: 14, overbought: 70, oversold: 30 },
};

describe('useRunBacktest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('초기 상태는 데이터가 없다', () => {
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useRunBacktest(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('runBacktest 호출 시 백테스트를 실행한다', async () => {
    vi.mocked(backtestService.runBacktest).mockResolvedValue(
      mockBacktestResult,
    );
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useRunBacktest(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.runBacktest(mockRequest);
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(backtestService.runBacktest).toHaveBeenCalledWith(mockRequest);
    expect(result.current.data?.id).toBe(1);
  });

  it('로딩 중 상태를 반환한다', async () => {
    vi.mocked(backtestService.runBacktest).mockImplementation(
      () => new Promise(() => {}),
    );
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useRunBacktest(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.runBacktest(mockRequest);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });
  });

  it('에러 발생 시 에러 상태를 반환한다', async () => {
    vi.mocked(backtestService.runBacktest).mockRejectedValue(
      new Error('API Error'),
    );
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useRunBacktest(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.runBacktest(mockRequest);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it('Rate Limit 에러 시 rateLimitError를 반환한다', async () => {
    const rateLimitError = new ApiError(
      429,
      'RATE_LIMIT_EXCEEDED',
      'Too Many Requests',
    );
    vi.mocked(backtestService.runBacktest).mockRejectedValue(rateLimitError);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useRunBacktest(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.runBacktest(mockRequest);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.rateLimitError).toBeDefined();
    expect(result.current.rateLimitError?.isRateLimit).toBe(true);
  });

  it('reset 호출 시 상태를 초기화한다', async () => {
    vi.mocked(backtestService.runBacktest).mockResolvedValue(
      mockBacktestResult,
    );
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useRunBacktest(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.runBacktest(mockRequest);
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    act(() => {
      result.current.reset();
    });

    // After reset, isPending should be false since request is null
    expect(result.current.isPending).toBe(false);
  });

  it('에러 후 같은 요청으로 재시도하면 새로운 요청이 실행된다', async () => {
    vi.mocked(backtestService.runBacktest)
      .mockRejectedValueOnce(new Error('API Error'))
      .mockResolvedValueOnce(mockBacktestResult);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useRunBacktest(), {
      wrapper: createWrapper(queryClient),
    });

    // 첫 번째 요청 (에러)
    act(() => {
      result.current.runBacktest(mockRequest);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // 같은 요청으로 재시도
    act(() => {
      result.current.reset();
      result.current.runBacktest(mockRequest);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(false);
      expect(result.current.data).toBeDefined();
    });

    expect(backtestService.runBacktest).toHaveBeenCalledTimes(2);
  });
});
