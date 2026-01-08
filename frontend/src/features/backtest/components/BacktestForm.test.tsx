import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/styles/ThemeProvider';
import BacktestForm from './BacktestForm';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{ui}</ThemeProvider>
    </QueryClientProvider>,
  );
}

describe('BacktestForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('폼이 기본값과 함께 렌더링된다', () => {
    renderWithProviders(<BacktestForm onSubmit={mockOnSubmit} />);

    expect(screen.getByTestId('strategy-select')).toHaveValue('RSI');
    expect(screen.getByTestId('timeframe-select')).toHaveValue('1d');
    expect(screen.getByTestId('param-period')).toHaveValue(7);
    expect(screen.getByTestId('param-oversold')).toHaveValue(40);
    expect(screen.getByTestId('param-overbought')).toHaveValue(60);
  });

  it('실행 버튼이 표시된다', () => {
    renderWithProviders(<BacktestForm onSubmit={mockOnSubmit} />);

    expect(screen.getByTestId('run-backtest-button')).toBeInTheDocument();
    expect(screen.getByText('Run Backtest')).toBeInTheDocument();
  });

  it('로딩 중일 때 버튼이 비활성화된다', () => {
    renderWithProviders(<BacktestForm onSubmit={mockOnSubmit} isPending />);

    const button = screen.getByTestId('run-backtest-button');
    expect(button).toBeDisabled();
    expect(screen.getByText('Running...')).toBeInTheDocument();
  });

  it('Rate limit 에러 시 버튼에 카운트다운이 표시된다', () => {
    renderWithProviders(
      <BacktestForm onSubmit={mockOnSubmit} isRateLimitError cooldown={60} />,
    );

    const button = screen.getByTestId('run-backtest-button');
    expect(button).toBeDisabled();
    expect(screen.getByText(/Run Backtest \(\d+초\)/)).toBeInTheDocument();
  });

  it('Period 입력 유효성 검증이 동작한다', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BacktestForm onSubmit={mockOnSubmit} />);

    const periodInput = screen.getByTestId('param-period');
    await user.clear(periodInput);
    await user.type(periodInput, '1');
    await user.tab();

    expect(
      screen.getByText('Period는 2 이상이어야 합니다'),
    ).toBeInTheDocument();
  });

  it('Oversold 입력 유효성 검증이 동작한다', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BacktestForm onSubmit={mockOnSubmit} />);

    const oversoldInput = screen.getByTestId('param-oversold');
    await user.clear(oversoldInput);
    await user.type(oversoldInput, '101');
    await user.tab();

    expect(
      screen.getByText('Oversold는 100 이하여야 합니다'),
    ).toBeInTheDocument();
  });
});
