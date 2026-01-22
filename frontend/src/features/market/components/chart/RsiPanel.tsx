import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import {
  CHART_COLORS,
  getGlassTooltipStyle,
} from '@/features/common/styles/marketColors';
import { useTheme } from '@/features/common/styles';
import type { OhlcvDataDto } from '../../services';
import { formatChartDate } from '@/utils';

function calculateRSI(data: number[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(null);
      continue;
    }

    const change = data[i] - data[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);

    if (i < period) {
      result.push(null);
    } else {
      const avgGain =
        gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      const avgLoss =
        losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;

      if (avgLoss === 0) {
        result.push(100);
      } else {
        const rs = avgGain / avgLoss;
        result.push(100 - 100 / (1 + rs));
      }
    }
  }

  return result;
}

interface Props {
  data: OhlcvDataDto[];
}

export default function RsiPanel({ data }: Props) {
  const { isDark } = useTheme();
  const colors = isDark ? CHART_COLORS.dark : CHART_COLORS.light;
  const tooltipStyle = getGlassTooltipStyle(isDark);

  const closePrices = useMemo(() => data.map((d) => d.close), [data]);
  const rsiData = useMemo(() => calculateRSI(closePrices), [closePrices]);

  const option: EChartsOption = useMemo(
    () => ({
      tooltip: {
        trigger: 'axis',
        ...tooltipStyle,
        formatter: (params: unknown) => {
          const param = (
            params as { data: number | null; axisValue: string }[]
          )[0];
          if (!param || param.data === null) return '';
          const dateStr = formatChartDate(Number(param.axisValue));
          return `
            <div style="font-size: 12px; line-height: 1.6;">
              <div style="font-weight: 600; margin-bottom: 4px;">${dateStr}</div>
              <div style="display: flex; justify-content: space-between; gap: 16px;">
                <span style="opacity: 0.7;">RSI(14)</span>
                <span style="font-weight: 500;">${param.data.toFixed(2)}</span>
              </div>
            </div>
          `;
        },
      },
      grid: {
        left: '60px',
        right: '10px',
        top: '15%',
        bottom: '20%',
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.timestamp),
        axisLine: { lineStyle: { color: colors.axisLine } },
        axisLabel: {
          color: colors.axisLabel,
          fontSize: 10,
          formatter: (value: string) => formatChartDate(Number(value)),
          interval: Math.floor(data.length / 4),
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLine: { show: false },
        axisLabel: {
          color: colors.axisLabel,
          fontSize: 10,
        },
        splitLine: { lineStyle: { color: colors.splitLine, type: 'dashed' } },
      },
      visualMap: {
        show: false,
        pieces: [
          { lte: 30, color: '#10B981' },
          { gt: 30, lte: 70, color: '#6B7280' },
          { gt: 70, color: '#EF4444' },
        ],
        outOfRange: { color: '#6B7280' },
      },
      series: [
        {
          name: 'RSI',
          type: 'line',
          data: rsiData,
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 1.5 },
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { type: 'dashed', width: 1 },
            data: [
              {
                yAxis: 70,
                lineStyle: { color: '#EF4444' },
                label: {
                  show: true,
                  formatter: '70',
                  fontSize: 9,
                  color: '#EF4444',
                },
              },
              {
                yAxis: 30,
                lineStyle: { color: '#10B981' },
                label: {
                  show: true,
                  formatter: '30',
                  fontSize: 9,
                  color: '#10B981',
                },
              },
            ],
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(239, 68, 68, 0.2)' },
                { offset: 0.3, color: 'rgba(107, 114, 128, 0.05)' },
                { offset: 0.7, color: 'rgba(107, 114, 128, 0.05)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0.2)' },
              ],
            },
          },
        },
      ],
    }),
    [data, colors, tooltipStyle, rsiData],
  );

  return (
    <ReactECharts
      option={option}
      style={{ height: '100%', width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
}
