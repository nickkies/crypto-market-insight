import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import {
  MARKET_COLORS,
  CHART_COLORS,
  getGlassTooltipStyle,
} from '@/styles/marketColors';
import { useTheme } from '@/styles';
import type { TradeDto } from '../types';

interface MonthlyReturn {
  month: string;
  return: number;
}

interface Props {
  trades: TradeDto[];
}

function calculateMonthlyReturns(trades: TradeDto[]): MonthlyReturn[] {
  const monthlyMap = new Map<string, number>();

  trades.forEach((trade) => {
    const date = new Date(trade.exitTime);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    const current = monthlyMap.get(monthKey) ?? 0;
    monthlyMap.set(monthKey, current + trade.profitPercent);
  });

  const sorted = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, ret]) => ({ month, return: ret }));

  return sorted;
}

// 월 포맷 (24.01 형식)
function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  return `${year.slice(2)}.${month}`;
}

export default function MonthlyReturnsChart({ trades }: Props) {
  const { isDark } = useTheme();
  const colors = isDark ? CHART_COLORS.dark : CHART_COLORS.light;
  const tooltipStyle = getGlassTooltipStyle(isDark);

  const monthlyReturns = useMemo(
    () => calculateMonthlyReturns(trades),
    [trades],
  );

  const option: EChartsOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'axis',
        ...tooltipStyle,
        formatter: (params: unknown) => {
          const param = (
            params as { data: { value: number }; axisValue: string }[]
          )[0];
          if (!param) return '';
          const value = param.data.value;
          const sign = value >= 0 ? '+' : '';
          const color = value >= 0 ? MARKET_COLORS.up : MARKET_COLORS.down;
          return `
            <div style="font-size: 12px; line-height: 1.6;">
              <div style="font-weight: 600; margin-bottom: 4px;">${param.axisValue}</div>
              <div style="display: flex; justify-content: space-between; gap: 16px;">
                <span style="opacity: 0.7;">Return</span>
                <span style="font-weight: 500; color: ${color};">${sign}${value.toFixed(2)}%</span>
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
        data: monthlyReturns.map((d) => d.month),
        axisLine: { lineStyle: { color: colors.axisLine } },
        axisLabel: {
          color: colors.axisLabel,
          fontSize: 11,
          formatter: (value: string) => formatMonth(value),
        },
      },
      yAxis: {
        type: 'value',
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
          type: 'bar',
          data: monthlyReturns.map((d) => ({
            value: d.return,
            itemStyle: {
              color: d.return >= 0 ? MARKET_COLORS.up : MARKET_COLORS.down,
              borderRadius: [4, 4, 0, 0],
            },
          })),
          barWidth: '50%',
        },
      ],
    };
  }, [monthlyReturns, colors, tooltipStyle]);

  return (
    <ReactECharts
      option={option}
      style={{ height: '100%', width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
}
