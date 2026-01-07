import { Navigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuthStore } from '../stores';

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, token } = useAuthStore();

  // 토큰이 있지만 아직 인증 상태가 초기화되지 않은 경우 로딩 표시
  const storedToken = sessionStorage.getItem('token');
  if (storedToken && !token) {
    return <LoadingContainer>인증 확인 중...</LoadingContainer>;
  }

  if (!isAuthenticated) {
    // 현재 경로를 저장하고 로그인 유도
    sessionStorage.setItem('returnUrl', location.pathname);
    return <Navigate to="/" replace state={{ showLoginPrompt: true }} />;
  }

  return <>{children}</>;
}
