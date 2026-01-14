import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption, SeriesOption } from 'echarts';
import {
  MARKET_COLORS,
  CHART_COLORS,
  getGlassTooltipStyle,
} from '@/styles/marketColors';
import { useTheme } from '@/styles';
import type { OhlcvDataDto } from '../../services';
import type { IndicatorType } from '../../stores/useMarketStore';
import { calculateMA, calculateBollingerBands } from '../../utils';
import { formatPrice, formatChartDate } from '@/utils';

interface Props {
  data: OhlcvDataDto[];
  selectedIndicators?: IndicatorType[];
}

export default function CandlestickChart({
  data,
  selectedIndicators = [],
}: Props) {
  const { isDark } = useTheme();
  const colors = isDark ? CHART_COLORS.dark : CHART_COLORS.light;
  const tooltipStyle = getGlassTooltipStyle(isDark);

  const closePrices = useMemo(() => data.map((d) => d.close), [data]);

  const ma20 = useMemo(
    () =>
      selectedIndicators.includes('MA') ? calculateMA(closePrices, 20) : [],
    [closePrices, selectedIndicators],
  );

  const ma50 = useMemo(
    () =>
      selectedIndicators.includes('MA') ? calculateMA(closePrices, 50) : [],
    [closePrices, selectedIndicators],
  );

  const bb = useMemo(
    () =>
      selectedIndicators.includes('BB')
        ? calculateBollingerBands(closePrices)
        : null,
    [closePrices, selectedIndicators],
  );

  const option: EChartsOption = useMemo(() => {
    const series: SeriesOption[] = [
      {
        name: 'Candlestick',
        type: 'candlestick',
        data: data.map((d) => [d.open, d.close, d.low, d.high]),
        itemStyle: {
          color: MARKET_COLORS.up,
          color0: MARKET_COLORS.down,
          borderColor: MARKET_COLORS.up,
          borderColor0: MARKET_COLORS.down,
        },
      },
    ];

    // MA 오버레이
    if (selectedIndicators.includes('MA')) {
      series.push({
        name: 'MA(20)',
        type: 'line',
        data: ma20,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1.5, color: '#F59E0B' },
      });
      series.push({
        name: 'MA(50)',
        type: 'line',
        data: ma50,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1.5, color: '#8B5CF6' },
      });
    }

    // 볼린저 밴드 오버레이
    if (bb) {
      series.push({
        name: 'BB Upper',
        type: 'line',
        data: bb.upper,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1, color: '#3B82F6', type: 'dashed' },
      });
      series.push({
        name: 'BB Middle',
        type: 'line',
        data: bb.middle,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1, color: '#3B82F6' },
      });
      series.push({
        name: 'BB Lower',
        type: 'line',
        data: bb.lower,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1, color: '#3B82F6', type: 'dashed' },
        areaStyle: {
          color: 'rgba(59, 130, 246, 0.1)',
          origin: 'auto',
        },
      });
    }

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            show: false,
          },
        },
        ...tooltipStyle,
        formatter: (params: unknown) => {
          const paramArr = params as {
            seriesName: string;
            data: number | number[] | null;
            axisValue: string;
          }[];
          if (!paramArr || paramArr.length === 0) return '';

          const dateStr = formatChartDate(Number(paramArr[0].axisValue));
          let html = `<div style="font-size: 12px; line-height: 1.6;">
            <div style="font-weight: 600; margin-bottom: 4px;">${dateStr}</div>`;

          paramArr.forEach((param) => {
            if (
              param.seriesName === 'Candlestick' &&
              Array.isArray(param.data)
            ) {
              const [open, close, low, high] = param.data;
              html += `
                <div style="display: flex; justify-content: space-between; gap: 16px;">
                  <span style="opacity: 0.7;">Open</span>
                  <span style="font-weight: 500;">$${open?.toLocaleString() ?? '-'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 16px;">
                  <span style="opacity: 0.7;">High</span>
                  <span style="font-weight: 500;">$${high?.toLocaleString() ?? '-'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 16px;">
                  <span style="opacity: 0.7;">Low</span>
                  <span style="font-weight: 500;">$${low?.toLocaleString() ?? '-'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 16px;">
                  <span style="opacity: 0.7;">Close</span>
                  <span style="font-weight: 500;">$${close?.toLocaleString() ?? '-'}</span>
                </div>`;
            } else if (typeof param.data === 'number') {
              html += `
                <div style="display: flex; justify-content: space-between; gap: 16px;">
                  <span style="opacity: 0.7;">${param.seriesName}</span>
                  <span style="font-weight: 500;">$${param.data.toLocaleString()}</span>
                </div>`;
            }
          });

          html += '</div>';
          return html;
        },
      },
      legend: {
        show: selectedIndicators.length > 0,
        top: 0,
        right: 10,
        textStyle: { color: colors.axisLabel, fontSize: 11 },
        itemWidth: 16,
        itemHeight: 8,
      },
      grid: {
        left: '60px',
        right: '10px',
        top: selectedIndicators.length > 0 ? '12%' : '10%',
        bottom: '15%',
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.timestamp),
        axisLine: { lineStyle: { color: colors.axisLine } },
        axisLabel: {
          color: colors.axisLabel,
          fontSize: 11,
          formatter: (value: string) => formatChartDate(Number(value)),
          interval: Math.floor(data.length / 6),
        },
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
      series,
    };
  }, [data, colors, tooltipStyle, selectedIndicators, ma20, ma50, bb]);

  return (
    <ReactECharts
      option={option}
      style={{ height: '100%', width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
}
