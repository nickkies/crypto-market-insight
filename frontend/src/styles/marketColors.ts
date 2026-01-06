// 한국식 시장 색상 (상승: 빨간색, 하락: 파란색)
export const MARKET_COLORS = {
  up: '#EF5350',
  down: '#2962FF',
  neutral: '#94A3B8',
} as const;

// ECharts 테마별 색상
export const CHART_COLORS = {
  light: {
    axisLine: '#94A3B8',
    axisLabel: '#64748B',
    splitLine: '#E2E8F0',
    tooltipBg: 'rgba(255, 255, 255, 0.95)',
    tooltipText: '#0F172A',
  },
  dark: {
    axisLine: '#64748B',
    axisLabel: '#94A3B8',
    splitLine: '#334155',
    tooltipBg: 'rgba(30, 41, 59, 0.95)',
    tooltipText: '#F8FAFC',
  },
} as const;
