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

// iOS 글래스모피즘 스타일 툴팁
export const getGlassTooltipStyle = (isDark: boolean) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.01)',
  borderColor: 'transparent',
  borderWidth: 0,
  textStyle: {
    color: isDark ? '#F8FAFC' : '#0F172A',
    fontSize: 12,
  },
  extraCssText: `
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow:
      0 2px 14px 0 rgba(255, 255, 255, 0.13) inset,
      0 0 8px 1px rgba(255, 255, 255, 0.07) inset,
      0 4px 16px rgba(0, 0, 0, 0.3);
    border-radius: 15px;
    padding: 12px 18px;
  `,
});
