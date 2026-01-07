import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { darkTheme } from '@/styles/theme';
import CoinCard from './CoinCard';
import { useFavoritesStore, useMarketStore } from '../stores';
import type { CoinSummaryDto } from '../services';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../services/favoriteService', () => ({
  favoriteService: {
    getFavorites: vi.fn().mockResolvedValue([]),
    addFavorite: vi.fn().mockResolvedValue({ id: 1, coinId: 'bitcoin' }),
    removeFavorite: vi.fn().mockResolvedValue(undefined),
  },
}));

const mockCoin: CoinSummaryDto = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  image: 'https://example.com/btc.png',
  currentPrice: 97500.25,
  marketCap: 1900000000000,
  marketCapRank: 1,
  priceChangePercentage24h: 2.5,
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={darkTheme}>
        <BrowserRouter>{ui}</BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
};

describe('CoinCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useFavoritesStore.setState({ favorites: [] });
    useMarketStore.setState({ selectedCoinId: null });
    window.scrollTo = vi.fn();
  });

  describe('렌더링', () => {
    it('코인 정보를 올바르게 표시한다', () => {
      renderWithProviders(<CoinCard coin={mockCoin} />);

      expect(screen.getByTestId('coin-name')).toHaveTextContent('Bitcoin');
      expect(screen.getByText('BTC')).toBeInTheDocument();
      expect(screen.getByTestId('coin-price')).toBeInTheDocument();
      expect(screen.getByTestId('coin-change')).toBeInTheDocument();
    });

    it('시가총액 순위를 표시한다', () => {
      renderWithProviders(<CoinCard coin={mockCoin} />);

      expect(screen.getByText('#1')).toBeInTheDocument();
    });

    it('코인 이미지를 표시한다', () => {
      renderWithProviders(<CoinCard coin={mockCoin} />);

      const img = screen.getByAltText('Bitcoin');
      expect(img).toHaveAttribute('src', 'https://example.com/btc.png');
    });
  });

  describe('가격 변화 표시', () => {
    it('양수 변화율일 때 올바른 형식으로 표시한다', () => {
      renderWithProviders(<CoinCard coin={mockCoin} />);

      expect(screen.getByTestId('coin-change')).toHaveTextContent('+2.50%');
    });

    it('음수 변화율일 때 올바른 형식으로 표시한다', () => {
      const negativeCoin = { ...mockCoin, priceChangePercentage24h: -3.75 };
      renderWithProviders(<CoinCard coin={negativeCoin} />);

      expect(screen.getByTestId('coin-change')).toHaveTextContent('-3.75%');
    });
  });

  describe('선택 기능', () => {
    it('클릭하면 코인이 선택된다', () => {
      renderWithProviders(<CoinCard coin={mockCoin} />);

      fireEvent.click(screen.getByTestId('coin-card'));

      expect(useMarketStore.getState().selectedCoinId).toBe('bitcoin');
    });

    it('클릭하면 페이지 상단으로 스크롤된다', () => {
      renderWithProviders(<CoinCard coin={mockCoin} />);

      fireEvent.click(screen.getByTestId('coin-card'));

      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      });
    });

    it('선택된 코인은 선택 스타일이 적용된다', () => {
      useMarketStore.setState({ selectedCoinId: 'bitcoin' });
      renderWithProviders(<CoinCard coin={mockCoin} />);

      const card = screen.getByTestId('coin-card');
      expect(card).toHaveStyle({ cursor: 'pointer' });
    });
  });

  describe('상세 보기 버튼', () => {
    it('상세 보기 버튼 클릭 시 상세 페이지로 이동한다', () => {
      renderWithProviders(<CoinCard coin={mockCoin} />);

      fireEvent.click(screen.getByTestId('detail-button'));

      expect(mockNavigate).toHaveBeenCalledWith('/market/bitcoin');
    });

    it('상세 보기 버튼 클릭 시 선택 이벤트가 발생하지 않는다', () => {
      renderWithProviders(<CoinCard coin={mockCoin} />);

      fireEvent.click(screen.getByTestId('detail-button'));

      expect(useMarketStore.getState().selectedCoinId).toBeNull();
    });
  });

  describe('즐겨찾기 기능', () => {
    it('즐겨찾기 버튼을 표시한다', () => {
      renderWithProviders(<CoinCard coin={mockCoin} />);

      expect(screen.getByTestId('favorite-button')).toBeInTheDocument();
    });

    it('즐겨찾기되지 않은 코인은 빈 별로 표시한다', () => {
      renderWithProviders(<CoinCard coin={mockCoin} />);

      expect(screen.getByTestId('favorite-button')).toHaveTextContent('☆');
    });

    it('즐겨찾기된 코인은 채워진 별로 표시한다', () => {
      useFavoritesStore.setState({ favorites: ['bitcoin'] });
      renderWithProviders(<CoinCard coin={mockCoin} />);

      expect(screen.getByTestId('favorite-button')).toHaveTextContent('★');
    });

    it('즐겨찾기 버튼 클릭 시 즐겨찾기가 토글된다', () => {
      renderWithProviders(<CoinCard coin={mockCoin} />);

      fireEvent.click(screen.getByTestId('favorite-button'));

      expect(useFavoritesStore.getState().favorites).toContain('bitcoin');
    });

    it('즐겨찾기 버튼 클릭 시 카드 클릭 이벤트가 발생하지 않는다', () => {
      renderWithProviders(<CoinCard coin={mockCoin} />);

      fireEvent.click(screen.getByTestId('favorite-button'));

      expect(useMarketStore.getState().selectedCoinId).toBeNull();
    });
  });

  describe('접근성', () => {
    it('즐겨찾기 버튼에 적절한 aria-label이 있다', () => {
      renderWithProviders(<CoinCard coin={mockCoin} />);

      expect(screen.getByTestId('favorite-button')).toHaveAttribute(
        'aria-label',
        '즐겨찾기 추가',
      );
    });

    it('즐겨찾기된 코인의 버튼에 적절한 aria-label이 있다', () => {
      useFavoritesStore.setState({ favorites: ['bitcoin'] });
      renderWithProviders(<CoinCard coin={mockCoin} />);

      expect(screen.getByTestId('favorite-button')).toHaveAttribute(
        'aria-label',
        '즐겨찾기 해제',
      );
    });

    it('상세 보기 버튼에 적절한 aria-label이 있다', () => {
      renderWithProviders(<CoinCard coin={mockCoin} />);

      expect(screen.getByTestId('detail-button')).toHaveAttribute(
        'aria-label',
        '상세 보기',
      );
    });
  });
});
