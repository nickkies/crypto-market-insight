import { useMemo } from 'react';
import styled from 'styled-components';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { useOhlcv } from '@/features/market/hooks';
import { MARKET_COLORS, getGlassTooltipStyle } from '@/styles/marketColors';
import { useTheme } from '@/styles';
import { formatPrice, formatChartDate } from '@/utils';
import { ChartSkeleton } from '@/features/common/components';

export function BtcMiniChart() {
  const { data, isLoading, isError } = useOhlcv({ coinId: 'bitcoin' });
  const { isDark } = useTheme();
  const tooltipStyle = getGlassTooltipStyle(isDark);

  const chartData = useMemo(() => {
    if (!data?.data) return [];
    return data.data.slice(-24);
  }, [data]);

  const priceChange = useMemo(() => {
    if (chartData.length < 2) return 0;
    const first = chartData[0].close;
    const last = chartData[chartData.length - 1].close;
    return ((last - first) / first) * 100;
  }, [chartData]);

  const isPositive = priceChange >= 0;
  const lineColor = isPositive ? MARKET_COLORS.up : MARKET_COLORS.down;

  const option: EChartsOption = useMemo(
    () => ({
      tooltip: {
        trigger: 'axis',
        ...tooltipStyle,
        formatter: (params: unknown) => {
          const param = (params as { data: number; axisValue: string }[])[0];
          if (!param) return '';
          const dateStr = formatChartDate(Number(param.axisValue));
          return `
            <div style="font-size: 12px; line-height: 1.6;">
              <div style="font-weight: 600; margin-bottom: 4px;">${dateStr}</div>
              <div style="display: flex; justify-content: space-between; gap: 16px;">
                <span style="opacity: 0.7;">Price</span>
                <span style="font-weight: 500;">$${formatPrice(param.data)}</span>
              </div>
            </div>
          `;
        },
      },
      grid: {
        left: '0',
        right: '0',
        top: '10%',
        bottom: '10%',
      },
      xAxis: {
        type: 'category',
        data: chartData.map((d) => d.timestamp),
        show: false,
      },
      yAxis: {
        type: 'value',
        scale: true,
        show: false,
      },
      series: [
        {
          type: 'line',
          data: chartData.map((d) => d.close),
          smooth: true,
          symbol: 'none',
          lineStyle: {
            color: lineColor,
            width: 2,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: `${lineColor}40` },
                { offset: 1, color: `${lineColor}05` },
              ],
            },
          },
        },
      ],
    }),
    [chartData, lineColor, tooltipStyle],
  );

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (isError || chartData.length === 0) {
    return (
      <ErrorContainer>
        <ErrorText>차트를 불러올 수 없습니다</ErrorText>
      </ErrorContainer>
    );
  }

  const currentPrice = chartData[chartData.length - 1]?.close ?? 0;

  return (
    <Container data-testid="btc-mini-chart">
      <Header>
        <PriceInfo>
          <CurrentPrice>${formatPrice(currentPrice)}</CurrentPrice>
          <PriceChange $positive={isPositive}>
            {isPositive ? '+' : ''}
            {priceChange.toFixed(2)}%
          </PriceChange>
        </PriceInfo>
        <TimeLabel>24h</TimeLabel>
      </Header>
      <ChartWrapper>
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </ChartWrapper>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const PriceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const CurrentPrice = styled.span`
  font-size: ${({ theme }) => theme.fonts.size['2xl']};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.family.mono};
`;

const PriceChange = styled.span<{ $positive: boolean }>`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme, $positive }) =>
    $positive ? theme.colors.market.up : theme.colors.market.down};
  font-family: ${({ theme }) => theme.fonts.family.mono};
`;

const TimeLabel = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.text.tertiary};
  background: ${({ theme }) => theme.colors.background.tertiary};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const ChartWrapper = styled.div`
  flex: 1;
  min-height: 150px;
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
`;

const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: ${({ theme }) => theme.fonts.size.sm};
`;
