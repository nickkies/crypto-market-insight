import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useMarketStore } from '../stores';
import { useFavoritesSync } from '../hooks';
import type { CoinSummaryDto } from '../services';
import { formatPrice, formatPercent, formatMarketCap } from '@/utils';

interface Props {
  coin: CoinSummaryDto;
}

export default function CoinCard({ coin }: Props) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavoritesSync();
  const { selectedCoinId, setSelectedCoinId } = useMarketStore();
  const favorite = isFavorite(coin.id);
  const isSelected = selectedCoinId === coin.id;

  const handleClick = () => {
    setSelectedCoinId(coin.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDetailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/market/${coin.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(coin.id);
  };

  const isPositive = coin.priceChangePercentage24h >= 0;

  return (
    <Card onClick={handleClick} $selected={isSelected} data-testid="coin-card">
      <CardHeader>
        <CoinInfo>
          <CoinImage src={coin.image} alt={coin.name} />
          <CoinDetails>
            <CoinName data-testid="coin-name">{coin.name}</CoinName>
            <CoinSymbol>{coin.symbol.toUpperCase()}</CoinSymbol>
          </CoinDetails>
        </CoinInfo>
        <ButtonGroup>
          <DetailButton
            onClick={handleDetailClick}
            aria-label="상세 보기"
            data-testid="detail-button"
          >
            →
          </DetailButton>
          <FavoriteButton
            onClick={handleFavoriteClick}
            $active={favorite}
            aria-label={favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            data-testid="favorite-button"
          >
            {favorite ? '★' : '☆'}
          </FavoriteButton>
        </ButtonGroup>
      </CardHeader>
      <CardBody>
        <PriceSection>
          <Price data-testid="coin-price">
            ${formatPrice(coin.currentPrice)}
          </Price>
          <PriceChange $positive={isPositive} data-testid="coin-change">
            {formatPercent(coin.priceChangePercentage24h)}
          </PriceChange>
        </PriceSection>
        <MetaSection>
          <MetaItem>
            <MetaLabel>시총</MetaLabel>
            <MetaValue>${formatMarketCap(coin.marketCap)}</MetaValue>
          </MetaItem>
          <MetaItem>
            <MetaLabel>순위</MetaLabel>
            <MetaValue>#{coin.marketCapRank}</MetaValue>
          </MetaItem>
        </MetaSection>
      </CardBody>
    </Card>
  );
}

const Card = styled.div<{ $selected: boolean }>`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid
    ${({ theme, $selected }) =>
      $selected ? theme.colors.primary : theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};

  ${({ theme, $selected }) =>
    $selected &&
    `
    box-shadow: 0 0 0 1px ${theme.colors.primary};
  `}

  &:hover {
    background: ${({ theme }) => theme.colors.background.tertiary};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const CoinInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CoinImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
`;

const CoinDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const CoinName = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.md};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CoinSymbol = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const DetailButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: ${({ theme }) => theme.fonts.size.lg};
  color: ${({ theme }) => theme.colors.text.tertiary};
  padding: ${({ theme }) => theme.spacing.xs};
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
    transform: scale(1.1);
  }
`;

const FavoriteButton = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  font-size: ${({ theme }) => theme.fonts.size.xl};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.warning : theme.colors.text.tertiary};
  padding: ${({ theme }) => theme.spacing.xs};
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.warning};
    transform: scale(1.1);
  }
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PriceSection = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Price = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.xl};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.family.mono};
`;

const PriceChange = styled.span<{ $positive: boolean }>`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme, $positive }) =>
    $positive ? theme.colors.market.up : theme.colors.market.down};
  font-family: ${({ theme }) => theme.fonts.family.mono};
`;

const MetaSection = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const MetaLabel = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const MetaValue = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: ${({ theme }) => theme.fonts.family.mono};
`;
