import { useState } from 'react';
import styled from 'styled-components';
import { useAuthStore } from '@/features/auth';
import { useMyBacktests, useDeleteBacktest } from '../hooks';
import type { BacktestResult } from '../types';

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  overflow: hidden;
`;

const Header = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Count = styled.span`
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-weight: ${({ theme }) => theme.fonts.weight.regular};
`;

const Arrow = styled.span<{ $isOpen: boolean }>`
  transition: transform 0.2s;
  transform: rotate(${({ $isOpen }) => ($isOpen ? '180deg' : '0deg')});
`;

const List = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: ${({ theme }) => theme.fonts.size.sm};
`;

const LoginPrompt = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  line-height: 1.5;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
  }
`;

const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ItemTitle = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ItemMeta = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const ItemRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ReturnValue = styled.span<{ $positive: boolean }>`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme, $positive }) =>
    $positive ? theme.colors.market.up : theme.colors.market.down};
`;

const DeleteButton = styled.button`
  padding: ${({ theme }) => theme.spacing.xs};
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.tertiary};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.sm};

  &:hover {
    background-color: ${({ theme }) => theme.colors.error}20;
    color: ${({ theme }) => theme.colors.error};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface MyBacktestsPanelProps {
  onSelect: (result: BacktestResult) => void;
}

export default function MyBacktestsPanel({ onSelect }: MyBacktestsPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const { data: backtests, isLoading } = useMyBacktests();
  const deleteMutation = useDeleteBacktest();

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm('이 백테스트 기록을 삭제하시겠습니까?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return dateString.split('T')[0];
  };

  // 비로그인 상태
  if (!isAuthenticated) {
    return (
      <Container data-testid="my-backtests-panel">
        <Header onClick={() => setIsOpen(!isOpen)}>
          <HeaderLeft>My Backtests</HeaderLeft>
          <Arrow $isOpen={isOpen}>▼</Arrow>
        </Header>
        {isOpen && (
          <LoginPrompt>
            로그인하시면 백테스트 기록을
            <br />
            저장하고 관리할 수 있습니다.
          </LoginPrompt>
        )}
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container>
        <Header as="div">
          <HeaderLeft>My Backtests</HeaderLeft>
        </Header>
        <EmptyState>로딩 중...</EmptyState>
      </Container>
    );
  }

  const count = backtests?.length ?? 0;

  return (
    <Container data-testid="my-backtests-panel">
      <Header onClick={() => setIsOpen(!isOpen)}>
        <HeaderLeft>
          My Backtests
          <Count>({count})</Count>
        </HeaderLeft>
        <Arrow $isOpen={isOpen}>▼</Arrow>
      </Header>

      {isOpen && (
        <List>
          {count === 0 ? (
            <EmptyState>저장된 백테스트가 없습니다</EmptyState>
          ) : (
            backtests?.map((backtest) => (
              <Item
                key={backtest.id}
                onClick={() => onSelect(backtest)}
                data-testid={`backtest-item-${backtest.id}`}
              >
                <ItemInfo>
                  <ItemTitle>
                    {backtest.coinId.toUpperCase()} | {backtest.strategyType}
                  </ItemTitle>
                  <ItemMeta>{formatDate(backtest.createdAt)}</ItemMeta>
                </ItemInfo>
                <ItemRight>
                  <ReturnValue
                    $positive={backtest.metrics.cumulativeReturn >= 0}
                  >
                    {backtest.metrics.cumulativeReturn >= 0 ? '+' : ''}
                    {backtest.metrics.cumulativeReturn.toFixed(2)}%
                  </ReturnValue>
                  <DeleteButton
                    onClick={(e) => handleDelete(e, backtest.id)}
                    disabled={deleteMutation.isPending}
                    title="삭제"
                  >
                    ✕
                  </DeleteButton>
                </ItemRight>
              </Item>
            ))
          )}
        </List>
      )}
    </Container>
  );
}
