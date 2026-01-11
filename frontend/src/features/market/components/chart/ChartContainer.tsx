import { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import CandlestickChart from './CandlestickChart';
import VolumeChart from './VolumeChart';
import RsiPanel from './RsiPanel';
import MacdPanel from './MacdPanel';
import { ChartSkeleton, ErrorState } from '@/features/common/components';
import type { OhlcvDataDto } from '../../services';
import type { IndicatorType } from '../../stores/useMarketStore';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ChartBox = styled.div<{ $height: string }>`
  width: 100%;
  height: ${({ $height }) => $height};
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 100%;
`;

interface Props {
  data: OhlcvDataDto[] | undefined;
  isLoading: boolean;
  isError: boolean;
  errorStatus?: number;
  cooldown?: number;
  onRetry?: () => void;
  selectedIndicators?: IndicatorType[];
}

export default function ChartContainer({
  data,
  isLoading,
  isError,
  errorStatus,
  cooldown = 0,
  onRetry,
  selectedIndicators = [],
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const hasVolume = data?.some((d) => d.volume !== null) ?? false;

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (isError) {
    const errorMessage =
      errorStatus === 429
        ? 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
        : '차트를 불러올 수 없습니다. 데이터를 가져오는 중 오류가 발생했습니다.';

    return (
      <ChartBox $height="100%">
        <ErrorState
          message={errorMessage}
          onRetry={onRetry}
          cooldown={cooldown}
        />
      </ChartBox>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartBox $height="100%">
        <ErrorState message="차트 데이터가 없습니다. 해당 기간의 데이터가 존재하지 않습니다." />
      </ChartBox>
    );
  }

  // 차트 높이 계산: 캔들 35%, 거래량 15%, RSI 25%, MACD 25%
  return (
    <Container ref={containerRef}>
      <ChartBox $height={hasVolume ? '35%' : '40%'}>
        <ChartWrapper>
          <CandlestickChart
            data={data}
            selectedIndicators={selectedIndicators}
          />
        </ChartWrapper>
      </ChartBox>
      {hasVolume && (
        <ChartBox $height="15%">
          <ChartWrapper>
            <VolumeChart data={data} />
          </ChartWrapper>
        </ChartBox>
      )}
      <ChartBox $height="25%">
        <ChartWrapper>
          <RsiPanel data={data} />
        </ChartWrapper>
      </ChartBox>
      <ChartBox $height="25%">
        <ChartWrapper>
          <MacdPanel data={data} />
        </ChartWrapper>
      </ChartBox>
    </Container>
  );
}
