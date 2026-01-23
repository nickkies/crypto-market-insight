import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@/features/common/styles';
import { NAV_ITEMS } from '@/features/common/constants';
import MobileDrawer from './MobileDrawer';

const renderMobileDrawer = (props = {}) => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    navItems: NAV_ITEMS,
    ...props,
  };

  return {
    ...render(
      <MemoryRouter initialEntries={['/']}>
        <ThemeProvider>
          <MobileDrawer {...defaultProps} />
        </ThemeProvider>
      </MemoryRouter>,
    ),
    onClose: defaultProps.onClose,
  };
};

describe('MobileDrawer', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  it('isOpen이 true일 때 드로어가 렌더링된다', () => {
    renderMobileDrawer({ isOpen: true });

    expect(screen.getByTestId('mobile-drawer')).toBeInTheDocument();
    expect(screen.getByTestId('drawer-overlay')).toBeInTheDocument();
  });

  it('isOpen이 false일 때 드로어가 렌더링되지 않는다', () => {
    renderMobileDrawer({ isOpen: false });

    expect(screen.queryByTestId('mobile-drawer')).not.toBeInTheDocument();
    expect(screen.queryByTestId('drawer-overlay')).not.toBeInTheDocument();
  });

  it('네비게이션 아이템들이 렌더링된다', () => {
    renderMobileDrawer();

    expect(screen.getByTestId('drawer-nav-home')).toBeInTheDocument();
    expect(screen.getByTestId('drawer-nav-market')).toBeInTheDocument();
    expect(screen.getByTestId('drawer-nav-backtest')).toBeInTheDocument();
  });

  it('로고가 표시된다', () => {
    renderMobileDrawer();

    expect(screen.getByText('Crypto Insight')).toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 onClose가 호출된다', async () => {
    const { onClose } = renderMobileDrawer();

    const closeButton = screen.getByTestId('drawer-close');
    await userEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('오버레이 클릭 시 onClose가 호출된다', async () => {
    const { onClose } = renderMobileDrawer();

    const overlay = screen.getByTestId('drawer-overlay');
    await userEvent.click(overlay);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('네비게이션 링크 클릭 시 onClose가 호출된다', async () => {
    const { onClose } = renderMobileDrawer();

    const marketLink = screen.getByTestId('drawer-nav-market');
    await userEvent.click(marketLink);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Escape 키 누르면 onClose가 호출된다', () => {
    const { onClose } = renderMobileDrawer();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('드로어가 열릴 때 body overflow가 hidden으로 설정된다', () => {
    renderMobileDrawer({ isOpen: true });

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('현재 페이지에 해당하는 링크가 활성화 스타일을 가진다', () => {
    render(
      <MemoryRouter initialEntries={['/market']}>
        <ThemeProvider>
          <MobileDrawer isOpen={true} onClose={vi.fn()} navItems={NAV_ITEMS} />
        </ThemeProvider>
      </MemoryRouter>,
    );

    const marketLink = screen.getByTestId('drawer-nav-market');
    expect(marketLink).toHaveAttribute('href', '/market');
  });
});
