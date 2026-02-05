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

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const ErrorText = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

const RetryButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  font-size: ${({ theme }) => theme.fonts.size.xs};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.text.inverse};
  background-color: ${({ theme }) => theme.colors.primary.main};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primary.dark};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default function CoinSelect() {
  const {
    register,
    formState: { errors },
  } = useFormContext<BacktestFormValues>();

  const { data, isLoading, isError, countdown, retry } = useCoinsInfinite();
  const coins = data?.pages.flatMap((page) => page.coins) ?? [];

  if (isError) {
    return (
      <ErrorContainer data-testid="coin-select-error">
        <ErrorText>코인 목록을 불러오는 중 오류가 발생했습니다.</ErrorText>
        <RetryButton
          type="button"
          onClick={retry}
          disabled={countdown > 0}
          data-testid="coin-select-retry"
        >
          {countdown > 0 ? `다시 시도 (${countdown}초)` : '다시 시도'}
        </RetryButton>
      </ErrorContainer>
    );
  }

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
