import styled from 'styled-components';
import { useFormContext, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type { BacktestFormValues } from './BacktestForm';
import { useTheme } from '@/styles/ThemeProvider';

const Container = styled.div`
  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker {
    font-family: ${({ theme }) => theme.fonts.family.primary};
    background-color: ${({ theme }) => theme.colors.background.secondary};
    border: 1px solid ${({ theme }) => theme.colors.border.primary};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  .react-datepicker__header {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
    border-radius: ${({ theme }) => theme.borderRadius.lg}
      ${({ theme }) => theme.borderRadius.lg} 0 0;
    padding-top: ${({ theme }) => theme.spacing.md};
  }

  .react-datepicker__current-month,
  .react-datepicker__day-name {
    color: ${({ theme }) => theme.colors.text.primary};
  }

  .react-datepicker__day {
    color: ${({ theme }) => theme.colors.text.primary};
    border-radius: ${({ theme }) => theme.borderRadius.md};

    &:hover {
      background-color: ${({ theme }) => theme.colors.background.tertiary};
    }
  }

  .react-datepicker__day--selected,
  .react-datepicker__day--in-selecting-range,
  .react-datepicker__day--in-range {
    background-color: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.text.inverse};

    &:hover {
      background-color: ${({ theme }) => theme.colors.primary.dark};
    }
  }

  .react-datepicker__day--keyboard-selected {
    background-color: ${({ theme }) => theme.colors.primary.light};
  }

  .react-datepicker__day--outside-month {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  .react-datepicker__day--disabled {
    color: ${({ theme }) => theme.colors.text.tertiary};
    cursor: not-allowed;

    &:hover {
      background-color: transparent;
    }
  }

  .react-datepicker__navigation {
    top: ${({ theme }) => theme.spacing.md};
  }

  .react-datepicker__navigation-icon::before {
    border-color: ${({ theme }) => theme.colors.text.secondary};
    border-width: 2px 2px 0 0;
    height: 8px;
    width: 8px;
  }

  .react-datepicker__navigation:hover *::before {
    border-color: ${({ theme }) => theme.colors.text.primary};
  }

  .react-datepicker__month-container {
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

const DateInput = styled.input<{ $isDark?: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  transition: border-color ${({ theme }) => theme.transitions.fast};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

const ErrorMessage = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing.xs};
  display: block;
`;

export default function DateRangePicker() {
  const { isDark } = useTheme();
  const {
    control,
    formState: { errors },
  } = useFormContext<BacktestFormValues>();

  return (
    <Container>
      <Controller
        control={control}
        name="startDate"
        rules={{ required: 'Date range is required' }}
        render={({ field }) => (
          <Controller
            control={control}
            name="endDate"
            render={({ field: endField }) => (
              <DatePicker
                selectsRange
                startDate={field.value ? new Date(field.value) : null}
                endDate={endField.value ? new Date(endField.value) : null}
                onChange={(dates) => {
                  const [start, end] = dates as [Date | null, Date | null];
                  field.onChange(
                    start ? start.toISOString().split('T')[0] : '',
                  );
                  endField.onChange(end ? end.toISOString().split('T')[0] : '');
                }}
                maxDate={new Date()}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select date range"
                customInput={
                  <DateInput $isDark={isDark} data-testid="date-range-input" />
                }
                monthsShown={2}
                showPopperArrow={false}
              />
            )}
          />
        )}
      />
      {errors.startDate && (
        <ErrorMessage>{errors.startDate.message}</ErrorMessage>
      )}
    </Container>
  );
}
