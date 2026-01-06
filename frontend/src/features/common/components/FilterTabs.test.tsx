import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/styles/ThemeProvider';
import { FilterTabs } from './FilterTabs';

const renderFilterTabs = (props = {}) => {
  const defaultProps = {
    activeTab: 'all' as const,
    onTabChange: vi.fn(),
    ...props,
  };
  return render(
    <ThemeProvider>
      <FilterTabs {...defaultProps} />
    </ThemeProvider>,
  );
};

describe('FilterTabs', () => {
  it('전체와 즐겨찾기 탭이 렌더링된다', () => {
    renderFilterTabs();
    expect(screen.getByTestId('filter-tab-all')).toBeInTheDocument();
    expect(screen.getByTestId('filter-tab-favorites')).toBeInTheDocument();
  });

  it('전체 탭 클릭 시 onTabChange가 "all"로 호출된다', async () => {
    const onTabChange = vi.fn();
    renderFilterTabs({ activeTab: 'favorites', onTabChange });

    await userEvent.click(screen.getByTestId('filter-tab-all'));

    expect(onTabChange).toHaveBeenCalledWith('all');
  });

  it('즐겨찾기 탭 클릭 시 onTabChange가 "favorites"로 호출된다', async () => {
    const onTabChange = vi.fn();
    renderFilterTabs({ activeTab: 'all', onTabChange });

    await userEvent.click(screen.getByTestId('filter-tab-favorites'));

    expect(onTabChange).toHaveBeenCalledWith('favorites');
  });

  it('activeTab에 따라 탭 텍스트가 올바르게 표시된다', () => {
    renderFilterTabs({ activeTab: 'all' });
    expect(screen.getByText('전체')).toBeInTheDocument();
    expect(screen.getByText('즐겨찾기')).toBeInTheDocument();
  });
});
