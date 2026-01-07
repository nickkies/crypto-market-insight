import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import {
  ChartSkeleton,
  TableRowsSkeleton,
  TextSkeleton,
} from '@/features/common/components';
import { useAuthStore } from '@/features/auth';

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

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Select = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: ${({ theme }) => theme.fonts.size.sm};
`;

const Input = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: ${({ theme }) => theme.fonts.size.sm};
`;

const RunButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: ${({ theme }) => theme.colors.text.inverse};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.dark};
  }
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

const StatValue = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
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

export function BacktestPage() {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  const handleLogin = () => {
    sessionStorage.setItem('returnUrl', location.pathname);
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/login/github`;
  };
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
          <Card>
            <CardTitle>Strategy Configuration</CardTitle>
            <FormGroup>
              <Label>Asset</Label>
              <Select>BTC/USDT</Select>
            </FormGroup>
            <FormGroup>
              <Label>Strategy</Label>
              <Select>Select strategy...</Select>
            </FormGroup>
            <FormGroup>
              <Label>Timeframe</Label>
              <Select>1 Day</Select>
            </FormGroup>
            <FormGroup>
              <Label>Period</Label>
              <Input>2024-01-01 ~ 2024-12-31</Input>
            </FormGroup>
            <FormGroup>
              <Label>Initial Capital</Label>
              <Input>$10,000</Input>
            </FormGroup>
            <RunButton>Run Backtest</RunButton>
          </Card>

          <Card>
            <CardTitle>Strategy Parameters</CardTitle>
            <FormGroup>
              <Label>RSI Period</Label>
              <Input>14</Input>
            </FormGroup>
            <FormGroup>
              <Label>RSI Overbought</Label>
              <Input>70</Input>
            </FormGroup>
            <FormGroup>
              <Label>RSI Oversold</Label>
              <Input>30</Input>
            </FormGroup>
            <FormGroup>
              <Label>Stop Loss (%)</Label>
              <Input>5</Input>
            </FormGroup>
            <FormGroup>
              <Label>Take Profit (%)</Label>
              <Input>10</Input>
            </FormGroup>
          </Card>
        </ConfigPanel>

        <ResultsSection>
          <StatsGrid>
            <StatCard>
              <StatLabel>Total Return</StatLabel>
              <StatValue>
                <TextSkeleton width="60%" />
              </StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Max Drawdown</StatLabel>
              <StatValue>
                <TextSkeleton width="50%" />
              </StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Win Rate</StatLabel>
              <StatValue>
                <TextSkeleton width="40%" />
              </StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Total Trades</StatLabel>
              <StatValue>
                <TextSkeleton width="30%" />
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
            <TableRowsSkeleton rows={8} />
          </Card>
        </ResultsSection>
      </MainLayout>
    </PageContainer>
  );
}
