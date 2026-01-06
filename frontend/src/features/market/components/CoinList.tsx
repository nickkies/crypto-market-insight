import { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useCoinsInfinite } from '../hooks';
import { useFavoritesStore } from '../stores';
import { useIntersectionObserver } from '@/features/common/hooks';
import { CoinListSkeleton } from '@/features/common/components';
import type { FilterTab } from '@/features/common/components';
import CoinCard from './CoinCard';

interface Props {
  keyword?: string;
  filter?: FilterTab;
}

export default function CoinList({ keyword, filter = 'all' }: Props) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useCoinsInfinite({ keyword });
  const { favorites } = useFavoritesStore();

  const { ref, isIntersecting } = useIntersectionObserver({
    enabled: hasNextPage && !isFetchingNextPage && filter === 'all',
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const coins = useMemo(() => {
    const allCoins = data?.pages.flatMap((page) => page.coins) ?? [];
    if (filter === 'favorites') {
      return allCoins.filter((coin) => favorites.includes(coin.id));
    }
    return allCoins;
  }, [data?.pages, filter, favorites]);

  if (isLoading) {
    return <CoinListSkeleton count={8} />;
  }

  if (filter === 'favorites' && favorites.length === 0) {
    return <EmptyText>즐겨찾기 코인을 추가해 볼까요?</EmptyText>;
  }

  if (coins.length === 0) {
    return <EmptyText>검색 결과가 없습니다.</EmptyText>;
  }

  return (
    <Container>
      <Grid>
        {coins.map((coin) => (
          <CoinCard key={coin.id} coin={coin} />
        ))}
      </Grid>
      <LoadMoreTrigger ref={ref} data-testid="load-more-trigger">
        {isFetchingNextPage && (
          <LoadingMoreText>더 불러오는 중...</LoadingMoreText>
        )}
      </LoadMoreTrigger>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.xl}) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const LoadMoreTrigger = styled.div`
  height: 100px;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const LoadingMoreText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const EmptyText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.tertiary};
  padding: ${({ theme }) => theme.spacing.xl};
`;
