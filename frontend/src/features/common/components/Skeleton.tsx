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
