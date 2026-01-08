import styled from 'styled-components';
import { useFormContext } from 'react-hook-form';
import type { BacktestFormValues } from './BacktestForm';

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

export default function ParameterForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext<BacktestFormValues>();

  return (
    <>
      <FormGroup>
        <Label htmlFor="period">RSI Period</Label>
        <Input
          id="period"
          type="number"
          {...register('parameters.period', {
            required: 'Period는 필수입니다',
            min: { value: 2, message: 'Period는 2 이상이어야 합니다' },
            max: { value: 100, message: 'Period는 100 이하여야 합니다' },
            valueAsNumber: true,
          })}
          $hasError={!!errors.parameters?.period}
          data-testid="param-period"
        />
        {errors.parameters?.period && (
          <ErrorMessage>{errors.parameters.period.message}</ErrorMessage>
        )}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="oversold">RSI Oversold</Label>
        <Input
          id="oversold"
          type="number"
          {...register('parameters.oversold', {
            required: 'Oversold는 필수입니다',
            min: { value: 0, message: 'Oversold는 0 이상이어야 합니다' },
            max: { value: 100, message: 'Oversold는 100 이하여야 합니다' },
            valueAsNumber: true,
          })}
          $hasError={!!errors.parameters?.oversold}
          data-testid="param-oversold"
        />
        {errors.parameters?.oversold && (
          <ErrorMessage>{errors.parameters.oversold.message}</ErrorMessage>
        )}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="overbought">RSI Overbought</Label>
        <Input
          id="overbought"
          type="number"
          {...register('parameters.overbought', {
            required: 'Overbought는 필수입니다',
            min: { value: 0, message: 'Overbought는 0 이상이어야 합니다' },
            max: { value: 100, message: 'Overbought는 100 이하여야 합니다' },
            valueAsNumber: true,
          })}
          $hasError={!!errors.parameters?.overbought}
          data-testid="param-overbought"
        />
        {errors.parameters?.overbought && (
          <ErrorMessage>{errors.parameters.overbought.message}</ErrorMessage>
        )}
      </FormGroup>
    </>
  );
}
