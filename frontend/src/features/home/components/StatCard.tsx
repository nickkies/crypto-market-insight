import styled from 'styled-components';

interface Props {
  icon: string;
  label: string;
  value: string;
  change?: number | null;
}

export function StatCard({ icon, label, value, change }: Props) {
  const isPositive = change != null && change >= 0;

  return (
    <Card data-testid="stat-card">
      <IconWrapper>{icon}</IconWrapper>
      <Content>
        <Label>{label}</Label>
        <ValueRow>
          <Value>{value}</Value>
          {change != null && (
            <Change $positive={isPositive} data-testid="stat-change">
              {isPositive ? '+' : ''}
              {change.toFixed(2)}%
            </Change>
          )}
        </ValueRow>
      </Content>
    </Card>
  );
}

const Card = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const IconWrapper = styled.div`
  font-size: ${({ theme }) => theme.fonts.size['2xl']};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: ${({ theme }) => theme.colors.background.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  flex: 1;
  min-width: 0;
`;

const Label = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ValueRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const Value = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.xl};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.family.mono};
`;

const Change = styled.span<{ $positive: boolean }>`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme, $positive }) =>
    $positive ? theme.colors.market.up : theme.colors.market.down};
  font-family: ${({ theme }) => theme.fonts.family.mono};
`;
