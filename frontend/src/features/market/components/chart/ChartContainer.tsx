import { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import CandlestickChart from './CandlestickChart';
import VolumeChart from './VolumeChart';
import RsiPanel from './RsiPanel';
import MacdPanel from './MacdPanel';
import { ChartSkeleton, ErrorState } from '@/features/common/components';
import type { OhlcvDataDto } from '../../services';
import type { IndicatorType } from '../../stores/useMarketStore';

// Desktop: 모든 차트 세로 배치
const DesktopContainer = styled.div`
  width: 100%;
  height: 100%;
  display: none;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: flex;
  }
`;

// Mobile/Tablet: 캐로셀 컨테이너
const CarouselContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }
`;

const CarouselTabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const CarouselTab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.primary.main : theme.colors.border.primary};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary.main : 'transparent'};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.text.inverse : theme.colors.text.secondary};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme, $active }) =>
      $active ? theme.colors.text.inverse : theme.colors.primary.main};
  }
`;

const CarouselSlide = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  min-height: 0;
`;

const ChartBox = styled.div<{ $height: string }>`
  width: 100%;
  height: ${({ $height }) => $height};
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: visible;
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
  const [activeSlide, setActiveSlide] = useState(0);

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

  return (
    <>
      {/* Desktop: 모든 차트 세로 배치 */}
      <DesktopContainer ref={containerRef}>
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
      </DesktopContainer>

      {/* Mobile/Tablet: 캐로셀 */}
      <CarouselContainer>
        <CarouselTabs>
          <CarouselTab
            $active={activeSlide === 0}
            onClick={() => setActiveSlide(0)}
          >
            Price
          </CarouselTab>
          <CarouselTab
            $active={activeSlide === 1}
            onClick={() => setActiveSlide(1)}
          >
            Indicators
          </CarouselTab>
        </CarouselTabs>

        {activeSlide === 0 ? (
          <CarouselSlide>
            <ChartBox $height={hasVolume ? '70%' : '100%'}>
              <ChartWrapper>
                <CandlestickChart
                  data={data}
                  selectedIndicators={selectedIndicators}
                />
              </ChartWrapper>
            </ChartBox>
            {hasVolume && (
              <ChartBox $height="30%">
                <ChartWrapper>
                  <VolumeChart data={data} />
                </ChartWrapper>
              </ChartBox>
            )}
          </CarouselSlide>
        ) : (
          <CarouselSlide>
            <ChartBox $height="50%">
              <ChartWrapper>
                <RsiPanel data={data} />
              </ChartWrapper>
            </ChartBox>
            <ChartBox $height="50%">
              <ChartWrapper>
                <MacdPanel data={data} />
              </ChartWrapper>
            </ChartBox>
          </CarouselSlide>
        )}
      </CarouselContainer>
    </>
  );
}
