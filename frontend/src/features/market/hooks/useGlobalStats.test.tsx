import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGlobalStats } from './useGlobalStats';
import { marketService } from '../services';

vi.mock('../services', () => ({
  marketService: {
    getGlobalStats: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useGlobalStats', () => {
  const mockGlobalStats = {
    totalMarketCap: 2500000000000,
    total24hVolume: 85000000000,
    btcDominance: 52.5,
    activeCryptocurrencies: 14500,
    marketCapChange24h: -1.25,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches global stats successfully', async () => {
    vi.mocked(marketService.getGlobalStats).mockResolvedValue(mockGlobalStats);

    const { result } = renderHook(() => useGlobalStats(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockGlobalStats);
    expect(marketService.getGlobalStats).toHaveBeenCalledTimes(1);
  });

  it('handles error state', async () => {
    const error = new Error('API Error');
    vi.mocked(marketService.getGlobalStats).mockRejectedValue(error);

    const { result } = renderHook(() => useGlobalStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it('returns correct data structure', async () => {
    vi.mocked(marketService.getGlobalStats).mockResolvedValue(mockGlobalStats);

    const { result } = renderHook(() => useGlobalStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.totalMarketCap).toBe(2500000000000);
    expect(result.current.data?.total24hVolume).toBe(85000000000);
    expect(result.current.data?.btcDominance).toBe(52.5);
    expect(result.current.data?.activeCryptocurrencies).toBe(14500);
    expect(result.current.data?.marketCapChange24h).toBe(-1.25);
  });
});
