import styled from 'styled-components';
import type { StrategyType } from '../types';

interface Props {
  value: StrategyType;
  onChange: (value: StrategyType) => void;
}

const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const strategies: { value: StrategyType; label: string }[] = [
  { value: 'RSI', label: 'RSI (Relative Strength Index)' },
];

export default function StrategySelect({ value, onChange }: Props) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value as StrategyType)}
      data-testid="strategy-select"
    >
      {strategies.map((strategy) => (
        <option key={strategy.value} value={strategy.value}>
          {strategy.label}
        </option>
      ))}
    </Select>
  );
}
