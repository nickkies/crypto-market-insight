import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useOhlcv } from './useOhlcv';
import { marketService } from '../services';

vi.mock('../services', () => ({
  marketService: {
    getOhlcv: vi.fn(),
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

const mockOhlcvData = {
  coinId: 'bitcoin',
  timeframe: '1d',
  data: [
    {
      timestamp: 1709395200000,
      open: 61942,
      high: 62211,
      low: 61721,
      close: 61845,
      volume: 25000000000,
    },
  ],
};

describe('useOhlcv', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('coinId가 있으면 데이터를 가져온다', async () => {
    vi.mocked(marketService.getOhlcv).mockResolvedValue(mockOhlcvData);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(
      () => useOhlcv({ coinId: 'bitcoin', timeframe: '1d' }),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockOhlcvData);
    expect(marketService.getOhlcv).toHaveBeenCalledWith('bitcoin', '1d');
  });

  it('coinId가 null이면 쿼리를 실행하지 않는다', async () => {
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useOhlcv({ coinId: null }), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isFetching).toBe(false);
    expect(marketService.getOhlcv).not.toHaveBeenCalled();
  });

  it('기본 타임프레임은 1d이다', async () => {
    vi.mocked(marketService.getOhlcv).mockResolvedValue(mockOhlcvData);
    const queryClient = createTestQueryClient();

    renderHook(() => useOhlcv({ coinId: 'bitcoin' }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(marketService.getOhlcv).toHaveBeenCalledWith('bitcoin', '1d');
    });
  });

  it('다른 타임프레임을 지정할 수 있다', async () => {
    const ohlcv3d = { ...mockOhlcvData, timeframe: '3d' };
    vi.mocked(marketService.getOhlcv).mockResolvedValue(ohlcv3d);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(
      () => useOhlcv({ coinId: 'bitcoin', timeframe: '3d' }),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(marketService.getOhlcv).toHaveBeenCalledWith('bitcoin', '3d');
  });

  it('에러 발생 시 에러 상태를 반환한다', async () => {
    vi.mocked(marketService.getOhlcv).mockRejectedValue(new Error('API Error'));
    const queryClient = createTestQueryClient();

    const { result } = renderHook(
      () => useOhlcv({ coinId: 'bitcoin', timeframe: '1d' }),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('429 에러 시 60초 카운트다운을 시작한다', async () => {
    const rateLimitError = { status: 429, message: 'Rate limit exceeded' };
    vi.mocked(marketService.getOhlcv).mockRejectedValue(rateLimitError);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(
      () => useOhlcv({ coinId: 'bitcoin', timeframe: '1d' }),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.countdown).toBe(60);
  });

  it('429 에러에 retryAfterSeconds가 있으면 해당 값으로 카운트다운한다', async () => {
    const rateLimitError = {
      status: 429,
      message: 'Rate limit exceeded',
      retryAfterSeconds: 45,
    };
    vi.mocked(marketService.getOhlcv).mockRejectedValue(rateLimitError);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(
      () => useOhlcv({ coinId: 'bitcoin', timeframe: '1d' }),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.countdown).toBe(45);
  });

  it('카운트다운 중에는 retry가 동작하지 않는다', async () => {
    const rateLimitError = { status: 429, message: 'Rate limit exceeded' };
    vi.mocked(marketService.getOhlcv).mockRejectedValue(rateLimitError);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(
      () => useOhlcv({ coinId: 'bitcoin', timeframe: '1d' }),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => {
      expect(result.current.countdown).toBe(60);
    });

    const callCountBefore = vi.mocked(marketService.getOhlcv).mock.calls.length;

    act(() => {
      result.current.retry();
    });

    expect(vi.mocked(marketService.getOhlcv).mock.calls.length).toBe(
      callCountBefore,
    );
  });

  it('일반 에러 시 카운트다운은 0이고 retry가 동작한다', async () => {
    vi.mocked(marketService.getOhlcv)
      .mockRejectedValueOnce(new Error('Error'))
      .mockResolvedValueOnce(mockOhlcvData);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(
      () => useOhlcv({ coinId: 'bitcoin', timeframe: '1d' }),
      { wrapper: createWrapper(queryClient) },
    );

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
