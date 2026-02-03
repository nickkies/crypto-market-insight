import { useState } from 'react';
import styled from 'styled-components';
import { SearchInput, FilterTabs } from '@/features/common/components';
import { TopMoversList } from '@/features/home';
import type { FilterTab } from '@/features/common/components';
import { useDebounce } from '@/features/common/hooks';
import {
  CoinList,
  ChartContainer,
  TimeframeSelector,
  IndicatorSelector,
  TechnicalIndicatorsCard,
  SignalSummaryCard,
  CategoryFilterBar,
  CATEGORY_TO_API,
  useOhlcv,
  useIndicators,
  useMarketStore,
  useCoinDetail,
} from '@/features/market';
import type { Category } from '@/features/market';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
  max-width: 100%;
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
  height: 100%;
`;

const ChartCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  padding: ${({ theme }) => theme.spacing.lg};
  height: 100%;
  min-height: 550px;
  display: flex;
  flex-direction: column;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    min-height: 600px;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    min-height: 700px;
  }
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
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ChartControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`;

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.fonts.size.md};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SidebarWrapper = styled.aside`
  display: flex;
  flex-direction: column;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  height: 100%;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fonts.size.xl};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SectionControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: row;
    align-items: center;
  }
`;

export function MarketPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { timeframe, setTimeframe, selectedCoinId, selectedIndicators } =
    useMarketStore();
  const chartCoinId = selectedCoinId || 'bitcoin';

  const {
    data: ohlcvData,
    isLoading: isChartLoading,
    isError: isChartError,
    error: chartError,
    countdown: chartCountdown,
    retry: retryChart,
  } = useOhlcv({ coinId: chartCoinId, timeframe });
  const chartErrorStatus = (chartError as { status?: number })?.status;

  const {
    data: indicatorData,
    isLoading: isIndicatorLoading,
    isError: isIndicatorError,
    countdown: indicatorCountdown,
    retry: retryIndicators,
  } = useIndicators({
    coinId: chartCoinId,
  });

  const {
    data: coinDetail,
    isError: isCoinDetailError,
    countdown: coinDetailCountdown,
    retry: retryCoinDetail,
  } = useCoinDetail(chartCoinId);

  // 에러인 쿼리들만 일괄 refetch
  const retryErroredQueries = () => {
    if (isChartError) {
      retryChart();
    }
    if (isIndicatorError) {
      retryIndicators();
    }
    if (isCoinDetailError) {
      retryCoinDetail();
    }
  };

  // 가장 긴 countdown 값 사용 (모든 에러 쿼리가 동시에 재시도 가능하도록)
  const maxCountdown = Math.max(
    chartCountdown,
    indicatorCountdown,
    coinDetailCountdown,
  );

  return (
    <PageContainer data-testid="market-page">
      <PageHeader>
        <PageTitle>Market Analysis</PageTitle>
        <PageDescription>
          실시간 시세, 기술적 지표, 생태계별 분석을 확인하세요.
        </PageDescription>
      </PageHeader>

      <MainContent>
        <ChartSection>
          <ChartCard>
            <CardHeader>
              <CardTitle>{chartCoinId.toUpperCase()}/USD</CardTitle>
              <ChartControls>
                <IndicatorSelector />
                <TimeframeSelector value={timeframe} onChange={setTimeframe} />
              </ChartControls>
            </CardHeader>
            <ChartContainer
              data={ohlcvData?.data}
              isLoading={isChartLoading}
              isError={isChartError}
              errorStatus={chartErrorStatus}
              cooldown={maxCountdown}
              onRetry={retryErroredQueries}
              selectedIndicators={selectedIndicators}
            />
          </ChartCard>
        </ChartSection>

        <SidebarWrapper>
          <Sidebar>
            <TechnicalIndicatorsCard
              data={indicatorData}
              isLoading={isIndicatorLoading}
              isError={isIndicatorError}
              onRetry={retryErroredQueries}
              cooldown={maxCountdown}
            />

            <SignalSummaryCard
              data={indicatorData}
              isLoading={isIndicatorLoading}
              isError={isIndicatorError}
              currentPrice={coinDetail?.currentPrice}
              onRetry={retryErroredQueries}
              cooldown={maxCountdown}
            />

            <Card>
              <CardTitle>Top Gainers</CardTitle>
              <TopMoversList filter="gainers" maxHeight="400px" />
            </Card>
          </Sidebar>
        </SidebarWrapper>
      </MainContent>

      {/* <Section>
        <SectionTitle>Ecosystem Analysis</SectionTitle>
        <EcosystemPlaceholder />
      </Section> */}

      <Section>
        <SectionHeader>
          <SectionTitle>Coin List</SectionTitle>
          <SectionControls>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="코인 검색..."
            />
            <FilterTabs
              activeTab={activeFilter}
              onTabChange={setActiveFilter}
            />
          </SectionControls>
        </SectionHeader>
        <CategoryFilterBar
          selected={selectedCategory}
          onChange={setSelectedCategory}
        />
        <CoinList
          keyword={debouncedSearch}
          filter={activeFilter}
          category={CATEGORY_TO_API[selectedCategory]}
        />
      </Section>
    </PageContainer>
  );
}
