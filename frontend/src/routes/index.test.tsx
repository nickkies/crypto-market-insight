import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/features/common/styles';
import { router } from './index';

// 차트 컴포넌트 & 데이터 모킹 - 라우트 테스트에서 렌더링 시간 단축
vi.mock('echarts-for-react', () => ({
  default: () => <div data-testid="mock-echarts" />,
}));

vi.mock('@/features/backtest/components/EquityCurve', () => ({
  default: () => <div data-testid="mock-equity-curve" />,
}));

vi.mock('@/features/backtest/components/DrawdownChart', () => ({
  default: () => <div data-testid="mock-drawdown-chart" />,
}));

vi.mock('@/features/backtest/components/MonthlyReturnsChart', () => ({
  default: () => <div data-testid="mock-monthly-returns-chart" />,
}));

vi.mock('@/features/backtest/hooks/useBacktestChartData', () => ({
  useBacktestChartData: () => ({
    equityCurve: [],
    drawdownCurve: [],
  }),
}));

vi.mock('@/features/backtest/components/TradeHistoryTable', () => ({
  default: () => <div data-testid="mock-trade-history" />,
}));

vi.mock('@/features/backtest/services/sampleData', () => ({
  sampleBacktestResult: {
    id: null,
    coinId: 'bitcoin',
    strategyType: 'RSI',
    timeframe: '1d',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    createdAt: '2026-01-01T00:00:00Z',
    metrics: {
      cumulativeReturn: 10.5,
      mdd: 5.2,
      winRate: 55.0,
      tradeCount: 10,
    },
    trades: [],
    equityCurve: [],
    drawdownCurve: [],
  },
}));

vi.mock('@/features/backtest/components/CoinSelect', () => ({
  default: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <select
      data-testid="mock-coin-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="bitcoin">Bitcoin</option>
    </select>
  ),
}));

vi.mock('@/features/backtest/components/BacktestForm', () => ({
  default: () => <div data-testid="mock-backtest-form">Backtest Form</div>,
}));

vi.mock('@/features/backtest/components/MyBacktestsPanel', () => ({
  default: () => <div data-testid="mock-my-backtests">My Backtests</div>,
}));

vi.mock('@/features/backtest/components/ResultSummary', () => ({
  default: () => <div data-testid="mock-result-summary">Summary</div>,
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithRouter = (initialRoute: string = '/') => {
  const testRouter = createMemoryRouter(router.routes, {
    initialEntries: [initialRoute],
  });
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={testRouter} />
      </ThemeProvider>
    </QueryClientProvider>,
  );
};

describe('Router', () => {
  describe('Route Mapping', () => {
    it('renders HomePage at /', () => {
      renderWithRouter('/');
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    it('renders MarketPage at /market', () => {
      renderWithRouter('/market');
      expect(screen.getByTestId('market-page')).toBeInTheDocument();
    });

    it('renders BacktestPage at /backtest', () => {
      renderWithRouter('/backtest');
      expect(screen.getByTestId('backtest-page')).toBeInTheDocument();
    });

    it('renders NotFoundPage for unknown routes', () => {
      renderWithRouter('/unknown-route');
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates between pages using links', { timeout: 15000 }, async () => {
      const user = userEvent.setup();
      renderWithRouter('/');

      expect(screen.getByTestId('home-page')).toBeInTheDocument();

      await user.click(screen.getByRole('link', { name: 'Market' }));
      expect(screen.getByTestId('market-page')).toBeInTheDocument();

      await user.click(screen.getByRole('link', { name: 'Backtest' }));
      expect(screen.getByTestId('backtest-page')).toBeInTheDocument();

      await user.click(screen.getByRole('link', { name: 'Home' }));
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });
});
