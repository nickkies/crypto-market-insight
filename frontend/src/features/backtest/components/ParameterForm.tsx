import styled from 'styled-components';
import { useFormContext } from 'react-hook-form';
import type { BacktestFormValues } from './BacktestForm';
import type { StrategyType } from '../types';

interface Props {
  strategyType: StrategyType;
}

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid
    ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error : theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fonts.size.sm};

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error : theme.colors.primary.main};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

const ErrorMessage = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.error};
`;

const HelperText = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

function RsiParameterForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext<BacktestFormValues>();

  return (
    <>
      <FormGroup>
        <Label htmlFor="rsi-period">RSI Period</Label>
        <Input
          id="rsi-period"
          type="number"
          {...register('rsiParameters.period', {
            required: 'Period is required',
            min: { value: 2, message: 'Period must be at least 2' },
            max: { value: 100, message: 'Period must be at most 100' },
            valueAsNumber: true,
          })}
          $hasError={!!errors.rsiParameters?.period}
          data-testid="param-period"
        />
        {errors.rsiParameters?.period && (
          <ErrorMessage>{errors.rsiParameters.period.message}</ErrorMessage>
        )}
        <HelperText>RSI 계산 기간 (기본: 7)</HelperText>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="rsi-oversold">Oversold Threshold</Label>
        <Input
          id="rsi-oversold"
          type="number"
          {...register('rsiParameters.oversold', {
            required: 'Oversold is required',
            min: { value: 0, message: 'Oversold must be at least 0' },
            max: { value: 100, message: 'Oversold must be at most 100' },
            valueAsNumber: true,
          })}
          $hasError={!!errors.rsiParameters?.oversold}
          data-testid="param-oversold"
        />
        {errors.rsiParameters?.oversold && (
          <ErrorMessage>{errors.rsiParameters.oversold.message}</ErrorMessage>
        )}
        <HelperText>RSI가 이 값 아래로 떨어지면 매수 (기본: 45)</HelperText>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="rsi-overbought">Overbought Threshold</Label>
        <Input
          id="rsi-overbought"
          type="number"
          {...register('rsiParameters.overbought', {
            required: 'Overbought is required',
            min: { value: 0, message: 'Overbought must be at least 0' },
            max: { value: 100, message: 'Overbought must be at most 100' },
            valueAsNumber: true,
          })}
          $hasError={!!errors.rsiParameters?.overbought}
          data-testid="param-overbought"
        />
        {errors.rsiParameters?.overbought && (
          <ErrorMessage>{errors.rsiParameters.overbought.message}</ErrorMessage>
        )}
        <HelperText>RSI가 이 값 위로 올라가면 매도 (기본: 55)</HelperText>
      </FormGroup>
    </>
  );
}

function MacdParameterForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext<BacktestFormValues>();

  return (
    <>
      <FormGroup>
        <Label htmlFor="macd-fast">Fast EMA Period</Label>
        <Input
          id="macd-fast"
          type="number"
          {...register('macdParameters.fastPeriod', {
            required: 'Fast period is required',
            min: { value: 2, message: 'Fast period must be at least 2' },
            max: { value: 50, message: 'Fast period must be at most 50' },
            valueAsNumber: true,
          })}
          $hasError={!!errors.macdParameters?.fastPeriod}
          data-testid="param-fast-period"
        />
        {errors.macdParameters?.fastPeriod && (
          <ErrorMessage>
            {errors.macdParameters.fastPeriod.message}
          </ErrorMessage>
        )}
        <HelperText>빠른 EMA 기간 (기본: 5)</HelperText>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="macd-slow">Slow EMA Period</Label>
        <Input
          id="macd-slow"
          type="number"
          {...register('macdParameters.slowPeriod', {
            required: 'Slow period is required',
            min: { value: 2, message: 'Slow period must be at least 2' },
            max: { value: 100, message: 'Slow period must be at most 100' },
            valueAsNumber: true,
          })}
          $hasError={!!errors.macdParameters?.slowPeriod}
          data-testid="param-slow-period"
        />
        {errors.macdParameters?.slowPeriod && (
          <ErrorMessage>
            {errors.macdParameters.slowPeriod.message}
          </ErrorMessage>
        )}
        <HelperText>느린 EMA 기간 (기본: 13)</HelperText>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="macd-signal">Signal Period</Label>
        <Input
          id="macd-signal"
          type="number"
          {...register('macdParameters.signalPeriod', {
            required: 'Signal period is required',
            min: { value: 2, message: 'Signal period must be at least 2' },
            max: { value: 50, message: 'Signal period must be at most 50' },
            valueAsNumber: true,
          })}
          $hasError={!!errors.macdParameters?.signalPeriod}
          data-testid="param-signal-period"
        />
        {errors.macdParameters?.signalPeriod && (
          <ErrorMessage>
            {errors.macdParameters.signalPeriod.message}
          </ErrorMessage>
        )}
        <HelperText>시그널 라인 EMA 기간 (기본: 6)</HelperText>
      </FormGroup>
    </>
  );
}

function BollingerBandsParameterForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext<BacktestFormValues>();

  return (
    <>
      <FormGroup>
        <Label htmlFor="bb-period">Period</Label>
        <Input
          id="bb-period"
          type="number"
          {...register('bollingerBandsParameters.period', {
            required: 'Period is required',
            min: { value: 2, message: 'Period must be at least 2' },
            max: { value: 100, message: 'Period must be at most 100' },
            valueAsNumber: true,
          })}
          $hasError={!!errors.bollingerBandsParameters?.period}
          data-testid="param-bb-period"
        />
        {errors.bollingerBandsParameters?.period && (
          <ErrorMessage>
            {errors.bollingerBandsParameters.period.message}
          </ErrorMessage>
        )}
        <HelperText>이동평균 기간 (기본: 10)</HelperText>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="bb-stddev">Standard Deviation</Label>
        <Input
          id="bb-stddev"
          type="number"
          step="0.1"
          {...register('bollingerBandsParameters.stdDev', {
            required: 'Standard deviation is required',
            min: { value: 1, message: 'Standard deviation must be at least 1' },
            max: { value: 5, message: 'Standard deviation must be at most 5' },
            valueAsNumber: true,
          })}
          $hasError={!!errors.bollingerBandsParameters?.stdDev}
          data-testid="param-bb-stddev"
        />
        {errors.bollingerBandsParameters?.stdDev && (
          <ErrorMessage>
            {errors.bollingerBandsParameters.stdDev.message}
          </ErrorMessage>
        )}
        <HelperText>밴드 폭 배수 (기본: 1.5)</HelperText>
      </FormGroup>
    </>
  );
}

function MovingAverageParameterForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext<BacktestFormValues>();

  return (
    <>
      <FormGroup>
        <Label htmlFor="ma-short">Short MA Period</Label>
        <Input
          id="ma-short"
          type="number"
          {...register('movingAverageParameters.shortPeriod', {
            required: 'Short period is required',
            min: { value: 2, message: 'Short period must be at least 2' },
            max: { value: 50, message: 'Short period must be at most 50' },
            valueAsNumber: true,
          })}
          $hasError={!!errors.movingAverageParameters?.shortPeriod}
          data-testid="param-ma-short"
        />
        {errors.movingAverageParameters?.shortPeriod && (
          <ErrorMessage>
            {errors.movingAverageParameters.shortPeriod.message}
          </ErrorMessage>
        )}
        <HelperText>단기 이동평균 기간 (기본: 3)</HelperText>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="ma-long">Long MA Period</Label>
        <Input
          id="ma-long"
          type="number"
          {...register('movingAverageParameters.longPeriod', {
            required: 'Long period is required',
            min: { value: 2, message: 'Long period must be at least 2' },
            max: { value: 200, message: 'Long period must be at most 200' },
            valueAsNumber: true,
          })}
          $hasError={!!errors.movingAverageParameters?.longPeriod}
          data-testid="param-ma-long"
        />
        {errors.movingAverageParameters?.longPeriod && (
          <ErrorMessage>
            {errors.movingAverageParameters.longPeriod.message}
          </ErrorMessage>
        )}
        <HelperText>장기 이동평균 기간 (기본: 10)</HelperText>
      </FormGroup>
    </>
  );
}

export default function ParameterForm({ strategyType }: Props) {
  switch (strategyType) {
    case 'RSI':
      return <RsiParameterForm />;
    case 'MACD':
      return <MacdParameterForm />;
    case 'BOLLINGER_BANDS':
      return <BollingerBandsParameterForm />;
    case 'MOVING_AVERAGE':
      return <MovingAverageParameterForm />;
    default:
      return <RsiParameterForm />;
  }
}
