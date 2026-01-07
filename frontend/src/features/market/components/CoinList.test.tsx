import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter } from 'react-router-dom';
import { darkTheme } from '@/styles/theme';
import CoinList from './CoinList';
import { useFavoritesStore } from '../stores';
import { marketService } from '../services';
import type { CoinSummaryDto } from '../services';

vi.mock('../services', () => ({
  marketService: {
    getCoins: vi.fn(),
  },
  favoriteService: {
    getFavorites: vi.fn().mockResolvedValue([]),
    addFavorite: vi.fn().mockResolvedValue({ id: 1, coinId: 'bitcoin' }),
    removeFavorite: vi.fn().mockResolvedValue(undefined),
  },
}));

const mockCoins: CoinSummaryDto[] = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://example.com/btc.png',
    currentPrice: 97500,
    marketCap: 1900000000000,
    marketCapRank: 1,
    priceChangePercentage24h: 2.5,
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    image: 'https://example.com/eth.png',
    currentPrice: 3500,
    marketCap: 420000000000,
    marketCapRank: 2,
    priceChangePercentage24h: -1.2,
  },
];

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

const renderWithProviders = (
  ui: React.ReactElement,
  queryClient = createTestQueryClient(),
) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={darkTheme}>
        <BrowserRouter>{ui}</BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
};

describe('CoinList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useFavoritesStore.setState({ favorites: [] });
  });

  describe('로딩 상태', () => {
    it('로딩 중일 때 스켈레톤을 표시한다', () => {
      vi.mocked(marketService.getCoins).mockImplementation(
        () => new Promise(() => {}),
      );

      renderWithProviders(<CoinList />);

      expect(screen.getByTestId('coin-list-skeleton')).toBeInTheDocument();
    });
  });

  describe('데이터 표시', () => {
    it('코인 목록을 표시한다', async () => {
      vi.mocked(marketService.getCoins).mockResolvedValue({
        coins: mockCoins,
        page: 1,
        size: 20,
      });

      renderWithProviders(<CoinList />);

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
        expect(screen.getByText('Ethereum')).toBeInTheDocument();
      });
    });

    it('코인 카드가 올바르게 렌더링된다', async () => {
      vi.mocked(marketService.getCoins).mockResolvedValue({
        coins: mockCoins,
        page: 1,
        size: 20,
      });

      renderWithProviders(<CoinList />);

      await waitFor(() => {
        const coinCards = screen.getAllByTestId('coin-card');
        expect(coinCards).toHaveLength(2);
      });
    });
  });

  describe('에러 상태', () => {
    it('에러 발생 시 에러 메시지를 표시한다', async () => {
      vi.mocked(marketService.getCoins).mockRejectedValue(new Error('Failed'));

      renderWithProviders(<CoinList />);

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument();
      });
    });
  });

  describe('빈 상태', () => {
    it('검색 결과가 없을 때 빈 상태를 표시한다', async () => {
      vi.mocked(marketService.getCoins).mockResolvedValue({
        coins: [],
        page: 1,
        size: 20,
      });

      renderWithProviders(<CoinList keyword="nonexistent" />);

      await waitFor(() => {
        expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument();
      });
    });

    it('즐겨찾기가 비어있을 때 안내 메시지를 표시한다', async () => {
      vi.mocked(marketService.getCoins).mockResolvedValue({
        coins: mockCoins,
        page: 1,
        size: 20,
      });
      useFavoritesStore.setState({ favorites: [] });

      renderWithProviders(<CoinList filter="favorites" />);

      await waitFor(() => {
        expect(
          screen.getByText('즐겨찾기한 코인이 없습니다'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('즐겨찾기 필터', () => {
    it('즐겨찾기 필터가 적용되면 즐겨찾기된 코인만 표시한다', async () => {
      vi.mocked(marketService.getCoins).mockResolvedValue({
        coins: mockCoins,
        page: 1,
        size: 20,
      });
      useFavoritesStore.setState({ favorites: ['bitcoin'] });

      renderWithProviders(<CoinList filter="favorites" />);

      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
        expect(screen.queryByText('Ethereum')).not.toBeInTheDocument();
      });
    });
  });

  describe('무한 스크롤', () => {
    it('load more trigger가 렌더링된다', async () => {
      vi.mocked(marketService.getCoins).mockResolvedValue({
        coins: mockCoins,
        page: 1,
        size: 20,
      });

      renderWithProviders(<CoinList />);

      await waitFor(() => {
        expect(screen.getByTestId('load-more-trigger')).toBeInTheDocument();
      });
    });
  });
});
