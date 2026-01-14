import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useMyBacktests } from './useMyBacktests';
import { backtestService } from '../services';
import { useAuthStore } from '@/features/auth';
import type { BacktestResult } from '../types';

vi.mock('../services', () => ({
  backtestService: {
    getMyBacktests: vi.fn(),
  },
}));

vi.mock('@/features/auth', () => ({
  useAuthStore: vi.fn(),
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

const mockBacktestResults: BacktestResult[] = [
  {
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
  },
  {
    id: 2,
    coinId: 'ethereum',
    strategyType: 'MACD',
    timeframe: '3d',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    metrics: {
      tradeCount: 3,
      winRate: 66.67,
      mdd: -5,
      cumulativeReturn: 20.0,
    },
    trades: [],
    equityCurve: [],
    drawdownCurve: [],
    createdAt: '2024-01-30T12:00:00Z',
  },
];

describe('useMyBacktests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('인증된 사용자는 백테스트 목록을 가져온다', async () => {
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: true });
    vi.mocked(backtestService.getMyBacktests).mockResolvedValue(
      mockBacktestResults,
    );
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useMyBacktests(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);
    expect(backtestService.getMyBacktests).toHaveBeenCalled();
  });

  it('인증되지 않은 사용자는 쿼리를 실행하지 않는다', async () => {
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: false });
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useMyBacktests(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isFetching).toBe(false);
    expect(backtestService.getMyBacktests).not.toHaveBeenCalled();
  });

  it('에러 발생 시 에러 상태를 반환한다', async () => {
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: true });
    vi.mocked(backtestService.getMyBacktests).mockRejectedValue(
      new Error('API Error'),
    );
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useMyBacktests(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('빈 목록을 반환할 수 있다', async () => {
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: true });
    vi.mocked(backtestService.getMyBacktests).mockResolvedValue([]);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useMyBacktests(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(0);
  });

  it('로딩 중 상태를 반환한다', async () => {
    vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: true });
    vi.mocked(backtestService.getMyBacktests).mockImplementation(
      () => new Promise(() => {}),
    );
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useMyBacktests(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isLoading).toBe(true);
  });
});
