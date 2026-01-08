import styled from 'styled-components';
import { formatPercent } from '@/utils/format';
import type { MetricsDto } from '../types';

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const StatLabel = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatValue = styled.p<{ $positive?: boolean; $negative?: boolean }>`
  font-size: ${({ theme }) => theme.fonts.size.xl};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme, $positive, $negative }) =>
    $positive
      ? theme.colors.market.up
      : $negative
        ? theme.colors.market.down
        : theme.colors.text.primary};
`;

interface ResultSummaryProps {
  metrics: MetricsDto;
}

export default function ResultSummary({ metrics }: ResultSummaryProps) {
  return (
    <StatsGrid data-testid="result-summary">
      <StatCard>
        <StatLabel>Total Return</StatLabel>
        <StatValue
          $positive={metrics.cumulativeReturn > 0}
          $negative={metrics.cumulativeReturn < 0}
          data-testid="stat-return"
        >
          {formatPercent(metrics.cumulativeReturn)}
        </StatValue>
      </StatCard>
      <StatCard>
        <StatLabel>Max Drawdown</StatLabel>
        <StatValue $negative data-testid="stat-mdd">
          -{metrics.mdd.toFixed(2)}%
        </StatValue>
      </StatCard>
      <StatCard>
        <StatLabel>Win Rate</StatLabel>
        <StatValue data-testid="stat-winrate">
          {metrics.winRate.toFixed(1)}%
        </StatValue>
      </StatCard>
      <StatCard>
        <StatLabel>Total Trades</StatLabel>
        <StatValue data-testid="stat-trades">{metrics.tradeCount}</StatValue>
      </StatCard>
    </StatsGrid>
  );
}
