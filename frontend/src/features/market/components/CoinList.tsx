import { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useCoinsInfinite } from '../hooks';
import { useFavoritesStore } from '../stores';
import { useIntersectionObserver } from '@/features/common/hooks';
import {
  CoinListSkeleton,
  ErrorState,
  EmptyState,
} from '@/features/common/components';
import type { FilterTab } from '@/features/common/components';
import CoinCard from './CoinCard';

interface Props {
  keyword?: string;
  filter?: FilterTab;
}

export default function CoinList({ keyword, filter = 'all' }: Props) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useCoinsInfinite({ keyword });
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

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (filter === 'favorites' && favorites.length === 0) {
    return (
      <EmptyState
        icon="⭐"
        title="즐겨찾기한 코인이 없습니다"
        description="관심 있는 코인의 별 아이콘을 눌러 즐겨찾기에 추가해 보세요."
      />
    );
  }

  if (coins.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        title="검색 결과가 없습니다"
        description="다른 키워드로 검색해 보세요."
      />
    );
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
