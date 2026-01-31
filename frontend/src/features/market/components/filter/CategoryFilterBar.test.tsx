import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { darkTheme } from '@/features/common/styles/theme';
import CategoryFilterBar from './CategoryFilterBar';
import { CATEGORY_OPTIONS, type Category } from './constants';

const getCategoryColor = (category: Category) =>
  CATEGORY_OPTIONS.find((opt) => opt.value === category)!.color;

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={darkTheme}>{ui}</ThemeProvider>);
};

describe('CategoryFilterBar', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('모든 카테고리 버튼을 렌더링한다', () => {
      renderWithTheme(
        <CategoryFilterBar selected="all" onChange={mockOnChange} />,
      );

      CATEGORY_OPTIONS.forEach((option) => {
        expect(
          screen.getByTestId(`category-btn-${option.value}`),
        ).toHaveTextContent(option.label);
      });
    });

    it('컨테이너에 data-testid가 있다', () => {
      renderWithTheme(
        <CategoryFilterBar selected="all" onChange={mockOnChange} />,
      );

      expect(screen.getByTestId('category-filter-bar')).toBeInTheDocument();
    });
  });

  describe('선택 상태', () => {
    it('All이 선택되면 All 버튼이 해당 색상을 가진다', () => {
      renderWithTheme(
        <CategoryFilterBar selected="all" onChange={mockOnChange} />,
      );

      const allButton = screen.getByTestId('category-btn-all');
      expect(allButton).toHaveStyle({
        background: getCategoryColor('all'),
      });
    });

    it('DeFi가 선택되면 DeFi 버튼이 해당 색상을 가진다', () => {
      renderWithTheme(
        <CategoryFilterBar selected="defi" onChange={mockOnChange} />,
      );

      const defiButton = screen.getByTestId('category-btn-defi');
      expect(defiButton).toHaveStyle({
        background: getCategoryColor('defi'),
      });
    });
  });

  describe('클릭 동작', () => {
    it.each(CATEGORY_OPTIONS.map((opt) => [opt.label, opt.value] as const))(
      '%s 버튼 클릭 시 onChange가 %s와 함께 호출된다',
      (_, category) => {
        renderWithTheme(
          <CategoryFilterBar selected="all" onChange={mockOnChange} />,
        );

        fireEvent.click(screen.getByTestId(`category-btn-${category}`));

        expect(mockOnChange).toHaveBeenCalledWith(category);
        expect(mockOnChange).toHaveBeenCalledTimes(1);
      },
    );
  });

  describe('단일 선택', () => {
    it('한 번에 하나의 카테고리만 active 상태이다', () => {
      renderWithTheme(
        <CategoryFilterBar selected="meme" onChange={mockOnChange} />,
      );

      const memeButton = screen.getByTestId('category-btn-meme');
      const allButton = screen.getByTestId('category-btn-all');
      const defiButton = screen.getByTestId('category-btn-defi');

      expect(memeButton).toHaveStyle({
        background: getCategoryColor('meme'),
      });
      expect(allButton).toHaveStyle({
        background: darkTheme.colors.background.secondary,
      });
      expect(defiButton).toHaveStyle({
        background: darkTheme.colors.background.secondary,
      });
    });
  });
});
