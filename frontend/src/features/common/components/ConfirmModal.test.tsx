import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@/styles';
import { ConfirmModal } from './ConfirmModal';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('ConfirmModal', () => {
  const defaultProps = {
    isOpen: true,
    title: '테스트 제목',
    message: '테스트 메시지입니다.',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('isOpen이 false면 렌더링하지 않는다', () => {
    renderWithTheme(<ConfirmModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
  });

  it('제목과 메시지를 표시한다', () => {
    renderWithTheme(<ConfirmModal {...defaultProps} />);

    expect(screen.getByText('테스트 제목')).toBeInTheDocument();
    expect(screen.getByText('테스트 메시지입니다.')).toBeInTheDocument();
  });

  it('확인 버튼 클릭 시 onConfirm을 호출한다', () => {
    const onConfirm = vi.fn();
    renderWithTheme(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByText('확인'));

    expect(onConfirm).toHaveBeenCalled();
  });

  it('취소 버튼 클릭 시 onCancel을 호출한다', () => {
    const onCancel = vi.fn();
    renderWithTheme(<ConfirmModal {...defaultProps} onCancel={onCancel} />);

    fireEvent.click(screen.getByText('취소'));

    expect(onCancel).toHaveBeenCalled();
  });

  it('오버레이 클릭 시 onCancel을 호출한다', () => {
    const onCancel = vi.fn();
    renderWithTheme(<ConfirmModal {...defaultProps} onCancel={onCancel} />);

    fireEvent.click(screen.getByTestId('confirm-modal-overlay'));

    expect(onCancel).toHaveBeenCalled();
  });

  it('Escape 키 입력 시 onCancel을 호출한다', () => {
    const onCancel = vi.fn();
    renderWithTheme(<ConfirmModal {...defaultProps} onCancel={onCancel} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalled();
  });

  it('커스텀 버튼 텍스트를 표시한다', () => {
    renderWithTheme(
      <ConfirmModal {...defaultProps} confirmText="삭제" cancelText="아니오" />,
    );

    expect(screen.getByText('삭제')).toBeInTheDocument();
    expect(screen.getByText('아니오')).toBeInTheDocument();
  });

  it('모달 클릭 시 이벤트 전파를 막는다', () => {
    const onCancel = vi.fn();
    renderWithTheme(<ConfirmModal {...defaultProps} onCancel={onCancel} />);

    fireEvent.click(screen.getByTestId('confirm-modal'));

    expect(onCancel).not.toHaveBeenCalled();
  });
});
