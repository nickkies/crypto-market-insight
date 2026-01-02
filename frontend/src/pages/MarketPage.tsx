import styled from 'styled-components';
import {
  CardSkeleton,
  ChartSkeleton,
  TableRowsSkeleton,
  TextSkeleton,
} from '@/features/common/components';

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

const FilterBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
  align-items: center;
`;

const FilterGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.text.inverse : theme.colors.text.secondary};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary.main : theme.colors.background.secondary};
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.primary.main : theme.colors.border.primary};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme, $active }) =>
      $active ? theme.colors.text.inverse : theme.colors.primary.main};
  }
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const ChartSection = styled.div`
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

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.fonts.size.md};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TimeframeButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const TimeframeButton = styled.button<{ $active?: boolean }>`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary.main : theme.colors.text.tertiary};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.background.tertiary : 'transparent'};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const IndicatorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};
`;

const IndicatorCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
`;

const IndicatorLabel = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fonts.size.xl};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const EcosystemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

export function MarketPage() {
  return (
    <PageContainer data-testid="market-page">
      <PageHeader>
        <PageTitle>Market Analysis</PageTitle>
        <PageDescription>
          실시간 시세, 기술적 지표, 생태계별 분석을 확인하세요.
        </PageDescription>
      </PageHeader>

      <FilterBar>
        <FilterGroup>
          <FilterButton $active>All</FilterButton>
          <FilterButton>BTC</FilterButton>
          <FilterButton>ETH</FilterButton>
          <FilterButton>SOL</FilterButton>
        </FilterGroup>
      </FilterBar>

      <MainContent>
        <ChartSection>
          <Card>
            <CardHeader>
              <CardTitle>BTC/USDT</CardTitle>
              <TimeframeButtons>
                <TimeframeButton>1H</TimeframeButton>
                <TimeframeButton>4H</TimeframeButton>
                <TimeframeButton $active>1D</TimeframeButton>
                <TimeframeButton>1W</TimeframeButton>
              </TimeframeButtons>
            </CardHeader>
            <ChartSkeleton />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Volume Analysis</CardTitle>
            </CardHeader>
            <ChartSkeleton style={{ height: '200px' }} />
          </Card>
        </ChartSection>

        <Sidebar>
          <Card>
            <CardTitle>Technical Indicators</CardTitle>
            <IndicatorGrid>
              <IndicatorCard>
                <IndicatorLabel>RSI (14)</IndicatorLabel>
                <TextSkeleton width="60%" />
              </IndicatorCard>
              <IndicatorCard>
                <IndicatorLabel>MACD</IndicatorLabel>
                <TextSkeleton width="70%" />
              </IndicatorCard>
              <IndicatorCard>
                <IndicatorLabel>MA (20)</IndicatorLabel>
                <TextSkeleton width="80%" />
              </IndicatorCard>
              <IndicatorCard>
                <IndicatorLabel>BB</IndicatorLabel>
                <TextSkeleton width="50%" />
              </IndicatorCard>
            </IndicatorGrid>
          </Card>

          <Card>
            <CardTitle>Signal Summary</CardTitle>
            <TableRowsSkeleton rows={4} />
          </Card>

          <Card>
            <CardTitle>Top Gainers</CardTitle>
            <TableRowsSkeleton rows={5} />
          </Card>
        </Sidebar>
      </MainContent>

      <Section>
        <SectionTitle>Ecosystem Analysis</SectionTitle>
        <EcosystemGrid>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </EcosystemGrid>
      </Section>
    </PageContainer>
  );
}
