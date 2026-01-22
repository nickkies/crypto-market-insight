import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/features/common/styles/ThemeProvider';
import ResultSummary from './ResultSummary';
import type { MetricsDto } from '../types';

function renderWithProviders(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('ResultSummary', () => {
  const mockMetrics: MetricsDto = {
    cumulativeReturn: 45.67,
    mdd: 12.34,
    winRate: 65.5,
    tradeCount: 18,
  };

  it('4개의 지표 카드를 렌더링한다', () => {
    renderWithProviders(<ResultSummary metrics={mockMetrics} />);

    expect(screen.getByTestId('result-summary')).toBeInTheDocument();
    expect(screen.getByTestId('stat-return')).toBeInTheDocument();
    expect(screen.getByTestId('stat-mdd')).toBeInTheDocument();
    expect(screen.getByTestId('stat-winrate')).toBeInTheDocument();
    expect(screen.getByTestId('stat-trades')).toBeInTheDocument();
  });

  it('Total Return을 올바르게 포맷팅한다', () => {
    renderWithProviders(<ResultSummary metrics={mockMetrics} />);

    expect(screen.getByTestId('stat-return')).toHaveTextContent('+45.67%');
  });

  it('음수 Total Return을 올바르게 표시한다', () => {
    const negativeMetrics = { ...mockMetrics, cumulativeReturn: -15.23 };
    renderWithProviders(<ResultSummary metrics={negativeMetrics} />);

    expect(screen.getByTestId('stat-return')).toHaveTextContent('-15.23%');
  });

  it('MDD를 올바르게 포맷팅한다', () => {
    renderWithProviders(<ResultSummary metrics={mockMetrics} />);

    expect(screen.getByTestId('stat-mdd')).toHaveTextContent('-12.34%');
  });

  it('Win Rate를 올바르게 포맷팅한다', () => {
    renderWithProviders(<ResultSummary metrics={mockMetrics} />);

    expect(screen.getByTestId('stat-winrate')).toHaveTextContent('65.5%');
  });

  it('Trade Count를 올바르게 표시한다', () => {
    renderWithProviders(<ResultSummary metrics={mockMetrics} />);

    expect(screen.getByTestId('stat-trades')).toHaveTextContent('18');
  });
});
