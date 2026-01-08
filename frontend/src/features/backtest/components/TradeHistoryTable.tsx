import { useState } from 'react';
import styled from 'styled-components';
import type { TradeDto } from '../types';
import { formatPercent } from '@/utils/format';

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background-color: ${({ theme }) => theme.colors.background.tertiary};
  position: sticky;
  top: 0;
  z-index: 1;
`;

const TableHeader = styled.th`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  text-align: left;
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  white-space: nowrap;
`;

const TableRow = styled.tr`
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
  }
`;

const TableCell = styled.td<{ $positive?: boolean; $negative?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme, $positive, $negative }) =>
    $positive
      ? theme.colors.market.up
      : $negative
        ? theme.colors.market.down
        : theme.colors.text.primary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  white-space: nowrap;
`;

const NumberCell = styled(TableCell)`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-variant-numeric: tabular-nums;
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: ${({ theme }) => theme.fonts.size.sm};
`;

const LoadMoreButton = styled.button`
  display: block;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background.tertiary};
  color: ${({ theme }) => theme.colors.text.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.secondary};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const PAGE_SIZE = 10;

interface Props {
  trades: TradeDto[];
}

export default function TradeHistoryTable({ trades }: Props) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (trades.length === 0) {
    return <EmptyState>거래 내역이 없습니다</EmptyState>;
  }

  const visibleTrades = trades.slice(0, visibleCount);
  const hasMore = visibleCount < trades.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, trades.length));
  };

  return (
    <TableContainer>
      <Table data-testid="trade-history">
        <TableHead>
          <tr>
            <TableHeader>#</TableHeader>
            <TableHeader>Entry Date</TableHeader>
            <TableHeader>Exit Date</TableHeader>
            <TableHeader>Entry Price</TableHeader>
            <TableHeader>Exit Price</TableHeader>
            <TableHeader>Profit</TableHeader>
            <TableHeader>Return</TableHeader>
          </tr>
        </TableHead>
        <tbody>
          {visibleTrades.map((trade, index) => (
            <TableRow key={index}>
              <NumberCell>{index + 1}</NumberCell>
              <TableCell>{formatDate(trade.entryTime)}</TableCell>
              <TableCell>{formatDate(trade.exitTime)}</TableCell>
              <TableCell>{formatCurrency(trade.entryPrice)}</TableCell>
              <TableCell>{formatCurrency(trade.exitPrice)}</TableCell>
              <TableCell
                $positive={trade.profit > 0}
                $negative={trade.profit < 0}
              >
                {formatCurrency(trade.profit)}
              </TableCell>
              <TableCell
                $positive={trade.profitPercent > 0}
                $negative={trade.profitPercent < 0}
              >
                {formatPercent(trade.profitPercent)}
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
      {hasMore && (
        <LoadMoreButton onClick={handleLoadMore}>
          더 보기 ({visibleCount} / {trades.length})
        </LoadMoreButton>
      )}
    </TableContainer>
  );
}
