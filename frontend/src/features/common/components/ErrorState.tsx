import { useState, useEffect } from 'react';
import styled from 'styled-components';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  cooldown?: number;
}

export default function ErrorState({
  message = '데이터를 불러오는 중 오류가 발생했습니다.',
  onRetry,
  cooldown = 0,
}: ErrorStateProps) {
  const [countdown, setCountdown] = useState(cooldown);

  // cooldown이 변경되면 카운트다운 시작
  useEffect(() => {
    setCountdown(cooldown);
  }, [cooldown]);

  // 카운트다운 타이머
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleRetry = () => {
    if (countdown > 0) return;
    onRetry?.();
  };

  return (
    <Container data-testid="error-state">
      <Icon>⚠️</Icon>
      <Message>{message}</Message>
      {onRetry && (
        <RetryButton
          onClick={handleRetry}
          disabled={countdown > 0}
          data-testid="retry-button"
        >
          {countdown > 0 ? `다시 시도 (${countdown}초)` : '다시 시도'}
        </RetryButton>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing['2xl']};
  text-align: center;
`;

const Icon = styled.span`
  font-size: 3rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Message = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const RetryButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.text.inverse};
  background-color: ${({ theme }) => theme.colors.primary.main};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primary.dark};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
