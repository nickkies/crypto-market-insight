import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { MARKET_COLORS, CHART_COLORS } from '@/styles/marketColors';
import { useTheme } from '@/styles';
import type { OhlcvDataDto } from '../../services';

interface Props {
  data: OhlcvDataDto[];
}

export default function VolumeChart({ data }: Props) {
  const { isDark } = useTheme();
  const colors = isDark ? CHART_COLORS.dark : CHART_COLORS.light;

  const volumeData = data.filter((d) => d.volume !== null);

  const option: EChartsOption = useMemo(
    () => ({
      tooltip: {
        trigger: 'axis',
        backgroundColor: colors.tooltipBg,
        textStyle: { color: colors.tooltipText },
        formatter: (params: unknown) => {
          const param = (
            params as { data: { value: number }; axisValue: string }[]
          )[0];
          if (!param) return '';
          return `
            <div style="font-size: 12px;">
              <div><strong>${param.axisValue}</strong></div>
              <div>Volume: ${param.data.value.toLocaleString()}</div>
            </div>
          `;
        },
      },
      grid: {
        left: '10%',
        right: '3%',
        top: '10%',
        bottom: '15%',
      },
      xAxis: {
        type: 'category',
        data: volumeData.map((d) => new Date(d.timestamp).toLocaleDateString()),
        axisLine: { lineStyle: { color: colors.axisLine } },
        axisLabel: { color: colors.axisLabel },
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLine: { lineStyle: { color: colors.axisLine } },
        axisLabel: { color: colors.axisLabel },
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
    [volumeData, colors],
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
