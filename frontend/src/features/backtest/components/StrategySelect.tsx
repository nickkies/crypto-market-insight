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

const strategies: {
  value: StrategyType;
  label: string;
  description: string;
}[] = [
  {
    value: 'RSI',
    label: 'RSI (Relative Strength Index)',
    description: '과매수/과매도 구간 기반 매매',
  },
  {
    value: 'MACD',
    label: 'MACD (Moving Average Convergence Divergence)',
    description: 'MACD와 Signal Line 교차 기반 매매',
  },
  {
    value: 'BOLLINGER_BANDS',
    label: 'Bollinger Bands',
    description: '밴드 상단/하단 터치 기반 매매',
  },
  {
    value: 'MOVING_AVERAGE',
    label: 'Moving Average Crossover',
    description: '단기/장기 이동평균 교차 기반 매매',
  },
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
