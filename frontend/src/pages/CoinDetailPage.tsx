import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  ChartContainer,
  TimeframeSelector,
  useCoinDetail,
  useOhlcv,
  useMarketStore,
  useFavoritesStore,
} from '@/features/market';
import {
  CardSkeleton,
  TextSkeleton,
  ChartSkeleton,
  ErrorState,
} from '@/features/common/components';
import { MARKET_COLORS } from '@/styles/marketColors';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  width: fit-content;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
`;

const CoinInfoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const CoinInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FavoriteButton = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  font-size: ${({ theme }) => theme.fonts.size['2xl']};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.warning : theme.colors.text.tertiary};
  padding: ${({ theme }) => theme.spacing.xs};
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.warning};
    transform: scale(1.1);
  }
`;

const CoinImage = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
`;

const CoinImagePlaceholder = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.background.tertiary};
`;

const CoinNameGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const CoinName = styled.h1`
  font-size: ${({ theme }) => theme.fonts.size['2xl']};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const CoinSymbol = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.md};
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-transform: uppercase;
`;

const PriceSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    align-items: flex-end;
  }
`;

const CurrentPrice = styled.div`
  font-size: ${({ theme }) => theme.fonts.size['3xl']};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const PriceChange = styled.span<{ $isPositive: boolean }>`
  font-size: ${({ theme }) => theme.fonts.size.lg};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ $isPositive }) =>
    $isPositive ? MARKET_COLORS.up : MARKET_COLORS.down};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const StatLabel = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin: 0 0 ${({ theme }) => theme.spacing.xs};
`;

const StatValue = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.lg};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const ChartSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChartTitle = styled.h2`
  font-size: ${({ theme }) => theme.fonts.size.xl};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const ChartCard = styled(Card)`
  height: 700px;
`;

function LoadingSkeleton() {
  return (
    <Container>
      <TextSkeleton width="100px" />
      <Header>
        <CoinInfoWrapper>
          <CoinInfo>
            <CoinImagePlaceholder />
            <CoinNameGroup>
              <TextSkeleton width="120px" />
              <TextSkeleton width="60px" />
            </CoinNameGroup>
          </CoinInfo>
        </CoinInfoWrapper>
        <PriceSection>
          <TextSkeleton width="150px" />
          <TextSkeleton width="80px" />
        </PriceSection>
      </Header>
      <StatsGrid>
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </StatsGrid>
      <ChartSection>
        <ChartHeader>
          <TextSkeleton width="120px" />
        </ChartHeader>
        <Card>
          <ChartSkeleton />
        </Card>
      </ChartSection>
    </Container>
  );
}

function formatPrice(price?: number): string {
  if (price == null) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: price < 1 ? 6 : 2,
  }).format(price);
}

function formatLargeNumber(num?: number): string {
  if (num == null) return '-';
  if (num >= 1_000_000_000_000) {
    return `$${(num / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`;
  }
  return `$${num.toLocaleString()}`;
}

function formatSupply(num?: number): string {
  if (num == null) return '-';
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  }
  return num.toLocaleString();
}

export function CoinDetailPage() {
  const { coinId } = useParams<{ coinId: string }>();
  const navigate = useNavigate();
  const { timeframe, setTimeframe } = useMarketStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const favorite = isFavorite(coinId ?? '');

  const {
    data: coinData,
    isLoading: isCoinLoading,
    isError: isCoinError,
    error: coinError,
    refetch: refetchCoin,
  } = useCoinDetail(coinId ?? null);

  const {
    data: ohlcvData,
    isLoading: isChartLoading,
    isError: isChartError,
    error: chartError,
    refetch: refetchChart,
  } = useOhlcv({ coinId: coinId ?? null, timeframe });

  const chartErrorStatus = (chartError as { status?: number })?.status;
  const coinErrorStatus = (coinError as { status?: number })?.status;

  if (isCoinLoading) {
    return <LoadingSkeleton />;
  }

  if (isCoinError) {
    const errorMessage =
      coinErrorStatus === 429
        ? 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
        : '코인 정보를 불러올 수 없습니다.';

    return (
      <Container>
        <BackButton onClick={() => navigate('/market')}>← 목록으로</BackButton>
        <ErrorState message={errorMessage} onRetry={() => refetchCoin()} />
      </Container>
    );
  }

  if (!coinData) {
    return (
      <Container>
        <BackButton onClick={() => navigate('/market')}>← 목록으로</BackButton>
        <ErrorState message="코인 정보를 찾을 수 없습니다." />
      </Container>
    );
  }

  const priceChange24h = coinData.priceChangePercentage24h ?? 0;
  const isPositive = priceChange24h >= 0;

  return (
    <Container data-testid="coin-detail-page">
      <BackButton onClick={() => navigate('/market')}>← 목록으로</BackButton>

      <Header>
        <CoinInfoWrapper>
          <CoinInfo>
            {coinData.image ? (
              <CoinImage src={coinData.image} alt={coinData.name} />
            ) : (
              <CoinImagePlaceholder />
            )}
            <CoinNameGroup>
              <CoinName>{coinData.name}</CoinName>
              <CoinSymbol>{coinData.symbol}</CoinSymbol>
            </CoinNameGroup>
          </CoinInfo>
          <FavoriteButton
            onClick={() => toggleFavorite(coinId!)}
            $active={favorite}
            aria-label={favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          >
            {favorite ? '★' : '☆'}
          </FavoriteButton>
        </CoinInfoWrapper>

        <PriceSection>
          <CurrentPrice>{formatPrice(coinData.currentPrice)}</CurrentPrice>
          <PriceChange $isPositive={isPositive}>
            {isPositive ? '+' : ''}
            {priceChange24h.toFixed(2)}%
          </PriceChange>
        </PriceSection>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatLabel>시가총액</StatLabel>
          <StatValue>{formatLargeNumber(coinData.marketCap)}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>24h 거래량</StatLabel>
          <StatValue>{formatLargeNumber(coinData.totalVolume)}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>24h 최고가</StatLabel>
          <StatValue>{formatPrice(coinData.high24h)}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>24h 최저가</StatLabel>
          <StatValue>{formatPrice(coinData.low24h)}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>유통량</StatLabel>
          <StatValue>{formatSupply(coinData.circulatingSupply)}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>총 공급량</StatLabel>
          <StatValue>
            {coinData.totalSupply
              ? formatSupply(coinData.totalSupply)
              : '제한 없음'}
          </StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>시가총액 순위</StatLabel>
          <StatValue>#{coinData.marketCapRank}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>24h 가격 변동</StatLabel>
          <StatValue>
            <PriceChange $isPositive={isPositive}>
              {isPositive ? '+' : ''}
              {formatPrice(coinData.priceChange24h)}
            </PriceChange>
          </StatValue>
        </StatCard>
      </StatsGrid>

      <ChartSection>
        <ChartHeader>
          <ChartTitle>Price Chart</ChartTitle>
          <TimeframeSelector value={timeframe} onChange={setTimeframe} />
        </ChartHeader>
        <ChartCard>
          <ChartContainer
            data={ohlcvData?.data}
            isLoading={isChartLoading}
            isError={isChartError}
            errorStatus={chartErrorStatus}
            onRetry={() => refetchChart()}
          />
        </ChartCard>
      </ChartSection>
    </Container>
  );
}
