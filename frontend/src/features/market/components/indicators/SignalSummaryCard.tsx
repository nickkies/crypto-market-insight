import styled from 'styled-components';
import { TableRowsSkeleton, ErrorState } from '@/features/common/components';
import type { IndicatorResponseDto } from '../../services';

interface Props {
  data: IndicatorResponseDto | undefined;
  isLoading: boolean;
  currentPrice?: number;
  isError?: boolean;
  onRetry?: () => void;
  cooldown?: number;
}

type SignalType = 'BUY' | 'SELL' | 'NEUTRAL';
type SignalStrength = 'STRONG' | 'MODERATE' | 'WEAK';

interface Signal {
  type: SignalType;
  reason: string;
  weight: number;
}

export default function SignalSummaryCard({
  data,
  isLoading,
  currentPrice,
  isError,
  onRetry,
  cooldown = 0,
}: Props) {
  if (isError) {
    return (
      <Card>
        <CardTitle>Signal Summary</CardTitle>
        <ErrorState
          message="시그널 요약을 불러오는 중 오류가 발생했습니다."
          onRetry={onRetry}
          cooldown={cooldown}
        />
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardTitle>Signal Summary</CardTitle>
        <TableRowsSkeleton rows={4} />
      </Card>
    );
  }

  const signals = analyzeSignals(data, currentPrice);
  const { overallSignal, strength } = calculateOverallSignal(signals);

  return (
    <Card>
      <CardTitle>Signal Summary</CardTitle>

      <OverallSignalSection>
        <SignalBadge $signal={overallSignal}>
          {getSignalLabel(overallSignal)}
        </SignalBadge>
        <StrengthBadge $strength={strength}>
          {getStrengthLabel(strength)}
        </StrengthBadge>
      </OverallSignalSection>

      <SignalList>
        {signals.length === 0 ? (
          <NoSignals>No signals available</NoSignals>
        ) : (
          signals.map((signal, index) => (
            <SignalItem key={index}>
              <SignalIndicator $type={signal.type} />
              <SignalReason>{signal.reason}</SignalReason>
            </SignalItem>
          ))
        )}
      </SignalList>
    </Card>
  );
}

function analyzeSignals(
  data: IndicatorResponseDto | undefined,
  currentPrice?: number,
): Signal[] {
  if (!data) return [];

  const signals: Signal[] = [];

  // RSI Signals
  if (data.rsi?.status === 'OVERSOLD') {
    signals.push({ type: 'BUY', reason: 'RSI in oversold zone', weight: 2 });
  } else if (data.rsi?.status === 'OVERBOUGHT') {
    signals.push({ type: 'SELL', reason: 'RSI in overbought zone', weight: 2 });
  }

  // MACD Signals
  if (data.macd?.status === 'BULLISH') {
    signals.push({ type: 'BUY', reason: 'MACD bullish crossover', weight: 2 });
  } else if (data.macd?.status === 'BEARISH') {
    signals.push({
      type: 'SELL',
      reason: 'MACD bearish crossover',
      weight: 2,
    });
  }

  // MACD Histogram momentum
  if (data.macd?.histogram) {
    if (data.macd.histogram > 0) {
      signals.push({
        type: 'BUY',
        reason: 'Positive MACD histogram',
        weight: 1,
      });
    } else if (data.macd.histogram < 0) {
      signals.push({
        type: 'SELL',
        reason: 'Negative MACD histogram',
        weight: 1,
      });
    }
  }

  // MA Signals
  if (data.ma?.ma20 && data.ma?.ma50) {
    if (data.ma.ma20 > data.ma.ma50) {
      signals.push({
        type: 'BUY',
        reason: 'MA(20) above MA(50)',
        weight: 1,
      });
    } else if (data.ma.ma20 < data.ma.ma50) {
      signals.push({
        type: 'SELL',
        reason: 'MA(20) below MA(50)',
        weight: 1,
      });
    }
  }

  // Bollinger Bands Signals
  if (
    currentPrice &&
    data.bollingerBands?.lower &&
    data.bollingerBands?.upper
  ) {
    if (currentPrice < data.bollingerBands.lower) {
      signals.push({
        type: 'BUY',
        reason: 'Price below lower BB',
        weight: 2,
      });
    } else if (currentPrice > data.bollingerBands.upper) {
      signals.push({
        type: 'SELL',
        reason: 'Price above upper BB',
        weight: 2,
      });
    }
  }

  return signals;
}

function calculateOverallSignal(signals: Signal[]): {
  overallSignal: SignalType;
  strength: SignalStrength;
} {
  if (signals.length === 0) {
    return { overallSignal: 'NEUTRAL', strength: 'WEAK' };
  }

  let buyWeight = 0;
  let sellWeight = 0;

  signals.forEach((signal) => {
    if (signal.type === 'BUY') {
      buyWeight += signal.weight;
    } else if (signal.type === 'SELL') {
      sellWeight += signal.weight;
    }
  });

  const totalWeight = buyWeight + sellWeight;
  const diff = Math.abs(buyWeight - sellWeight);

  let overallSignal: SignalType;
  if (buyWeight > sellWeight) {
    overallSignal = 'BUY';
  } else if (sellWeight > buyWeight) {
    overallSignal = 'SELL';
  } else {
    overallSignal = 'NEUTRAL';
  }

  let strength: SignalStrength;
  if (totalWeight === 0 || diff === 0) {
    strength = 'WEAK';
  } else if (diff >= 4) {
    strength = 'STRONG';
  } else if (diff >= 2) {
    strength = 'MODERATE';
  } else {
    strength = 'WEAK';
  }

  return { overallSignal, strength };
}

function getSignalLabel(signal: SignalType): string {
  switch (signal) {
    case 'BUY':
      return 'Buy';
    case 'SELL':
      return 'Sell';
    default:
      return 'Neutral';
  }
}

function getStrengthLabel(strength: SignalStrength): string {
  switch (strength) {
    case 'STRONG':
      return 'Strong';
    case 'MODERATE':
      return 'Moderate';
    default:
      return 'Weak';
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

const OverallSignalSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

const SignalBadge = styled.span<{ $signal: SignalType }>`
  font-size: ${({ theme }) => theme.fonts.size.lg};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme, $signal }) => {
    switch ($signal) {
      case 'BUY':
        return theme.colors.market.up + '20';
      case 'SELL':
        return theme.colors.market.down + '20';
      default:
        return theme.colors.background.tertiary;
    }
  }};
  color: ${({ theme, $signal }) => {
    switch ($signal) {
      case 'BUY':
        return theme.colors.market.up;
      case 'SELL':
        return theme.colors.market.down;
      default:
        return theme.colors.text.secondary;
    }
  }};
`;

const StrengthBadge = styled.span<{ $strength: SignalStrength }>`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background-color: ${({ theme }) => theme.colors.background.tertiary};
  color: ${({ theme, $strength }) => {
    switch ($strength) {
      case 'STRONG':
        return theme.colors.primary.main;
      case 'MODERATE':
        return theme.colors.warning;
      default:
        return theme.colors.text.tertiary;
    }
  }};
`;

const SignalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SignalItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.background.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const SignalIndicator = styled.div<{ $type: SignalType }>`
  width: 8px;
  height: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background-color: ${({ theme, $type }) => {
    switch ($type) {
      case 'BUY':
        return theme.colors.market.up;
      case 'SELL':
        return theme.colors.market.down;
      default:
        return theme.colors.text.tertiary;
    }
  }};
`;

const SignalReason = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const NoSignals = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md};
`;
