import styled from 'styled-components';
import type { Timeframe } from '../../services';

const Container = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const TimeframeButton = styled.button<{ $isActive: boolean }>`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  background: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primary.main : theme.colors.background.secondary};
  color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.text.inverse : theme.colors.text.primary};
  border: 1px solid
    ${({ theme, $isActive }) =>
      $isActive ? theme.colors.primary.main : theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, $isActive }) =>
      $isActive ? theme.colors.primary.dark : theme.colors.background.tertiary};
  }
`;

const TIMEFRAME_OPTIONS: { value: Timeframe; label: string }[] = [
  { value: '1h', label: '1H' },
  { value: '4h', label: '4H' },
  { value: '1d', label: '1D' },
];

interface Props {
  value: Timeframe;
  onChange: (timeframe: Timeframe) => void;
}

export default function TimeframeSelector({ value, onChange }: Props) {
  return (
    <Container>
      {TIMEFRAME_OPTIONS.map((option) => (
        <TimeframeButton
          key={option.value}
          $isActive={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </TimeframeButton>
      ))}
    </Container>
  );
}
