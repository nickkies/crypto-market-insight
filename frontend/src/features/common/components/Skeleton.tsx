import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const SkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.background.secondary} 25%,
    ${({ theme }) => theme.colors.background.tertiary} 50%,
    ${({ theme }) => theme.colors.background.secondary} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

// Card Skeleton - 통계 카드, 요약 정보용
export const CardSkeleton = styled(SkeletonBase)`
  padding: ${({ theme }) => theme.spacing.lg};
  min-height: 120px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

// Chart Skeleton - 차트 영역용
export const ChartSkeleton = styled(SkeletonBase)`
  width: 100%;
  height: 400px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    height: 300px;
  }
`;

// Table Skeleton - 테이블/리스트용
export const TableSkeleton = styled(SkeletonBase)`
  width: 100%;
  min-height: 300px;
`;

// Row Skeleton - 테이블 행용
const RowSkeleton = styled(SkeletonBase)`
  height: 48px;
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  &:last-child {
    margin-bottom: 0;
  }
`;

// 여러 줄 테이블 스켈레톤
export function TableRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  );
}

// Text Skeleton - 텍스트 라인용
export const TextSkeleton = styled(SkeletonBase)<{ width?: string }>`
  height: 1rem;
  width: ${({ width }) => width || '100%'};
`;

// CoinCard Skeleton - 코인 카드용
const CoinCardSkeletonContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
`;

const CoinCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const CoinCardInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CoinImageSkeleton = styled(SkeletonBase)`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
`;

const CoinDetailsSkeleton = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const FavoriteButtonSkeleton = styled(SkeletonBase)`
  width: 24px;
  height: 24px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const CoinCardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PriceSectionSkeleton = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const MetaSectionSkeleton = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const MetaItemSkeleton = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export function CoinCardSkeleton() {
  return (
    <CoinCardSkeletonContainer>
      <CoinCardHeader>
        <CoinCardInfo>
          <CoinImageSkeleton />
          <CoinDetailsSkeleton>
            <TextSkeleton width="80px" />
            <TextSkeleton width="40px" />
          </CoinDetailsSkeleton>
        </CoinCardInfo>
        <FavoriteButtonSkeleton />
      </CoinCardHeader>
      <CoinCardBody>
        <PriceSectionSkeleton>
          <TextSkeleton width="100px" />
          <TextSkeleton width="50px" />
        </PriceSectionSkeleton>
        <MetaSectionSkeleton>
          <MetaItemSkeleton>
            <TextSkeleton width="30px" />
            <TextSkeleton width="60px" />
          </MetaItemSkeleton>
          <MetaItemSkeleton>
            <TextSkeleton width="30px" />
            <TextSkeleton width="40px" />
          </MetaItemSkeleton>
        </MetaSectionSkeleton>
      </CoinCardBody>
    </CoinCardSkeletonContainer>
  );
}

// CoinList Skeleton - 코인 목록 그리드용
const CoinListGrid = styled.div`
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

export function CoinListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <CoinListGrid data-testid="coin-list-skeleton">
      {Array.from({ length: count }).map((_, i) => (
        <CoinCardSkeleton key={i} />
      ))}
    </CoinListGrid>
  );
}
