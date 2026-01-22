import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import {
  MARKET_COLORS,
  CHART_COLORS,
  getGlassTooltipStyle,
} from '@/features/common/styles/marketColors';
import { useTheme } from '@/features/common/styles';
import { formatChartDate } from '@/utils';
import type { DrawdownPoint } from '../types';

interface Props {
  data: DrawdownPoint[];
}

export default function DrawdownChart({ data }: Props) {
  const { isDark } = useTheme();
  const colors = isDark ? CHART_COLORS.dark : CHART_COLORS.light;
  const tooltipStyle = getGlassTooltipStyle(isDark);

  const option: EChartsOption = useMemo(() => {
    const mdd = Math.min(...data.map((d) => d.drawdown));

    return {
      tooltip: {
        trigger: 'axis',
        ...tooltipStyle,
        formatter: (params: unknown) => {
          const param = (params as { data: number; axisValue: string }[])[0];
          if (!param) return '';
          const dateStr = formatChartDate(param.axisValue);
          return `
            <div style="font-size: 12px; line-height: 1.6;">
              <div style="font-weight: 600; margin-bottom: 4px;">${dateStr}</div>
              <div style="display: flex; justify-content: space-between; gap: 16px;">
                <span style="opacity: 0.7;">Drawdown</span>
                <span style="font-weight: 500; color: ${MARKET_COLORS.down};">${param.data.toFixed(2)}%</span>
              </div>
            </div>
          `;
        },
      },
      grid: {
        left: '45px',
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
          interval: Math.floor(data.length / 5),
        },
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        max: 0,
        min: Math.floor(mdd * 1.2),
        axisLine: { show: false },
        axisLabel: {
          color: colors.axisLabel,
          fontSize: 11,
          formatter: (value: number) => `${value}%`,
        },
        splitLine: { lineStyle: { color: colors.splitLine, type: 'dashed' } },
      },
      series: [
        {
          type: 'line',
          data: data.map((d) => d.drawdown),
          smooth: true,
          symbol: 'none',
          lineStyle: {
            width: 2,
            color: MARKET_COLORS.down,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(41, 98, 255, 0.1)' },
                { offset: 1, color: 'rgba(41, 98, 255, 0.4)' },
              ],
            },
          },
          markLine: {
            silent: true,
            symbol: 'none',
            data: [
              {
                yAxis: mdd,
                lineStyle: { color: MARKET_COLORS.down, type: 'dashed' },
                label: {
                  show: true,
                  formatter: `MDD ${mdd.toFixed(1)}%`,
                  color: MARKET_COLORS.down,
                  fontSize: 10,
                  position: 'insideEndTop',
                },
              },
            ],
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
