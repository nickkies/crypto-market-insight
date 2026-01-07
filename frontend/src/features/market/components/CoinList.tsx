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
import { isApiError } from '@/features/common/api';
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
    error,
    refetch,
  } = useCoinsInfinite({ keyword });
  const { favorites } = useFavoritesStore();

  const { ref, isIntersecting } = useIntersectionObserver({
    enabled: hasNextPage && !isFetchingNextPage && !isError && filter === 'all',
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage && !isError) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, isError, fetchNextPage]);

  const coins = useMemo(() => {
    const allCoins = data?.pages.flatMap((page) => page.coins) ?? [];
    if (filter === 'favorites') {
      return allCoins.filter((coin) => favorites.includes(coin.id));
    }
    return allCoins;
  }, [data?.pages, filter, favorites]);

  const hasData = coins.length > 0;

  // 처음 로딩 중일 때만 스켈레톤 표시
  if (isLoading && !hasData) {
    return <CoinListSkeleton count={8} />;
  }

  // 에러가 났지만 기존 데이터가 없을 때만 에러 화면 표시
  if (isError && !hasData) {
    const isRateLimit = isApiError(error) && error.isRateLimitError;
    return (
      <ErrorState
        message={
          isRateLimit
            ? 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
            : undefined
        }
        onRetry={() => refetch()}
      />
    );
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

  const isRateLimit = isApiError(error) && error.isRateLimitError;

  return (
    <Container>
      <Grid>
        {coins.map((coin) => (
          <CoinCard key={coin.id} coin={coin} />
        ))}
      </Grid>
      <LoadMoreTrigger ref={ref} data-testid="load-more-trigger">
        {isFetchingNextPage && !isError && (
          <LoadingMoreText>더 불러오는 중...</LoadingMoreText>
        )}
        {isError && hasData && (
          <ErrorBanner>
            {isRateLimit
              ? 'API 요청 한도를 초과했습니다.'
              : '데이터를 불러오는 중 오류가 발생했습니다.'}
            <RetryButton onClick={() => refetch()}>다시 시도</RetryButton>
          </ErrorBanner>
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

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.error}15;
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fonts.size.sm};
`;

const RetryButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fonts.size.xs};
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background-color: ${({ theme }) => theme.colors.error};
    color: ${({ theme }) => theme.colors.text.inverse};
  }
`;
