import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';

interface NavItem {
  readonly path: string;
  readonly label: string;
}

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: readonly NavItem[];
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`;

const slideOut = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
`;

const Overlay = styled.div<{ $isClosing: boolean }>`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 200;
  animation: ${({ $isClosing }) =>
    $isClosing
      ? css`
          ${fadeOut} 200ms ease-in-out forwards
        `
      : css`
          ${fadeIn} 150ms ease-in-out
        `};
`;

const Drawer = styled.aside<{ $isClosing: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 280px;
  max-width: 80vw;
  background-color: ${({ theme }) => theme.colors.background.primary};
  z-index: 201;
  display: flex;
  flex-direction: column;
  animation: ${({ $isClosing }) =>
    $isClosing
      ? css`
          ${slideOut} 200ms ease-in-out forwards
        `
      : css`
          ${slideIn} 250ms ease-in-out
        `};
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

const DrawerLogo = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.lg};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.background.secondary};
  }
`;

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.md};
  gap: ${({ theme }) => theme.spacing.xs};
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fonts.size.md};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary.main : theme.colors.text.secondary};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.background.secondary : 'transparent'};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
    background-color: ${({ theme }) => theme.colors.background.secondary};
  }
`;

export default function MobileDrawer({
  isOpen,
  onClose,
  navItems,
}: MobileDrawerProps) {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
    } else if (isVisible) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
        document.body.style.overflow = '';
      }, 200);
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isVisible]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isVisible) return null;

  return (
    <>
      <Overlay
        $isClosing={isClosing}
        onClick={onClose}
        data-testid="drawer-overlay"
      />
      <Drawer $isClosing={isClosing} data-testid="mobile-drawer">
        <DrawerHeader>
          <DrawerLogo>Crypto Insight</DrawerLogo>
          <CloseButton
            onClick={onClose}
            aria-label="Close menu"
            data-testid="drawer-close"
          >
            <CloseIcon />
          </CloseButton>
        </DrawerHeader>
        <NavList>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              $active={location.pathname === item.path}
              onClick={onClose}
              data-testid={`drawer-nav-${item.label.toLowerCase()}`}
            >
              {item.label}
            </NavLink>
          ))}
        </NavList>
      </Drawer>
    </>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
