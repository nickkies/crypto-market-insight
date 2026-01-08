import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { ChartSkeleton, TableRowsSkeleton } from '@/features/common/components';
import { useAuthStore } from '@/features/auth';
import {
  BacktestForm,
  useRunBacktest,
  sampleBacktestResult,
} from '@/features/backtest';
import type { BacktestResult, BacktestRequestDto } from '@/features/backtest';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fonts.size['2xl']};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const PageDescription = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.md};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const ConfigPanel = styled.aside`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.fonts.size.md};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ResultsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

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
      ? theme.colors.success
      : $negative
        ? theme.colors.error
        : theme.colors.text.primary};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const LoginBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.primary.main}20;
  border: 1px solid ${({ theme }) => theme.colors.primary.main};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.text.primary};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    text-align: center;
  }
`;

const BannerText = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
`;

const BannerLoginButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: ${({ theme }) => theme.colors.text.inverse};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  white-space: nowrap;
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.dark};
  }
`;

const TradeTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background-color: ${({ theme }) => theme.colors.background.tertiary};
`;

const TableHeader = styled.th`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  text-align: left;
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

const TableRow = styled.tr`
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
  }
`;

const TableCell = styled.td<{ $positive?: boolean; $negative?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme, $positive, $negative }) =>
    $positive
      ? theme.colors.success
      : $negative
        ? theme.colors.error
        : theme.colors.text.primary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function BacktestPage() {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const { runBacktest, data, isPending, rateLimitError } = useRunBacktest();

  // 초기 데이터로 샘플 데이터 사용
  const [result, setResult] = useState<BacktestResult>(sampleBacktestResult);

  // API 응답이 있으면 결과 업데이트
  const displayResult = data ?? result;

  const handleLogin = () => {
    sessionStorage.setItem('returnUrl', location.pathname);
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/login/github`;
  };

  const handleSubmit = (formData: BacktestRequestDto) => {
    runBacktest(formData, {
      onSuccess: (response) => {
        setResult(response);
      },
    });
  };

  // 에러 메시지 생성
  const errorMessage = rateLimitError?.message ?? null;

  return (
    <PageContainer data-testid="backtest-page">
      <PageHeader>
        <PageTitle>Strategy Backtest</PageTitle>
        <PageDescription>
          전략을 선택하고 과거 데이터로 시뮬레이션하여 성과를 검증하세요.
        </PageDescription>
      </PageHeader>

      {!isAuthenticated && (
        <LoginBanner data-testid="login-banner">
          <BannerText>
            로그인하면 백테스트 결과를 저장하고 나중에 다시 확인할 수 있습니다.
          </BannerText>
          <BannerLoginButton onClick={handleLogin}>
            GitHub로 로그인
          </BannerLoginButton>
        </LoginBanner>
      )}

      <MainLayout>
        <ConfigPanel>
          <BacktestForm
            onSubmit={handleSubmit}
            isPending={isPending}
            error={errorMessage}
          />
        </ConfigPanel>

        <ResultsSection>
          <StatsGrid>
            <StatCard>
              <StatLabel>Total Return</StatLabel>
              <StatValue
                $positive={displayResult.metrics.cumulativeReturn > 0}
                $negative={displayResult.metrics.cumulativeReturn < 0}
                data-testid="stat-return"
              >
                {formatPercent(displayResult.metrics.cumulativeReturn)}
              </StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Max Drawdown</StatLabel>
              <StatValue $negative data-testid="stat-mdd">
                -{displayResult.metrics.mdd.toFixed(2)}%
              </StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Win Rate</StatLabel>
              <StatValue data-testid="stat-winrate">
                {displayResult.metrics.winRate.toFixed(1)}%
              </StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Total Trades</StatLabel>
              <StatValue data-testid="stat-trades">
                {displayResult.metrics.tradeCount}
              </StatValue>
            </StatCard>
          </StatsGrid>

          <Card>
            <CardTitle>Equity Curve</CardTitle>
            <ChartSkeleton />
          </Card>

          <ChartsGrid>
            <Card>
              <CardTitle>Drawdown</CardTitle>
              <ChartSkeleton style={{ height: '250px' }} />
            </Card>
            <Card>
              <CardTitle>Monthly Returns</CardTitle>
              <ChartSkeleton style={{ height: '250px' }} />
            </Card>
          </ChartsGrid>

          <Card>
            <CardTitle>Trade History</CardTitle>
            {isPending ? (
              <TableRowsSkeleton rows={8} />
            ) : (
              <TradeTable data-testid="trade-history">
                <TableHead>
                  <tr>
                    <TableHeader>Entry Date</TableHeader>
                    <TableHeader>Exit Date</TableHeader>
                    <TableHeader>Entry Price</TableHeader>
                    <TableHeader>Exit Price</TableHeader>
                    <TableHeader>Profit</TableHeader>
                    <TableHeader>Return</TableHeader>
                  </tr>
                </TableHead>
                <tbody>
                  {displayResult.trades.slice(0, 10).map((trade, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatDate(trade.entryTime)}</TableCell>
                      <TableCell>{formatDate(trade.exitTime)}</TableCell>
                      <TableCell>{formatCurrency(trade.entryPrice)}</TableCell>
                      <TableCell>{formatCurrency(trade.exitPrice)}</TableCell>
                      <TableCell
                        $positive={trade.profit > 0}
                        $negative={trade.profit < 0}
                      >
                        {formatCurrency(trade.profit)}
                      </TableCell>
                      <TableCell
                        $positive={trade.profitPercent > 0}
                        $negative={trade.profitPercent < 0}
                      >
                        {formatPercent(trade.profitPercent)}
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </TradeTable>
            )}
          </Card>
        </ResultsSection>
      </MainLayout>
    </PageContainer>
  );
}
