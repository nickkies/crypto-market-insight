import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { CHART_COLORS, getGlassTooltipStyle } from '@/styles/marketColors';
import { useTheme } from '@/styles';
import { formatChartDate } from '@/utils';
import type { EquityCurvePoint } from '../types';

interface Props {
  data: EquityCurvePoint[];
}

export default function EquityCurve({ data }: Props) {
  const { isDark } = useTheme();
  const colors = isDark ? CHART_COLORS.dark : CHART_COLORS.light;
  const tooltipStyle = getGlassTooltipStyle(isDark);

  const option: EChartsOption = useMemo(() => {
    const initialEquity = data[0]?.equity ?? 10000;

    return {
      tooltip: {
        trigger: 'axis',
        ...tooltipStyle,
        formatter: (params: unknown) => {
          const param = (params as { data: number; axisValue: string }[])[0];
          if (!param) return '';
          const equity = param.data;
          const returnPct = ((equity / initialEquity - 1) * 100).toFixed(2);
          const sign = Number(returnPct) >= 0 ? '+' : '';
          const dateStr = formatChartDate(param.axisValue);
          return `
            <div style="font-size: 12px; line-height: 1.6;">
              <div style="font-weight: 600; margin-bottom: 4px;">${dateStr}</div>
              <div style="display: flex; justify-content: space-between; gap: 16px;">
                <span style="opacity: 0.7;">Equity</span>
                <span style="font-weight: 500;">$${equity.toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 16px;">
                <span style="opacity: 0.7;">Return</span>
                <span style="font-weight: 500;">${sign}${returnPct}%</span>
              </div>
            </div>
          `;
        },
      },
      grid: {
        left: '50px',
        right: '16px',
        top: '8%',
        bottom: '12%',
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.date),
        axisLine: { lineStyle: { color: colors.axisLine } },
        axisLabel: {
          color: colors.axisLabel,
          fontSize: 11,
          formatter: (value: string) => formatChartDate(value),
          interval: Math.floor(data.length / 6),
        },
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLine: { show: false },
        axisLabel: {
          color: colors.axisLabel,
          fontSize: 11,
          formatter: (value: number) => `$${(value / 1000).toFixed(1)}K`,
        },
        splitLine: { lineStyle: { color: colors.splitLine, type: 'dashed' } },
      },
      series: [
        {
          type: 'line',
          data: data.map((d) => d.equity),
          smooth: true,
          symbol: 'none',
          lineStyle: {
            width: 2,
            color: '#3B82F6',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
              ],
            },
          },
        },
      ],
    };
  }, [data, colors, tooltipStyle]);

  return (
    <ReactECharts
      option={option}
      style={{ height: '100%', width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
}
