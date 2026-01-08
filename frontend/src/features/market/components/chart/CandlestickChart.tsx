import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import {
  MARKET_COLORS,
  CHART_COLORS,
  getGlassTooltipStyle,
} from '@/styles/marketColors';
import { useTheme } from '@/styles';
import type { OhlcvDataDto } from '../../services';
import { formatPrice } from '@/utils';

interface Props {
  data: OhlcvDataDto[];
}

export default function CandlestickChart({ data }: Props) {
  const { isDark } = useTheme();
  const colors = isDark ? CHART_COLORS.dark : CHART_COLORS.light;
  const tooltipStyle = getGlassTooltipStyle(isDark);

  const option: EChartsOption = useMemo(
    () => ({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
        ...tooltipStyle,
        formatter: (params: unknown) => {
          const param = (params as { data: number[]; axisValue: string }[])[0];
          if (!param) return '';
          const [open, close, low, high] = param.data;
          return `
            <div style="font-size: 12px; line-height: 1.6;">
              <div style="font-weight: 600; margin-bottom: 4px;">${param.axisValue}</div>
              <div style="display: flex; justify-content: space-between; gap: 16px;">
                <span style="opacity: 0.7;">Open</span>
                <span style="font-weight: 500;">$${open.toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 16px;">
                <span style="opacity: 0.7;">High</span>
                <span style="font-weight: 500;">$${high.toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 16px;">
                <span style="opacity: 0.7;">Low</span>
                <span style="font-weight: 500;">$${low.toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 16px;">
                <span style="opacity: 0.7;">Close</span>
                <span style="font-weight: 500;">$${close.toLocaleString()}</span>
              </div>
            </div>
          `;
        },
      },
      grid: {
        left: '60px',
        right: '10px',
        top: '10%',
        bottom: '15%',
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => new Date(d.timestamp).toLocaleDateString()),
        axisLine: { lineStyle: { color: colors.axisLine } },
        axisLabel: { color: colors.axisLabel },
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLine: { lineStyle: { color: colors.axisLine } },
        axisLabel: {
          color: colors.axisLabel,
          formatter: (value: number) => formatPrice(value),
        },
        splitLine: { lineStyle: { color: colors.splitLine } },
      },
      series: [
        {
          type: 'candlestick',
          data: data.map((d) => [d.open, d.close, d.low, d.high]),
          itemStyle: {
            color: MARKET_COLORS.up,
            color0: MARKET_COLORS.down,
            borderColor: MARKET_COLORS.up,
            borderColor0: MARKET_COLORS.down,
          },
        },
      ],
    }),
    [data, colors, tooltipStyle],
  );

  return (
    <ReactECharts
      option={option}
      style={{ height: '100%', width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
}
