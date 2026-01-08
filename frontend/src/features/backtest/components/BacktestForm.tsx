import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useForm, FormProvider } from 'react-hook-form';
import type { StrategyType, RsiParameters, BacktestRequestDto } from '../types';
import StrategySelect from './StrategySelect';
import ParameterForm from './ParameterForm';
import CoinSelect from './CoinSelect';
import TimeframeSelect from './TimeframeSelect';
import DateRangePicker from './DateRangePicker';

export interface BacktestFormValues {
  coinId: string;
  strategyType: StrategyType;
  timeframe: string;
  parameters: RsiParameters;
  startDate: string;
  endDate: string;
}

interface Props {
  onSubmit: (data: BacktestRequestDto) => void;
  isPending?: boolean;
  isRateLimitError?: boolean;
  cooldown?: number; // Rate limit 에러 시 쿨다운 시간 (초)
}

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.fonts.size.md};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const RunButton = styled.button<{ $isLoading?: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: ${({ theme }) => theme.colors.text.inverse};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  transition: background-color ${({ theme }) => theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primary.dark};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Spinner = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// 기본 날짜 범위: 1년 전 ~ 오늘
const getDefaultDates = () => {
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  return {
    startDate: oneYearAgo.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
  };
};

const defaultValues: BacktestFormValues = {
  coinId: 'bitcoin',
  strategyType: 'RSI',
  timeframe: '1d',
  parameters: {
    period: 7,
    oversold: 40,
    overbought: 60,
  },
  ...getDefaultDates(),
};

export default function BacktestForm({
  onSubmit,
  isPending,
  isRateLimitError,
  cooldown = 60,
}: Props) {
  const [countdown, setCountdown] = useState(0);

  const methods = useForm<BacktestFormValues>({
    defaultValues,
    mode: 'onBlur',
  });

  // Rate limit 에러 발생 시 카운트다운 시작
  useEffect(() => {
    if (isRateLimitError) {
      setCountdown(cooldown);
    }
  }, [isRateLimitError, cooldown]);

  // 카운트다운 타이머
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = methods.handleSubmit((data) => {
    if (countdown > 0) return;
    onSubmit(data);
  });

  const strategyType = methods.watch('strategyType');

  const isDisabled = isPending || countdown > 0;

  const getButtonText = () => {
    if (isPending) return 'Running...';
    if (countdown > 0) return `Run Backtest (${countdown}초)`;
    return 'Run Backtest';
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit}>
        <FormContainer>
          <Card>
            <CardTitle>Strategy Configuration</CardTitle>
            <FormGroup>
              <Label>Coin</Label>
              <CoinSelect />
            </FormGroup>
            <FormGroup>
              <Label>Strategy</Label>
              <StrategySelect
                value={strategyType}
                onChange={(value) => methods.setValue('strategyType', value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Timeframe</Label>
              <TimeframeSelect />
            </FormGroup>
            <FormGroup>
              <Label>Date Range</Label>
              <DateRangePicker />
            </FormGroup>
          </Card>

          <Card>
            <CardTitle>Strategy Parameters</CardTitle>
            <ParameterForm />
          </Card>

          <RunButton
            type="submit"
            disabled={isDisabled}
            $isLoading={isPending}
            data-testid="run-backtest-button"
          >
            {isPending && <Spinner />}
            {getButtonText()}
          </RunButton>
        </FormContainer>
      </form>
    </FormProvider>
  );
}
