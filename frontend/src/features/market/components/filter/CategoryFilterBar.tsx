import styled from 'styled-components';
import { CATEGORY_OPTIONS, type Category } from './constants';

const Container = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  flex-wrap: wrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: 4px;
  }
`;

const CategoryButton = styled.button<{ $isActive: boolean; $color: string }>`
  min-width: 64px;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  background: ${({ $isActive, $color, theme }) =>
    $isActive ? $color : theme.colors.background.secondary};
  color: ${({ $isActive, theme }) =>
    $isActive ? '#ffffff' : theme.colors.text.secondary};
  border: 1px solid
    ${({ $isActive, $color, theme }) =>
      $isActive ? $color : theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  white-space: nowrap;

  &:hover {
    border-color: ${({ $color }) => $color};
    color: ${({ $isActive, $color }) => ($isActive ? '#ffffff' : $color)};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    min-width: 56px;
    padding: ${({ theme }) => `6px ${theme.spacing.sm}`};
    font-size: ${({ theme }) => theme.fonts.size.xs};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    min-width: 48px;
    padding: 4px 8px;
  }
`;

interface Props {
  selected: Category;
  onChange: (category: Category) => void;
}

export default function CategoryFilterBar({ selected, onChange }: Props) {
  return (
    <Container data-testid="category-filter-bar">
      {CATEGORY_OPTIONS.map((option) => (
        <CategoryButton
          key={option.value}
          $isActive={selected === option.value}
          $color={option.color}
          onClick={() => onChange(option.value)}
          data-testid={`category-btn-${option.value}`}
        >
          {option.label}
        </CategoryButton>
      ))}
    </Container>
  );
}
