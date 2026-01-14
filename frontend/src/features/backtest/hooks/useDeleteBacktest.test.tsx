import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useDeleteBacktest } from './useDeleteBacktest';
import { backtestService } from '../services';

vi.mock('../services', () => ({
  backtestService: {
    deleteBacktest: vi.fn(),
  },
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useDeleteBacktest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('백테스트를 삭제한다', async () => {
    vi.mocked(backtestService.deleteBacktest).mockResolvedValue(undefined);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useDeleteBacktest(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate(1);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(backtestService.deleteBacktest).toHaveBeenCalled();
    expect(vi.mocked(backtestService.deleteBacktest).mock.calls[0][0]).toBe(1);
  });

  it('삭제 성공 시 myBacktests 쿼리를 무효화한다', async () => {
    vi.mocked(backtestService.deleteBacktest).mockResolvedValue(undefined);
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeleteBacktest(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate(1);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['myBacktests'] });
  });

  it('에러 발생 시 에러 상태를 반환한다', async () => {
    vi.mocked(backtestService.deleteBacktest).mockRejectedValue(
      new Error('Delete failed'),
    );
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useDeleteBacktest(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate(1);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it('로딩 중 상태를 반환한다', async () => {
    vi.mocked(backtestService.deleteBacktest).mockImplementation(
      () => new Promise(() => {}),
    );
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useDeleteBacktest(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate(1);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });
  });
});
