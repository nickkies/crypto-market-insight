import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/styles/ThemeProvider';
import { useAuthStore } from '@/features/auth';
import MyBacktestsPanel from './MyBacktestsPanel';
import { backtestService } from '../services';
import type { BacktestResult } from '../types';

vi.mock('../services', () => ({
  backtestService: {
    getMyBacktests: vi.fn(),
    deleteBacktest: vi.fn(),
  },
}));

const mockBacktests: BacktestResult[] = [
  {
    id: 1,
    coinId: 'bitcoin',
    strategyType: 'RSI',
    parameters: { period: 14, oversold: 30, overbought: 70 },
    timeframe: '1d',
    startDate: '2024-01-01',
    endDate: '2024-06-15',
    trades: [],
    metrics: {
      cumulativeReturn: 15.5,
      mdd: -8.2,
      winRate: 60,
      tradeCount: 10,
    },
    createdAt: '2024-06-15T10:30:00',
    equityCurve: [],
    drawdownCurve: [],
  },
  {
    id: 2,
    coinId: 'ethereum',
    strategyType: 'RSI',
    parameters: { period: 14, oversold: 30, overbought: 70 },
    timeframe: '1d',
    startDate: '2024-01-01',
    endDate: '2024-06-10',
    trades: [],
    metrics: {
      cumulativeReturn: -5.3,
      mdd: -12.5,
      winRate: 45,
      tradeCount: 15,
    },
    createdAt: '2024-06-10T14:20:00',
    equityCurve: [],
    drawdownCurve: [],
  },
];

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{ui}</ThemeProvider>
    </QueryClientProvider>,
  );
}

describe('MyBacktestsPanel', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
    vi.mocked(backtestService.getMyBacktests).mockClear();
    vi.mocked(backtestService.deleteBacktest).mockClear();
  });

  describe('비로그인 상태', () => {
    beforeEach(() => {
      useAuthStore.setState({
        isAuthenticated: false,
        user: null,
        token: null,
      });
    });

    it('로그인 안내 메시지가 표시된다', () => {
      renderWithProviders(<MyBacktestsPanel onSelect={mockOnSelect} />);

      expect(screen.getByText('My Backtests')).toBeInTheDocument();
      expect(
        screen.getByText(/로그인하시면 백테스트 기록을/),
      ).toBeInTheDocument();
    });

    it('접기/펼치기가 동작한다', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MyBacktestsPanel onSelect={mockOnSelect} />);

      // 기본적으로 열려있음
      expect(
        screen.getByText(/로그인하시면 백테스트 기록을/),
      ).toBeInTheDocument();

      // 접기
      await user.click(screen.getByText('My Backtests'));
      expect(
        screen.queryByText(/로그인하시면 백테스트 기록을/),
      ).not.toBeInTheDocument();

      // 펼치기
      await user.click(screen.getByText('My Backtests'));
      expect(
        screen.getByText(/로그인하시면 백테스트 기록을/),
      ).toBeInTheDocument();
    });
  });

  describe('로그인 상태', () => {
    beforeEach(() => {
      useAuthStore.setState({
        isAuthenticated: true,
        user: {
          userId: 1,
          nickname: 'test',
          email: 'test@test.com',
          profileImage: null,
        },
        token: 'test-token',
      });
    });

    it('백테스트 목록이 표시된다', async () => {
      vi.mocked(backtestService.getMyBacktests).mockResolvedValue(
        mockBacktests,
      );

      renderWithProviders(<MyBacktestsPanel onSelect={mockOnSelect} />);

      await waitFor(() => {
        expect(screen.getByText('(2)')).toBeInTheDocument();
      });

      expect(screen.getByText('BITCOIN | RSI')).toBeInTheDocument();
      expect(screen.getByText('ETHEREUM | RSI')).toBeInTheDocument();
      expect(screen.getByText('+15.50%')).toBeInTheDocument();
      expect(screen.getByText('-5.30%')).toBeInTheDocument();
    });

    it('빈 목록일 때 안내 메시지가 표시된다', async () => {
      vi.mocked(backtestService.getMyBacktests).mockResolvedValue([]);

      renderWithProviders(<MyBacktestsPanel onSelect={mockOnSelect} />);

      await waitFor(() => {
        expect(screen.getByText('(0)')).toBeInTheDocument();
      });

      expect(
        screen.getByText('저장된 백테스트가 없습니다'),
      ).toBeInTheDocument();
    });

    it('항목 클릭 시 onSelect가 호출된다', async () => {
      vi.mocked(backtestService.getMyBacktests).mockResolvedValue(
        mockBacktests,
      );
      const user = userEvent.setup();

      renderWithProviders(<MyBacktestsPanel onSelect={mockOnSelect} />);

      await waitFor(() => {
        expect(screen.getByText('BITCOIN | RSI')).toBeInTheDocument();
      });

      await user.click(screen.getByText('BITCOIN | RSI'));

      expect(mockOnSelect).toHaveBeenCalledWith(mockBacktests[0]);
    });

    it('삭제 버튼 클릭 시 confirm 후 삭제된다', async () => {
      vi.mocked(backtestService.getMyBacktests).mockResolvedValue(
        mockBacktests,
      );
      vi.mocked(backtestService.deleteBacktest).mockResolvedValue();
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const user = userEvent.setup();

      renderWithProviders(<MyBacktestsPanel onSelect={mockOnSelect} />);

      await waitFor(() => {
        expect(screen.getByText('BITCOIN | RSI')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('삭제');
      await user.click(deleteButtons[0]);

      expect(window.confirm).toHaveBeenCalledWith(
        '이 백테스트 기록을 삭제하시겠습니까?',
      );
      expect(backtestService.deleteBacktest).toHaveBeenCalledWith(
        1,
        expect.anything(),
      );
    });

    it('삭제 취소 시 삭제되지 않는다', async () => {
      vi.mocked(backtestService.getMyBacktests).mockResolvedValue(
        mockBacktests,
      );
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      const user = userEvent.setup();

      renderWithProviders(<MyBacktestsPanel onSelect={mockOnSelect} />);

      await waitFor(() => {
        expect(screen.getByText('BITCOIN | RSI')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('삭제');
      await user.click(deleteButtons[0]);

      expect(window.confirm).toHaveBeenCalled();
      expect(backtestService.deleteBacktest).not.toHaveBeenCalled();
    });

    it('접기/펼치기가 동작한다', async () => {
      vi.mocked(backtestService.getMyBacktests).mockResolvedValue(
        mockBacktests,
      );
      const user = userEvent.setup();

      renderWithProviders(<MyBacktestsPanel onSelect={mockOnSelect} />);

      await waitFor(() => {
        expect(screen.getByText('BITCOIN | RSI')).toBeInTheDocument();
      });

      // 접기
      await user.click(screen.getByText('My Backtests'));
      expect(screen.queryByText('BITCOIN | RSI')).not.toBeInTheDocument();

      // 펼치기
      await user.click(screen.getByText('My Backtests'));
      expect(screen.getByText('BITCOIN | RSI')).toBeInTheDocument();
    });
  });
});
