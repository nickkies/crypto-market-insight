import { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import {
  ChartSkeleton,
  TableRowsSkeleton,
  ErrorState,
} from '@/features/common/components';
import { RATE_LIMIT_ERROR_MESSAGE } from '@/features/common/constants';
import { useAuthStore } from '@/features/auth';
import {
  BacktestForm,
  ResultSummary,
  EquityCurve,
  DrawdownChart,
  MonthlyReturnsChart,
  TradeHistoryTable,
  MyBacktestsPanel,
  useRunBacktest,
  useBacktestChartData,
  sampleBacktestResult,
} from '@/features/backtest';
import type { BacktestRequestDto, BacktestResult } from '@/features/backtest';

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

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const ChartWrapper = styled.div<{ $height?: string }>`
  height: ${({ $height }) => $height ?? '300px'};
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

export function BacktestPage() {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const {
    runBacktest,
    data,
    isPending,
    isError,
    error,
    rateLimitError,
    reset,
  } = useRunBacktest();

  // 마지막 요청 저장 (재시도용)
  const lastRequestRef = useRef<BacktestRequestDto | null>(null);

  // 실행 전이면 샘플 데이터, 실행 후에는 API 응답
  const displayResult = data ?? sampleBacktestResult;

  // 차트 데이터 계산
  const chartData = useBacktestChartData(displayResult);

  const handleLogin = () => {
    sessionStorage.setItem('returnUrl', location.pathname);
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/login/github`;
  };

  const handleSubmit = (formData: BacktestRequestDto) => {
    lastRequestRef.current = formData;
    reset();
    runBacktest(formData);
  };

  const handleSelectSavedResult = (result: BacktestResult) => {
    // 저장된 백테스트의 파라미터로 다시 실행
    // startDate는 백엔드에서 타임프레임 기반 자동 계산
    const request: BacktestRequestDto = {
      coinId: result.coinId,
      strategyType: result.strategyType,
      parameters: result.parameters,
      timeframe: result.timeframe,
      endDate: result.endDate,
    };
    lastRequestRef.current = request;
    reset();
    runBacktest(request);
  };

  const handleRetry = () => {
    if (lastRequestRef.current) {
      reset();
      runBacktest(lastRequestRef.current);
    }
  };

  // 에러 메시지 생성
  const getErrorMessage = () => {
    if (rateLimitError) return RATE_LIMIT_ERROR_MESSAGE;
    if (error) return error.message || '백테스트 실행 중 오류가 발생했습니다.';
    return null;
  };
  const errorMessage = getErrorMessage();

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
            isRateLimitError={!!rateLimitError}
          />
          <MyBacktestsPanel onSelect={handleSelectSavedResult} />
        </ConfigPanel>

        <ResultsSection>
          {isError ? (
            <ErrorState
              message={errorMessage || '백테스트 실행 중 오류가 발생했습니다.'}
              onRetry={handleRetry}
              cooldown={rateLimitError ? 60 : 0}
            />
          ) : (
            <>
              <ResultSummary metrics={displayResult.metrics} />

              <Card>
                <CardTitle>Equity Curve</CardTitle>
                {isPending ? (
                  <ChartSkeleton />
                ) : (
                  <ChartWrapper>
                    <EquityCurve data={chartData.equityCurve} />
                  </ChartWrapper>
                )}
              </Card>

              <ChartsGrid>
                <Card>
                  <CardTitle>Drawdown</CardTitle>
                  {isPending ? (
                    <ChartSkeleton style={{ height: '250px' }} />
                  ) : (
                    <ChartWrapper $height="250px">
                      <DrawdownChart data={chartData.drawdownCurve} />
                    </ChartWrapper>
                  )}
                </Card>
                <Card>
                  <CardTitle>Monthly Returns</CardTitle>
                  {isPending ? (
                    <ChartSkeleton style={{ height: '250px' }} />
                  ) : (
                    <ChartWrapper $height="250px">
                      <MonthlyReturnsChart trades={displayResult.trades} />
                    </ChartWrapper>
                  )}
                </Card>
              </ChartsGrid>

              <Card>
                <CardTitle>Trade History</CardTitle>
                {isPending ? (
                  <TableRowsSkeleton rows={8} />
                ) : (
                  <TradeHistoryTable trades={displayResult.trades} />
                )}
              </Card>
            </>
          )}
        </ResultsSection>
      </MainLayout>
    </PageContainer>
  );
}
