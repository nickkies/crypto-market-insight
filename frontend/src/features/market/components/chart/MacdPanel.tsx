import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { CHART_COLORS, getGlassTooltipStyle } from '@/styles/marketColors';
import { useTheme } from '@/styles';
import type { OhlcvDataDto } from '../../services';
import { formatChartDate } from '@/utils';

function calculateEMA(data: number[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(data[i]);
    } else {
      result.push((data[i] - result[i - 1]) * multiplier + result[i - 1]);
    }
  }

  return result;
}

function calculateMACD(
  data: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9,
): {
  macd: (number | null)[];
  signal: (number | null)[];
  histogram: (number | null)[];
} {
  const emaFast = calculateEMA(data, fastPeriod);
  const emaSlow = calculateEMA(data, slowPeriod);

  const macdLine: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < slowPeriod - 1) {
      macdLine.push(null);
    } else {
      macdLine.push(emaFast[i] - emaSlow[i]);
    }
  }

  const validMacd = macdLine.filter((v): v is number => v !== null);
  const signalEma = calculateEMA(validMacd, signalPeriod);

  const signal: (number | null)[] = [];
  const histogram: (number | null)[] = [];
  let signalIndex = 0;

  for (let i = 0; i < data.length; i++) {
    if (macdLine[i] === null) {
      signal.push(null);
      histogram.push(null);
    } else {
      const signalValue = signalEma[signalIndex] ?? null;
      signal.push(signalValue);
      histogram.push(signalValue !== null ? macdLine[i]! - signalValue : null);
      signalIndex++;
    }
  }

  return { macd: macdLine, signal, histogram };
}

interface Props {
  data: OhlcvDataDto[];
}

export default function MacdPanel({ data }: Props) {
  const { isDark } = useTheme();
  const colors = isDark ? CHART_COLORS.dark : CHART_COLORS.light;
  const tooltipStyle = getGlassTooltipStyle(isDark);

  const closePrices = useMemo(() => data.map((d) => d.close), [data]);
  const macdData = useMemo(() => calculateMACD(closePrices), [closePrices]);

  const option: EChartsOption = useMemo(
    () => ({
      tooltip: {
        trigger: 'axis',
        ...tooltipStyle,
        formatter: (params: unknown) => {
          const paramArr = params as {
            seriesName: string;
            data: number | null | { value: number | null };
            axisValue: string;
            color: string;
          }[];
          if (!paramArr || paramArr.length === 0) return '';

          const dateStr = formatChartDate(Number(paramArr[0].axisValue));
          let content = `<div style="font-size: 12px; line-height: 1.6;">
            <div style="font-weight: 600; margin-bottom: 4px;">${dateStr}</div>`;

          paramArr.forEach((param) => {
            const value =
              typeof param.data === 'object' && param.data !== null
                ? param.data.value
                : param.data;
            if (value !== null) {
              const numValue = value as number;
              const absValue = Math.abs(numValue);
              // 값 크기에 따라 소수점 자릿수 조절
              const decimals = absValue < 0.01 ? 6 : absValue < 1 ? 4 : 2;
              content += `<div style="display: flex; justify-content: space-between; gap: 16px;">
                <span style="opacity: 0.7;">${param.seriesName}</span>
                <span style="font-weight: 500; color: ${param.color}">${numValue.toFixed(decimals)}</span>
              </div>`;
            }
          });

          content += '</div>';
          return content;
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
        axisLine: { show: false },
        axisLabel: {
          color: colors.axisLabel,
          fontSize: 10,
        },
        splitLine: { lineStyle: { color: colors.splitLine, type: 'dashed' } },
      },
      series: [
        {
          name: 'MACD',
          type: 'line',
          data: macdData.macd,
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 1.5, color: '#3B82F6' },
        },
        {
          name: 'Signal',
          type: 'line',
          data: macdData.signal,
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 1.5, color: '#F97316' },
        },
        {
          name: 'Histogram',
          type: 'bar',
          data: macdData.histogram.map((v) => ({
            value: v,
            itemStyle: {
              color: v !== null && v >= 0 ? '#10B981' : '#EF4444',
            },
          })),
          barWidth: '60%',
        },
      ],
    }),
    [data, colors, tooltipStyle, macdData],
  );

  return (
    <ReactECharts
      option={option}
      style={{ height: '100%', width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
}
