import styled from 'styled-components';
import { TextSkeleton } from '@/features/common/components';
import type {
  IndicatorResponseDto,
  RsiStatus,
  MacdStatus,
} from '../../services';
import { formatPrice } from '@/utils';

interface Props {
  data: IndicatorResponseDto | undefined;
  isLoading: boolean;
  isError?: boolean;
}

export default function TechnicalIndicatorsCard({
  data,
  isLoading,
  isError,
}: Props) {
  // 로딩 중이거나 에러 시 스켈레톤 표시
  const showSkeleton = isLoading || isError;

  return (
    <Card data-testid="technical-indicators-card">
      <CardTitle>Technical Indicators</CardTitle>
      <IndicatorGrid>
        <IndicatorSection>
          <SectionTitle>RSI (14)</SectionTitle>
          {showSkeleton ? (
            <TextSkeleton width="80%" />
          ) : (
            <RsiContent rsi={data?.rsi} />
          )}
        </IndicatorSection>

        <IndicatorSection>
          <SectionTitle>MACD</SectionTitle>
          {showSkeleton ? (
            <TextSkeleton width="70%" />
          ) : (
            <MacdContent macd={data?.macd} />
          )}
        </IndicatorSection>

        <IndicatorSection>
          <SectionTitle>Moving Averages</SectionTitle>
          {showSkeleton ? (
            <TextSkeleton width="90%" />
          ) : (
            <MaContent ma={data?.ma} />
          )}
        </IndicatorSection>

        <IndicatorSection>
          <SectionTitle>Bollinger Bands</SectionTitle>
          {showSkeleton ? (
            <TextSkeleton width="85%" />
          ) : (
            <BbContent bb={data?.bollingerBands} />
          )}
        </IndicatorSection>
      </IndicatorGrid>
    </Card>
  );
}

function RsiContent({ rsi }: { rsi: IndicatorResponseDto['rsi'] | undefined }) {
  if (!rsi?.value) return <NoData>-</NoData>;

  return (
    <RsiWrapper>
      <RsiValue>{rsi.value.toFixed(2)}</RsiValue>
      <StatusBadge $status={rsi.status}>
        {getStatusLabel(rsi.status)}
      </StatusBadge>
    </RsiWrapper>
  );
}

function MacdContent({
  macd,
}: {
  macd: IndicatorResponseDto['macd'] | undefined;
}) {
  if (!macd?.macd) return <NoData>-</NoData>;

  return (
    <MacdWrapper>
      <MacdRow>
        <MacdLabel>MACD</MacdLabel>
        <MacdValue $positive={macd.macd >= 0}>{macd.macd.toFixed(2)}</MacdValue>
      </MacdRow>
      <MacdRow>
        <MacdLabel>Signal</MacdLabel>
        <MacdValue $positive={macd.signal ? macd.signal >= 0 : false}>
          {macd.signal?.toFixed(2) ?? '-'}
        </MacdValue>
      </MacdRow>
      <MacdRow>
        <MacdLabel>Histogram</MacdLabel>
        <MacdValue $positive={macd.histogram ? macd.histogram >= 0 : false}>
          {macd.histogram?.toFixed(2) ?? '-'}
        </MacdValue>
      </MacdRow>
      <MacdStatusBadge $status={macd.status}>
        {macd.status === 'BULLISH' ? 'Bullish' : 'Bearish'}
      </MacdStatusBadge>
    </MacdWrapper>
  );
}

function MaContent({ ma }: { ma: IndicatorResponseDto['ma'] | undefined }) {
  if (!ma?.ma20 && !ma?.ma50) return <NoData>-</NoData>;

  return (
    <MaWrapper>
      <MaRow>
        <MaLabel>MA(20)</MaLabel>
        <MaValue>${ma?.ma20 ? formatPrice(ma.ma20) : '-'}</MaValue>
      </MaRow>
      <MaRow>
        <MaLabel>MA(50)</MaLabel>
        <MaValue>${ma?.ma50 ? formatPrice(ma.ma50) : '-'}</MaValue>
      </MaRow>
    </MaWrapper>
  );
}

function BbContent({
  bb,
}: {
  bb: IndicatorResponseDto['bollingerBands'] | undefined;
}) {
  if (!bb?.middle) return <NoData>-</NoData>;

  return (
    <BbWrapper>
      <BbRow>
        <BbLabel>Upper</BbLabel>
        <BbValue>${bb?.upper ? formatPrice(bb.upper) : '-'}</BbValue>
      </BbRow>
      <BbRow>
        <BbLabel>Middle</BbLabel>
        <BbValue>${bb?.middle ? formatPrice(bb.middle) : '-'}</BbValue>
      </BbRow>
      <BbRow>
        <BbLabel>Lower</BbLabel>
        <BbValue>${bb?.lower ? formatPrice(bb.lower) : '-'}</BbValue>
      </BbRow>
    </BbWrapper>
  );
}

function getStatusLabel(status: RsiStatus | null): string {
  switch (status) {
    case 'OVERBOUGHT':
      return 'Overbought';
    case 'OVERSOLD':
      return 'Oversold';
    default:
      return 'Neutral';
  }
}

// Styled Components
const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.fonts.size.md};
  font-weight: ${({ theme }) => theme.fonts.weight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const IndicatorGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const IndicatorSection = styled.div`
  background-color: ${({ theme }) => theme.colors.background.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
`;

const SectionTitle = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const NoData = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.md};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

// RSI Styles
const RsiWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const RsiValue = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.xl};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.family.mono};
`;

const StatusBadge = styled.span<{ $status: RsiStatus | null }>`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background-color: ${({ theme, $status }) => {
    switch ($status) {
      case 'OVERBOUGHT':
        return theme.colors.market.down + '20';
      case 'OVERSOLD':
        return theme.colors.market.up + '20';
      default:
        return theme.colors.background.secondary;
    }
  }};
  color: ${({ theme, $status }) => {
    switch ($status) {
      case 'OVERBOUGHT':
        return theme.colors.market.down;
      case 'OVERSOLD':
        return theme.colors.market.up;
      default:
        return theme.colors.text.secondary;
    }
  }};
`;

// MACD Styles
const MacdWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const MacdRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MacdLabel = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const MacdValue = styled.span<{ $positive: boolean }>`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme, $positive }) =>
    $positive ? theme.colors.market.up : theme.colors.market.down};
  font-family: ${({ theme }) => theme.fonts.family.mono};
`;

const MacdStatusBadge = styled.span<{ $status: MacdStatus | null }>`
  align-self: flex-start;
  font-size: ${({ theme }) => theme.fonts.size.xs};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  margin-top: ${({ theme }) => theme.spacing.xs};
  background-color: ${({ theme, $status }) =>
    $status === 'BULLISH'
      ? theme.colors.market.up + '20'
      : theme.colors.market.down + '20'};
  color: ${({ theme, $status }) =>
    $status === 'BULLISH' ? theme.colors.market.up : theme.colors.market.down};
`;

// MA Styles
const MaWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const MaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MaLabel = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const MaValue = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.family.mono};
`;

// Bollinger Bands Styles
const BbWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const BbRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BbLabel = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const BbValue = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.family.mono};
`;
