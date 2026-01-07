import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAuthStore } from '@/features/auth';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid ${({ theme }) => theme.colors.border.primary};
  border-top-color: ${({ theme }) => theme.colors.primary.main};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const Message = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ErrorMessage = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.md};
  color: ${({ theme }) => theme.colors.market.down};
`;

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      navigate('/', { replace: true });
      return;
    }

    if (token) {
      setToken(token);

      const returnUrl = sessionStorage.getItem('returnUrl') || '/';
      sessionStorage.removeItem('returnUrl');

      navigate(returnUrl, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [searchParams, navigate, setToken]);

  const error = searchParams.get('error');

  return (
    <Container data-testid="oauth-callback-page">
      {error ? (
        <ErrorMessage>로그인 중 오류가 발생했습니다.</ErrorMessage>
      ) : (
        <>
          <Spinner />
          <Message>로그인 처리 중...</Message>
        </>
      )}
    </Container>
  );
}
