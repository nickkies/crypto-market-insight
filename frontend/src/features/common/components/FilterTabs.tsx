import styled from 'styled-components';

export type FilterTab = 'all' | 'favorites';

interface FilterTabsProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
}

export function FilterTabs({ activeTab, onTabChange }: FilterTabsProps) {
  return (
    <Container>
      <Tab
        $active={activeTab === 'all'}
        onClick={() => onTabChange('all')}
        data-testid="filter-tab-all"
      >
        전체
      </Tab>
      <Tab
        $active={activeTab === 'favorites'}
        onClick={() => onTabChange('favorites')}
        data-testid="filter-tab-favorites"
      >
        즐겨찾기
      </Tab>
    </Container>
  );
}

const Container = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.xs};
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  min-width: 72px;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.text.inverse : theme.colors.text.secondary};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary.main : 'transparent'};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  white-space: nowrap;
  text-align: center;

  &:hover {
    color: ${({ theme, $active }) =>
      $active ? theme.colors.text.inverse : theme.colors.text.primary};
    background-color: ${({ theme, $active }) =>
      $active ? theme.colors.primary.main : theme.colors.background.tertiary};
  }
`;
