import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { MARKET_COLORS, CHART_COLORS } from '@/styles/marketColors';
import { useTheme } from '@/styles';
import type { OhlcvDataDto } from '../../services';
import { formatPrice } from '@/utils';

interface Props {
  data: OhlcvDataDto[];
}

export default function CandlestickChart({ data }: Props) {
  const { isDark } = useTheme();
  const colors = isDark ? CHART_COLORS.dark : CHART_COLORS.light;

  const option: EChartsOption = useMemo(
    () => ({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
        backgroundColor: colors.tooltipBg,
        textStyle: { color: colors.tooltipText },
        formatter: (params: unknown) => {
          const param = (params as { data: number[]; axisValue: string }[])[0];
          if (!param) return '';
          const [open, close, low, high] = param.data;
          return `
            <div style="font-size: 12px;">
              <div><strong>${param.axisValue}</strong></div>
              <div>Open: $${open.toLocaleString()}</div>
              <div>High: $${high.toLocaleString()}</div>
              <div>Low: $${low.toLocaleString()}</div>
              <div>Close: $${close.toLocaleString()}</div>
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
    [data, colors],
  );

  return (
    <ReactECharts
      option={option}
      style={{ height: '100%', width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
}
