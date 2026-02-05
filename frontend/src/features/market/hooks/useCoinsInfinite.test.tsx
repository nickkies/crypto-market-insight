import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCoinsInfinite } from './useCoinsInfinite';
import { marketService } from '../services';

vi.mock('../services', () => ({
  marketService: {
    getCoins: vi.fn(),
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

const createMockPage = (page: number, coinCount = 20) => ({
  coins: Array.from({ length: coinCount }, (_, i) => ({
    id: `coin-${page}-${i}`,
    symbol: `c${page}${i}`,
    name: `Coin ${page}-${i}`,
    image: `https://example.com/coin${page}${i}.png`,
    currentPrice: 1000 * (page + i),
    marketCap: 1000000000 * (page + i),
    marketCapRank: (page - 1) * 20 + i + 1,
    priceChangePercentage24h: (page + i) * 0.5,
  })),
  page,
  size: 20,
});

describe('useCoinsInfinite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('첫 페이지 데이터를 가져온다', async () => {
    const mockPage = createMockPage(1);
    vi.mocked(marketService.getCoins).mockResolvedValue(mockPage);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useCoinsInfinite({}), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.pages).toHaveLength(1);
    expect(result.current.data?.pages[0].coins).toHaveLength(20);
    expect(marketService.getCoins).toHaveBeenCalledWith({
      page: 1,
      size: 20,
      keyword: undefined,
    });
  });

  it('keyword를 전달하여 검색한다', async () => {
    const mockPage = createMockPage(1, 5);
    vi.mocked(marketService.getCoins).mockResolvedValue(mockPage);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useCoinsInfinite({ keyword: 'btc' }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(marketService.getCoins).toHaveBeenCalledWith({
      page: 1,
      size: 20,
      keyword: 'btc',
    });
  });

  it('빈 keyword는 undefined로 전달된다', async () => {
    const mockPage = createMockPage(1);
    vi.mocked(marketService.getCoins).mockResolvedValue(mockPage);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useCoinsInfinite({ keyword: '' }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(marketService.getCoins).toHaveBeenCalledWith({
      page: 1,
      size: 20,
      keyword: undefined,
    });
  });

  it('다음 페이지를 가져올 수 있다', async () => {
    const mockPage1 = createMockPage(1);
    const mockPage2 = createMockPage(2);
    vi.mocked(marketService.getCoins)
      .mockResolvedValueOnce(mockPage1)
      .mockResolvedValueOnce(mockPage2);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useCoinsInfinite({}), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.hasNextPage).toBe(true);

    act(() => {
      result.current.fetchNextPage();
    });

    await waitFor(
      () => {
        expect(result.current.data?.pages).toHaveLength(2);
      },
      { timeout: 3000 },
    );

    expect(marketService.getCoins).toHaveBeenCalledTimes(2);
  });

  it('마지막 페이지면 hasNextPage가 false이다', async () => {
    const lastPage = createMockPage(1, 10);
    vi.mocked(marketService.getCoins).mockResolvedValue(lastPage);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useCoinsInfinite({}), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.hasNextPage).toBe(false);
  });

  it('에러 발생 시 에러 상태를 반환한다', async () => {
    vi.mocked(marketService.getCoins).mockRejectedValue(new Error('API Error'));
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useCoinsInfinite({}), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('로딩 중 상태를 반환한다', async () => {
    vi.mocked(marketService.getCoins).mockImplementation(
      () => new Promise(() => {}),
    );
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useCoinsInfinite({}), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('queryKey에 keyword가 포함된다', async () => {
    const mockPage = createMockPage(1);
    vi.mocked(marketService.getCoins).mockResolvedValue(mockPage);
    const queryClient = createTestQueryClient();

    renderHook(() => useCoinsInfinite({ keyword: 'eth' }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(marketService.getCoins).toHaveBeenCalled();
    });

    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    expect(queries[0].queryKey).toEqual([
      'coins',
      { keyword: 'eth', category: undefined, retryTrigger: 0 },
    ]);
  });

  it('keyword가 변경되면 새로운 쿼리가 실행된다', async () => {
    const mockPage = createMockPage(1);
    vi.mocked(marketService.getCoins).mockResolvedValue(mockPage);
    const queryClient = createTestQueryClient();

    const { result, rerender } = renderHook(
      ({ keyword }) => useCoinsInfinite({ keyword }),
      {
        wrapper: createWrapper(queryClient),
        initialProps: { keyword: 'btc' },
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    rerender({ keyword: 'eth' });

    await waitFor(() => {
      expect(marketService.getCoins).toHaveBeenCalledWith({
        page: 1,
        size: 20,
        keyword: 'eth',
      });
    });
  });
});
