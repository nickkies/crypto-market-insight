import { useEffect } from 'react';
import styled from 'styled-components';
import { useCoinsInfinite } from '../hooks';
import { useIntersectionObserver } from '@/features/common/hooks';
import CoinCard from './CoinCard';

interface Props {
  keyword?: string;
}

export default function CoinList({ keyword }: Props) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useCoinsInfinite({ keyword });

  const { ref, isIntersecting } = useIntersectionObserver({
    enabled: hasNextPage && !isFetchingNextPage,
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const coins = data?.pages.flatMap((page) => page.coins) ?? [];

  if (isLoading) {
    return <LoadingText>로딩 중...</LoadingText>;
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
      <LoadMoreTrigger ref={ref}>
        {isFetchingNextPage && <LoadingText>더 불러오는 중...</LoadingText>}
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
  height: 1px;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const LoadingText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const EmptyText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.tertiary};
  padding: ${({ theme }) => theme.spacing.xl};
`;
