import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { formatPrice, formatPercent } from '@/utils';
import { TableRowsSkeleton } from '@/features/common/components';
import { useTopMovers } from '../hooks';

type FilterType = 'all' | 'gainers' | 'losers';

interface Props {
  filter?: FilterType;
  count?: number;
  maxHeight?: string;
  fillHeight?: boolean;
}

export function TopMoversList({
  filter = 'all',
  count = 10,
  maxHeight,
  fillHeight = false,
}: Props) {
  const navigate = useNavigate();
  const {
    data: topMovers,
    isLoading,
    isError,
  } = useTopMovers({ filter, count });

  const handleClick = (coinId: string) => {
    navigate(`/market/${coinId}`);
  };

  if (isLoading) {
    return <TableRowsSkeleton rows={Math.min(count, 5)} />;
  }

  if (isError || topMovers.length === 0) {
    return (
      <ErrorContainer>
        <ErrorText>데이터를 불러올 수 없습니다</ErrorText>
      </ErrorContainer>
    );
  }

  return (
    <Container
      $maxHeight={maxHeight}
      $fillHeight={fillHeight}
      data-testid="top-movers-list"
    >
      {topMovers.map((coin) => {
        const isPositive = coin.priceChangePercentage24h >= 0;
        return (
          <MoverItem
            key={coin.id}
            onClick={() => handleClick(coin.id)}
            data-testid="mover-item"
          >
            <CoinInfo>
              <CoinImage src={coin.image} alt={coin.name} />
              <CoinDetails>
                <CoinName>{coin.name}</CoinName>
                <CoinSymbol>{coin.symbol.toUpperCase()}</CoinSymbol>
              </CoinDetails>
            </CoinInfo>
            <PriceInfo>
              <Price>${formatPrice(coin.currentPrice)}</Price>
              <Change $positive={isPositive}>
                {formatPercent(coin.priceChangePercentage24h)}
              </Change>
            </PriceInfo>
          </MoverItem>
        );
      })}
    </Container>
  );
}

const Container = styled.div<{ $maxHeight?: string; $fillHeight?: boolean }>`
  display: flex;
  flex-direction: column;

  ${({ $fillHeight }) =>
    $fillHeight &&
    `
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  `}

  ${({ $maxHeight }) =>
    $maxHeight &&
    `
    max-height: ${$maxHeight};
    overflow-y: auto;
  `}

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.3);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 163, 184, 0.5);
  }
`;

const MoverItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.sm};
  margin-right: ${({ theme }) => theme.spacing.xs};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  border-radius: ${({ theme }) => theme.borderRadius.md};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.background.tertiary};
  }
`;

const CoinInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CoinImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
`;

const CoinDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const CoinName = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CoinSymbol = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const PriceInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const Price = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.family.mono};
`;

const Change = styled.span<{ $positive: boolean }>`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme, $positive }) =>
    $positive ? theme.colors.market.up : theme.colors.market.down};
  font-family: ${({ theme }) => theme.fonts.family.mono};
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
`;

const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: ${({ theme }) => theme.fonts.size.sm};
`;
