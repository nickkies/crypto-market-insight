import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/styles/ThemeProvider';
import { SearchInput } from './SearchInput';

const renderSearchInput = (props = {}) => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    ...props,
  };
  return render(
    <ThemeProvider>
      <SearchInput {...defaultProps} />
    </ThemeProvider>,
  );
};

describe('SearchInput', () => {
  it('입력 필드가 렌더링된다', () => {
    renderSearchInput();
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('placeholder가 표시된다', () => {
    renderSearchInput({ placeholder: '코인 검색' });
    expect(screen.getByPlaceholderText('코인 검색')).toBeInTheDocument();
  });

  it('기본 placeholder는 "검색..."이다', () => {
    renderSearchInput();
    expect(screen.getByPlaceholderText('검색...')).toBeInTheDocument();
  });

  it('입력 시 onChange가 호출된다', async () => {
    const onChange = vi.fn();
    renderSearchInput({ onChange });

    const input = screen.getByTestId('search-input');
    await userEvent.type(input, 'bitcoin');

    expect(onChange).toHaveBeenCalledTimes(7); // 'bitcoin' = 7 characters
    expect(onChange).toHaveBeenLastCalledWith('bitcoin');
  });

  it('값이 있을 때 클리어 버튼이 표시된다', () => {
    renderSearchInput({ value: 'test' });

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(screen.getByTestId('search-clear-button')).toBeInTheDocument();
  });

  it('값이 없을 때 클리어 버튼이 표시되지 않는다', () => {
    renderSearchInput({ value: '' });
    expect(screen.queryByTestId('search-clear-button')).not.toBeInTheDocument();
  });

  it('클리어 버튼 클릭 시 값이 초기화된다', async () => {
    const onChange = vi.fn();
    renderSearchInput({ value: 'test', onChange });

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'test' } });

    const clearButton = screen.getByTestId('search-clear-button');
    await userEvent.click(clearButton);

    expect(onChange).toHaveBeenLastCalledWith('');
  });
});
