import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useForm, FormProvider } from 'react-hook-form';
import type {
  StrategyType,
  RsiParameters,
  MacdParameters,
  BollingerBandsParameters,
  MovingAverageParameters,
  BacktestRequestDto,
} from '../types';
import {
  DEFAULT_RSI_PARAMS,
  DEFAULT_MACD_PARAMS,
  DEFAULT_BOLLINGER_BANDS_PARAMS,
  DEFAULT_MOVING_AVERAGE_PARAMS,
} from '../types';
import StrategySelect from './StrategySelect';
import ParameterForm from './ParameterForm';
import CoinSelect from './CoinSelect';
import TimeframeSelect from './TimeframeSelect';
import DateRangePicker from './DateRangePicker';

export interface BacktestFormValues {
  coinId: string;
  strategyType: StrategyType;
  timeframe: string; // 1d=90일, 3d=180일, 1w=365일 (기간은 타임프레임으로 자동 결정)
  // 전략별 파라미터
  rsiParameters: RsiParameters;
  macdParameters: MacdParameters;
  bollingerBandsParameters: BollingerBandsParameters;
  movingAverageParameters: MovingAverageParameters;
  // Backward compatibility
  parameters: RsiParameters;
  endDate: string; // 종료일만 선택 (시작일은 타임프레임 기반 자동 계산)
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

const DateRangeCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.md};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary.main}15,
    ${({ theme }) => theme.colors.background.tertiary}
  );
  border: 1px solid ${({ theme }) => theme.colors.primary.main}30;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const DateRangeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DateRangePeriod = styled.span`
  background-color: ${({ theme }) => theme.colors.primary.main}20;
  color: ${({ theme }) => theme.colors.primary.main};
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
`;

const DateRangeDates = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fonts.size.sm};
`;

const DateValue = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  font-family: monospace;
`;

const DateArrow = styled.span`
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

// 타임프레임별 백테스트 기간 (일)
const TIMEFRAME_PERIODS: Record<string, number> = {
  '1d': 30,
  '3d': 90,
  '1w': 180,
};

// 시작일 계산
const calculateStartDate = (endDate: string, timeframe: string): string => {
  const end = endDate ? new Date(endDate) : new Date();
  const period = TIMEFRAME_PERIODS[timeframe] || 90;
  const start = new Date(end);
  start.setDate(start.getDate() - period);
  return start.toISOString().split('T')[0];
};

// 기본 종료일: 오늘 (시작일은 타임프레임 기반 자동 계산)
const getDefaultEndDate = () => {
  return new Date().toISOString().split('T')[0];
};

const defaultValues: BacktestFormValues = {
  coinId: 'bitcoin',
  strategyType: 'RSI',
  timeframe: '1d',
  rsiParameters: DEFAULT_RSI_PARAMS,
  macdParameters: DEFAULT_MACD_PARAMS,
  bollingerBandsParameters: DEFAULT_BOLLINGER_BANDS_PARAMS,
  movingAverageParameters: DEFAULT_MOVING_AVERAGE_PARAMS,
  parameters: DEFAULT_RSI_PARAMS, // Backward compatibility
  endDate: getDefaultEndDate(),
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

    // 전략 타입에 따라 적절한 파라미터만 전송
    // startDate는 백엔드에서 타임프레임 기반 자동 계산
    const request: BacktestRequestDto = {
      coinId: data.coinId,
      strategyType: data.strategyType,
      timeframe: data.timeframe,
      endDate: data.endDate || undefined, // 빈 문자열이면 undefined로 (백엔드가 오늘로 처리)
    };

    switch (data.strategyType) {
      case 'RSI':
        request.rsiParameters = data.rsiParameters;
        request.parameters = data.rsiParameters; // Backward compatibility
        break;
      case 'MACD':
        request.macdParameters = data.macdParameters;
        break;
      case 'BOLLINGER_BANDS':
        request.bollingerBandsParameters = data.bollingerBandsParameters;
        break;
      case 'MOVING_AVERAGE':
        request.movingAverageParameters = data.movingAverageParameters;
        break;
    }

    onSubmit(request);
  });

  const strategyType = methods.watch('strategyType');
  const timeframe = methods.watch('timeframe');
  const endDate = methods.watch('endDate');
  const startDate = calculateStartDate(endDate, timeframe);

  const isDisabled = isPending || countdown > 0;

  const getButtonText = () => {
    if (isPending) return 'Running...';
    if (countdown > 0) return `Run Backtest (${countdown}s)`;
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
              <Label>End Date</Label>
              <DateRangePicker />
            </FormGroup>
            <DateRangeCard data-testid="date-range-info">
              <DateRangeHeader>
                <span>Analysis Period</span>
                <DateRangePeriod>
                  {TIMEFRAME_PERIODS[timeframe] || 90} days
                </DateRangePeriod>
              </DateRangeHeader>
              <DateRangeDates>
                <DateValue>{startDate}</DateValue>
                <DateArrow>→</DateArrow>
                <DateValue>{endDate || getDefaultEndDate()}</DateValue>
              </DateRangeDates>
            </DateRangeCard>
          </Card>

          <Card>
            <CardTitle>Strategy Parameters</CardTitle>
            <ParameterForm strategyType={strategyType} />
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
