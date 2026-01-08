import styled from 'styled-components';
import { useFormContext } from 'react-hook-form';
import { useCoinsInfinite } from '@/features/market/hooks';
import type { BacktestFormValues } from './BacktestForm';

const SelectWrapper = styled.div`
  position: relative;
`;

const Select = styled.select<{ $hasError?: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid
    ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error : theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error : theme.colors.primary.main};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing.xs};
  display: block;
`;

export default function CoinSelect() {
  const {
    register,
    formState: { errors },
  } = useFormContext<BacktestFormValues>();

  const { data, isLoading } = useCoinsInfinite();
  const coins = data?.pages.flatMap((page) => page.coins) ?? [];

  return (
    <SelectWrapper>
      <Select
        {...register('coinId', {
          required: '코인을 선택해주세요',
        })}
        $hasError={!!errors.coinId}
        disabled={isLoading}
        data-testid="coin-select"
      >
        <option value="">코인 선택...</option>
        {coins.map((coin) => (
          <option key={coin.id} value={coin.id}>
            {coin.name} ({coin.symbol.toUpperCase()})
          </option>
        ))}
      </Select>
      {errors.coinId && <ErrorMessage>{errors.coinId.message}</ErrorMessage>}
    </SelectWrapper>
  );
}
