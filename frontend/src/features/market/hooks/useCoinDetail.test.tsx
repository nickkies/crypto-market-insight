import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCoinDetail } from './useCoinDetail';
import { marketService } from '../services';

vi.mock('../services', () => ({
  marketService: {
    getCoinDetail: vi.fn(),
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

const mockCoinDetail = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  image: 'https://example.com/btc.png',
  currentPrice: 97500,
  marketCap: 1900000000000,
  marketCapRank: 1,
  totalVolume: 50000000000,
  high24h: 98000,
  low24h: 96000,
  priceChange24h: 1500,
  priceChangePercentage24h: 1.56,
  circulatingSupply: 19500000,
  totalSupply: 21000000,
  lastUpdated: '2024-01-15T12:00:00Z',
};

describe('useCoinDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('coinId가 있으면 데이터를 가져온다', async () => {
    vi.mocked(marketService.getCoinDetail).mockResolvedValue(mockCoinDetail);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useCoinDetail('bitcoin'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockCoinDetail);
    expect(marketService.getCoinDetail).toHaveBeenCalledWith('bitcoin');
  });

  it('coinId가 null이면 쿼리를 실행하지 않는다', async () => {
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useCoinDetail(null), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isFetching).toBe(false);
    expect(marketService.getCoinDetail).not.toHaveBeenCalled();
  });

  it('에러 발생 시 에러 상태를 반환한다', async () => {
    vi.mocked(marketService.getCoinDetail).mockRejectedValue(
      new Error('API Error'),
    );
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useCoinDetail('bitcoin'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('queryKey에 coinId가 포함된다', async () => {
    vi.mocked(marketService.getCoinDetail).mockResolvedValue(mockCoinDetail);
    const queryClient = createTestQueryClient();

    renderHook(() => useCoinDetail('bitcoin'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(marketService.getCoinDetail).toHaveBeenCalled();
    });

    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    expect(queries[0].queryKey[0]).toBe('coin');
    expect(queries[0].queryKey[1]).toBe('bitcoin');
  });

  it('다른 coinId로 변경하면 새로운 데이터를 가져온다', async () => {
    const ethereumDetail = { ...mockCoinDetail, id: 'ethereum', symbol: 'eth' };
    vi.mocked(marketService.getCoinDetail)
      .mockResolvedValueOnce(mockCoinDetail)
      .mockResolvedValueOnce(ethereumDetail);
    const queryClient = createTestQueryClient();

    const { result, rerender } = renderHook(
      ({ coinId }) => useCoinDetail(coinId),
      {
        wrapper: createWrapper(queryClient),
        initialProps: { coinId: 'bitcoin' as string | null },
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.id).toBe('bitcoin');

    rerender({ coinId: 'ethereum' });

    await waitFor(() => {
      expect(result.current.data?.id).toBe('ethereum');
    });
  });

  it('로딩 중 상태를 반환한다', async () => {
    vi.mocked(marketService.getCoinDetail).mockImplementation(
      () => new Promise(() => {}),
    );
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useCoinDetail('bitcoin'), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('429 에러 시 60초 카운트다운을 시작한다', async () => {
    const rateLimitError = { status: 429, message: 'Rate limit exceeded' };
    vi.mocked(marketService.getCoinDetail).mockRejectedValue(rateLimitError);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useCoinDetail('bitcoin'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.countdown).toBe(60);
  });

  it('429 에러에 retryAfterSeconds가 있으면 해당 값으로 카운트다운한다', async () => {
    const rateLimitError = {
      status: 429,
      message: 'Rate limit exceeded',
      retryAfterSeconds: 30,
    };
    vi.mocked(marketService.getCoinDetail).mockRejectedValue(rateLimitError);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useCoinDetail('bitcoin'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.countdown).toBe(30);
  });

  it('일반 에러 시 retry가 동작한다', async () => {
    vi.mocked(marketService.getCoinDetail)
      .mockRejectedValueOnce(new Error('Error'))
      .mockResolvedValueOnce(mockCoinDetail);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useCoinDetail('bitcoin'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.countdown).toBe(0);

    act(() => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
