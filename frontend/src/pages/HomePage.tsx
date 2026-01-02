import styled from 'styled-components';
import { Link } from 'react-router-dom';
import {
  CardSkeleton,
  ChartSkeleton,
  TableRowsSkeleton,
} from '@/features/common/components';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const HeroSection = styled.section`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['2xl']} 0;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fonts.size['3xl']};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fonts.size['2xl']};
  }
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: 600px;
  margin: 0 auto ${({ theme }) => theme.spacing.lg};
  line-height: 1.6;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: ${({ theme }) => theme.colors.text.inverse};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.dark};
    color: ${({ theme }) => theme.colors.text.inverse};
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fonts.size.xl};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ViewAllLink = styled(Link)`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.primary.main};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export function HomePage() {
  return (
    <PageContainer data-testid="home-page">
      <HeroSection>
        <Title>Crypto Market Insight</Title>
        <Subtitle>
          체인/생태계 관점의 코인 분류, 기술적 지표 분석, 전략 백테스트를 통해
          데이터 기반 투자 의사결정을 지원합니다.
        </Subtitle>
        <CTAButton to="/market">시장 분석 시작하기</CTAButton>
      </HeroSection>

      <Section>
        <SectionTitle>Market Overview</SectionTitle>
        <StatsGrid>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </StatsGrid>
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle>Price Trends</SectionTitle>
          <ViewAllLink to="/market">View All</ViewAllLink>
        </SectionHeader>
        <ChartGrid>
          <Card>
            <CardTitle>BTC/USDT</CardTitle>
            <ChartSkeleton />
          </Card>
          <Card>
            <CardTitle>Top Movers</CardTitle>
            <TableRowsSkeleton rows={6} />
          </Card>
        </ChartGrid>
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle>Ecosystem Overview</SectionTitle>
          <ViewAllLink to="/market">View All</ViewAllLink>
        </SectionHeader>
        <StatsGrid>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </StatsGrid>
      </Section>
    </PageContainer>
  );
}
