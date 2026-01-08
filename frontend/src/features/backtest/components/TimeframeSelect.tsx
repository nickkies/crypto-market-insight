import styled from 'styled-components';
import { useFormContext } from 'react-hook-form';
import type { BacktestFormValues } from './BacktestForm';

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

const timeframes = [
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hours' },
  { value: '1d', label: '1 Day' },
  { value: '1w', label: '1 Week' },
];

export default function TimeframeSelect() {
  const { register } = useFormContext<BacktestFormValues>();

  return (
    <Select {...register('timeframe')} data-testid="timeframe-select">
      {timeframes.map((tf) => (
        <option key={tf.value} value={tf.value}>
          {tf.label}
        </option>
      ))}
    </Select>
  );
}
