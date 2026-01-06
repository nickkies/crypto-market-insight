import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@/styles';
import { CoinDetailPage } from './CoinDetailPage';
import { marketService } from '@/features/market/services';

vi.mock('@/features/market/services', () => ({
  marketService: {
    getCoinDetail: vi.fn(),
    getOhlcv: vi.fn(),
  },
}));

const mockCoinData = {
  id: 'bitcoin',
  symbol: 'btc',
  name: 'Bitcoin',
  image: 'https://example.com/bitcoin.png',
  currentPrice: 97500,
  marketCap: 1920000000000,
  marketCapRank: 1,
  totalVolume: 45000000000,
  high24h: 98000,
  low24h: 96000,
  priceChange24h: 1500,
  priceChangePercentage24h: 1.56,
  circulatingSupply: 19500000,
  totalSupply: 21000000,
  lastUpdated: '2024-01-01T00:00:00Z',
};

const mockOhlcvData = {
  coinId: 'bitcoin',
  timeframe: '1d',
  data: [
    {
      timestamp: 1704067200000,
      open: 96000,
      high: 98000,
      low: 95500,
      close: 97500,
      volume: 1000000000,
    },
  ],
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithProviders = (coinId: string = 'bitcoin') => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MemoryRouter initialEntries={[`/market/${coinId}`]}>
          <Routes>
            <Route path="/market/:coinId" element={<CoinDetailPage />} />
            <Route path="/market" element={<div data-testid="market-page" />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
};

describe('CoinDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('로딩 중일 때 스켈레톤을 표시한다', () => {
    vi.mocked(marketService.getCoinDetail).mockReturnValue(
      new Promise(() => {}),
    );
    vi.mocked(marketService.getOhlcv).mockReturnValue(new Promise(() => {}));

    renderWithProviders();

    expect(screen.queryByTestId('coin-detail-page')).not.toBeInTheDocument();
  });

  it('코인 정보를 정상적으로 표시한다', async () => {
    vi.mocked(marketService.getCoinDetail).mockResolvedValue(mockCoinData);
    vi.mocked(marketService.getOhlcv).mockResolvedValue(mockOhlcvData);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByTestId('coin-detail-page')).toBeInTheDocument();
    });

    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('btc')).toBeInTheDocument();
    expect(screen.getByText('+1.56%')).toBeInTheDocument();
  });

  it('즐겨찾기 버튼이 동작한다', async () => {
    const user = userEvent.setup();
    vi.mocked(marketService.getCoinDetail).mockResolvedValue(mockCoinData);
    vi.mocked(marketService.getOhlcv).mockResolvedValue(mockOhlcvData);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByTestId('coin-detail-page')).toBeInTheDocument();
    });

    const favoriteButton = screen.getByRole('button', {
      name: '즐겨찾기 추가',
    });
    expect(favoriteButton).toHaveTextContent('☆');

    await user.click(favoriteButton);
    expect(favoriteButton).toHaveTextContent('★');
  });

  it('에러 발생 시 에러 메시지를 표시한다', async () => {
    vi.mocked(marketService.getCoinDetail).mockRejectedValue(
      new Error('Failed'),
    );
    vi.mocked(marketService.getOhlcv).mockResolvedValue(mockOhlcvData);

    renderWithProviders();

    await waitFor(() => {
      expect(
        screen.getByText('코인 정보를 불러올 수 없습니다.'),
      ).toBeInTheDocument();
    });
  });

  it('429 에러 시 API 요청 한도 초과 메시지를 표시한다', async () => {
    const error = new Error('Too Many Requests');
    (error as { status?: number }).status = 429;
    vi.mocked(marketService.getCoinDetail).mockRejectedValue(error);
    vi.mocked(marketService.getOhlcv).mockResolvedValue(mockOhlcvData);

    renderWithProviders();

    await waitFor(() => {
      expect(
        screen.getByText(
          'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
        ),
      ).toBeInTheDocument();
    });
  });

  it('목록으로 버튼 클릭 시 /market으로 이동한다', async () => {
    const user = userEvent.setup();
    vi.mocked(marketService.getCoinDetail).mockResolvedValue(mockCoinData);
    vi.mocked(marketService.getOhlcv).mockResolvedValue(mockOhlcvData);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByTestId('coin-detail-page')).toBeInTheDocument();
    });

    await user.click(screen.getByText('← 목록으로'));

    expect(screen.getByTestId('market-page')).toBeInTheDocument();
  });
});
