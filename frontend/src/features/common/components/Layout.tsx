import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '@/features/common/styles';
import { useAuthStore, useUser } from '@/features/auth';
import ConfirmModal from './ConfirmModal';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  width: 100%;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: ${({ theme }) => theme.colors.background.primary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  backdrop-filter: blur(8px);
`;

const HeaderInner = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.sm} 4vw;
  }
`;

const Logo = styled(Link)`
  font-size: ${({ theme }) => theme.fonts.size.xl};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: ${({ theme }) => theme.fonts.size.md};
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  flex-shrink: 1;
  min-width: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary.main : theme.colors.text.secondary};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.background.secondary : 'transparent'};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
    background-color: ${({ theme }) => theme.colors.background.secondary};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
    font-size: ${({ theme }) => theme.fonts.size.xs};
  }
`;

const ThemeToggle = styled.button`
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
    background-color: ${({ theme }) => theme.colors.background.secondary};
  }
`;

const AuthSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-left: ${({ theme }) => theme.spacing.md};
  padding-left: ${({ theme }) => theme.spacing.md};
  border-left: 1px solid ${({ theme }) => theme.colors.border.primary};
  flex-shrink: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    margin-left: ${({ theme }) => theme.spacing.sm};
    padding-left: ${({ theme }) => theme.spacing.sm};
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

const LoginButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.text.inverse};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
    font-size: ${({ theme }) => theme.fonts.size.xs};
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.text.secondary};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: ${({ theme }) => theme.fonts.size.xs};
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

const UserName = styled.span`
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    display: none;
  }
`;

const ProfileImage = styled.img`
  width: 24px;
  height: 24px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  object-fit: cover;
`;

const LogoutButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.text.tertiary};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.market.down};
    background-color: ${({ theme }) => theme.colors.background.secondary};
  }
`;

const Main = styled.main`
  flex: 1;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.lg} 4vw;
  }
`;

const Footer = styled.footer`
  border-top: 1px solid ${({ theme }) => theme.colors.border.primary};
  background-color: ${({ theme }) => theme.colors.background.secondary};
`;

const FooterInner = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: ${({ theme }) => theme.fonts.size.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.md} 4vw;
  }
`;

export default function Layout() {
  const location = useLocation();
  const { toggleTheme, isDark } = useTheme();
  const { isAuthenticated, user, logout, initializeAuth } = useAuthStore();
  const { data: userData } = useUser();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/market', label: 'Market' },
    { path: '/backtest', label: 'Backtest' },
  ];

  const handleLogin = () => {
    sessionStorage.setItem('returnUrl', location.pathname);
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/login/github`;
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  const displayUser = userData || user;

  return (
    <Container>
      <Header>
        <HeaderInner>
          <Logo to="/">Crypto Insight</Logo>
          <Nav>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                $active={location.pathname === item.path}
              >
                {item.label}
              </NavLink>
            ))}
            <ThemeToggle onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? '☀️' : '🌙'}
            </ThemeToggle>
            <AuthSection>
              {isAuthenticated ? (
                <>
                  <UserInfo>
                    {displayUser?.profileImage && (
                      <ProfileImage
                        src={displayUser.profileImage}
                        alt={displayUser.nickname}
                      />
                    )}
                    <UserName>
                      {displayUser?.nickname || displayUser?.email}
                    </UserName>
                  </UserInfo>
                  <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
                </>
              ) : (
                <LoginButton onClick={handleLogin}>
                  <GitHubIcon />
                  Login
                </LoginButton>
              )}
            </AuthSection>
          </Nav>
        </HeaderInner>
      </Header>
      <Main>
        <Outlet />
      </Main>
      <Footer>
        <FooterInner>
          Crypto Market Insight - Data-driven crypto analysis
        </FooterInner>
      </Footer>
      <ConfirmModal
        isOpen={showLogoutModal}
        title="로그아웃"
        message="로그아웃 하시겠습니까?"
        confirmText="로그아웃"
        cancelText="취소"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </Container>
  );
}

function GitHubIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
