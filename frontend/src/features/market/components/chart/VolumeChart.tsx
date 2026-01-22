import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import {
  MARKET_COLORS,
  CHART_COLORS,
  getGlassTooltipStyle,
} from '@/features/common/styles/marketColors';
import { useTheme } from '@/features/common/styles';
import { formatVolume, formatChartDate } from '@/utils';
import type { OhlcvDataDto } from '../../services';

interface Props {
  data: OhlcvDataDto[];
}

export default function VolumeChart({ data }: Props) {
  const { isDark } = useTheme();
  const colors = isDark ? CHART_COLORS.dark : CHART_COLORS.light;
  const tooltipStyle = getGlassTooltipStyle(isDark);

  const volumeData = data.filter((d) => d.volume !== null);

  const option: EChartsOption = useMemo(
    () => ({
      tooltip: {
        trigger: 'axis',
        ...tooltipStyle,
        formatter: (params: unknown) => {
          const param = (
            params as { data: { value: number }; axisValue: string }[]
          )[0];
          if (!param) return '';
          const dateStr = formatChartDate(Number(param.axisValue));
          return `
            <div style="font-size: 12px; line-height: 1.6;">
              <div style="font-weight: 600; margin-bottom: 4px;">${dateStr}</div>
              <div style="display: flex; justify-content: space-between; gap: 16px;">
                <span style="opacity: 0.7;">Volume</span>
                <span style="font-weight: 500;">${param.data.value.toLocaleString()}</span>
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
        data: volumeData.map((d) => d.timestamp),
        axisLine: { lineStyle: { color: colors.axisLine } },
        axisLabel: {
          color: colors.axisLabel,
          fontSize: 11,
          formatter: (value: string) => formatChartDate(Number(value)),
          interval: Math.floor(volumeData.length / 6),
        },
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLine: { lineStyle: { color: colors.axisLine } },
        axisLabel: {
          color: colors.axisLabel,
          formatter: (value: number) => formatVolume(value),
        },
        splitLine: { lineStyle: { color: colors.splitLine } },
      },
      series: [
        {
          type: 'bar',
          data: volumeData.map((d) => ({
            value: d.volume!,
            itemStyle: {
              color: d.close >= d.open ? MARKET_COLORS.up : MARKET_COLORS.down,
            },
          })),
        },
      ],
    }),
    [volumeData, colors, tooltipStyle],
  );

  if (volumeData.length === 0) {
    return null;
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: '100%', width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
}
