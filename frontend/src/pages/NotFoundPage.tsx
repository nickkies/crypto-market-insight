import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import styled from 'styled-components';

const LOTTIE_URL =
  'https://assets-v2.lottiefiles.com/a/c7a4fa7c-117a-11ee-95a6-3f1b25953583/TgXJGwLOiT.json';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
`;

const LottieWrapper = styled.div`
  width: 100%;
  max-width: 400px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fonts.size['3xl']};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const HomeLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: ${({ theme }) => theme.colors.text.inverse};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.dark};
    color: ${({ theme }) => theme.colors.text.inverse};
  }
`;

export function NotFoundPage() {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch(LOTTIE_URL)
      .then((res) => res.json())
      .then(setAnimationData)
      .catch(console.error);
  }, []);

  return (
    <Container data-testid="not-found-page">
      <LottieWrapper>
        {animationData && <Lottie animationData={animationData} loop />}
      </LottieWrapper>
      <Title>Page Not Found</Title>
      <Description>
        The page you're looking for doesn't exist or has been moved.
      </Description>
      <HomeLink to="/">Back to Home</HomeLink>
    </Container>
  );
}
