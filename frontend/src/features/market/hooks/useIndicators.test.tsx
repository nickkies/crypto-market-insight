import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useIndicators } from './useIndicators';
import { marketService } from '../services';

vi.mock('../services', () => ({
  marketService: {
    getIndicators: vi.fn(),
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

const mockIndicatorData = {
  coinId: 'bitcoin',
  rsi: { value: 45.5, status: 'NEUTRAL' as const },
  macd: {
    macd: 150.5,
    signal: 120.3,
    histogram: 30.2,
    status: 'BULLISH' as const,
  },
  ma: { ma20: 95000, ma50: 92000 },
  bollingerBands: { upper: 100000, middle: 95000, lower: 90000 },
};

describe('useIndicators', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('coinId가 있으면 데이터를 가져온다', async () => {
    vi.mocked(marketService.getIndicators).mockResolvedValue(mockIndicatorData);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useIndicators({ coinId: 'bitcoin' }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockIndicatorData);
    expect(marketService.getIndicators).toHaveBeenCalledWith('bitcoin', 365);
  });

  it('coinId가 null이면 쿼리를 실행하지 않는다', async () => {
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useIndicators({ coinId: null }), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isFetching).toBe(false);
    expect(marketService.getIndicators).not.toHaveBeenCalled();
  });

  it('기본 period는 365이다', async () => {
    vi.mocked(marketService.getIndicators).mockResolvedValue(mockIndicatorData);
    const queryClient = createTestQueryClient();

    renderHook(() => useIndicators({ coinId: 'bitcoin' }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(marketService.getIndicators).toHaveBeenCalledWith('bitcoin', 365);
    });
  });

  it('다른 period를 지정할 수 있다', async () => {
    vi.mocked(marketService.getIndicators).mockResolvedValue(mockIndicatorData);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(
      () => useIndicators({ coinId: 'bitcoin', period: 90 }),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(marketService.getIndicators).toHaveBeenCalledWith('bitcoin', 90);
  });

  it('에러 발생 시 에러 상태를 반환한다', async () => {
    vi.mocked(marketService.getIndicators).mockRejectedValue(
      new Error('API Error'),
    );
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useIndicators({ coinId: 'bitcoin' }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('queryKey에 coinId와 period가 포함된다', async () => {
    vi.mocked(marketService.getIndicators).mockResolvedValue(mockIndicatorData);
    const queryClient = createTestQueryClient();

    renderHook(() => useIndicators({ coinId: 'ethereum', period: 180 }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(marketService.getIndicators).toHaveBeenCalled();
    });

    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    expect(queries[0].queryKey).toContain('indicators');
    expect(queries[0].queryKey).toContain('ethereum');
    expect(queries[0].queryKey).toContain(180);
  });
});
