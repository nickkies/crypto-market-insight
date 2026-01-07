import styled from 'styled-components';
import { TableRowsSkeleton } from '@/features/common/components';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
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

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  padding: ${({ theme }) => theme.spacing.lg};
`;

export function MyBacktestsPage() {
  return (
    <PageContainer data-testid="my-backtests-page">
      <PageHeader>
        <PageTitle>My Backtests</PageTitle>
        <PageDescription>
          저장된 백테스트 결과를 확인하고 관리하세요.
        </PageDescription>
      </PageHeader>

      <Card>
        <TableRowsSkeleton rows={5} />
      </Card>
    </PageContainer>
  );
}
