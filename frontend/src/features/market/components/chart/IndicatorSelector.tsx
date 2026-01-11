import styled from 'styled-components';
import {
  useMarketStore,
  type IndicatorType,
} from '../../stores/useMarketStore';

const INDICATORS: {
  type: IndicatorType;
  label: string;
  description: string;
}[] = [
  { type: 'MA', label: 'MA', description: '이동평균선 (20, 50)' },
  { type: 'BB', label: 'BB', description: '볼린저 밴드' },
];

export default function IndicatorSelector() {
  const selectedIndicators = useMarketStore(
    (state) => state.selectedIndicators,
  );
  const toggleIndicator = useMarketStore((state) => state.toggleIndicator);

  return (
    <Container>
      <Label>Indicators</Label>
      <CheckboxGroup>
        {INDICATORS.map(({ type, label, description }) => (
          <CheckboxItem
            key={type}
            $isSelected={selectedIndicators.includes(type)}
            onClick={() => toggleIndicator(type)}
            title={description}
          >
            <Checkbox
              type="checkbox"
              checked={selectedIndicators.includes(type)}
              onChange={() => toggleIndicator(type)}
            />
            <span>{label}</span>
          </CheckboxItem>
        ))}
      </CheckboxGroup>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Label = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const CheckboxGroup = styled.div`
  display: flex;
  gap: 4px;
`;

const CheckboxItem = styled.label<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  background: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.primary.main + '20' : 'transparent'};
  color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.primary.main : theme.colors.text.secondary};
  border: 1px solid
    ${({ $isSelected, theme }) =>
      $isSelected ? theme.colors.primary.main : theme.colors.border.primary};

  &:hover {
    background: ${({ theme }) => theme.colors.primary.main + '10'};
  }
`;

const Checkbox = styled.input`
  display: none;
`;
