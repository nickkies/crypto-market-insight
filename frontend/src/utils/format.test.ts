import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  formatPercent,
  formatMarketCap,
  formatVolume,
  formatChartDate,
} from './format';

describe('formatPrice', () => {
  const priceCases = [
    // Happy: 1 이상 (소수점 2자리)
    { input: 97500.123, expected: '97,500.12', name: 'large number' },
    { input: 1.5, expected: '1.50', name: 'small positive' },
    { input: 1000, expected: '1,000.00', name: 'round thousand' },

    // Happy: 0.01 이상 1 미만 (소수점 4자리)
    { input: 0.5432, expected: '0.5432', name: 'sub-dollar' },
    { input: 0.01, expected: '0.0100', name: 'one cent' },

    // Happy: 0.01 미만 (소수점 6자리)
    { input: 0.00123456, expected: '0.001235', name: 'micro price' },
    { input: 0.000001, expected: '0.000001', name: 'minimal price' },

    // Edge: 경계값 (0 < 0.01이므로 6자리)
    { input: 0, expected: '0.000000', name: 'zero (6 decimals)' },
    { input: 0.009999, expected: '0.009999', name: 'below 0.01 boundary' },
    { input: 0.999999, expected: '1.0000', name: 'rounds to 1' },
    { input: 1, expected: '1.00', name: 'exactly 1' },

    // Edge: null/undefined
    { input: null, expected: '-', name: 'null' },
    { input: undefined, expected: '-', name: 'undefined' },
  ];

  it.each(priceCases)('$name: $input → $expected', ({ input, expected }) => {
    expect(formatPrice(input)).toBe(expected);
  });
});

describe('formatPercent', () => {
  const percentCases = [
    // Happy: 양수
    { input: 2.5, expected: '+2.50%', name: 'positive' },
    { input: 1.234, expected: '+1.23%', name: 'positive rounded' },

    // Happy: 음수
    { input: -3.14, expected: '-3.14%', name: 'negative' },
    { input: -5.678, expected: '-5.68%', name: 'negative rounded' },

    // Edge: 경계값
    { input: 0, expected: '+0.00%', name: 'zero' },
    { input: 0.001, expected: '+0.00%', name: 'tiny positive' },
    { input: -0.001, expected: '-0.00%', name: 'tiny negative' },
    { input: 100, expected: '+100.00%', name: 'hundred percent' },
    { input: -100, expected: '-100.00%', name: 'negative hundred' },

    // Edge: null/undefined
    { input: null, expected: '-', name: 'null' },
    { input: undefined, expected: '-', name: 'undefined' },
  ];

  it.each(percentCases)('$name: $input → $expected', ({ input, expected }) => {
    expect(formatPercent(input)).toBe(expected);
  });
});

describe('formatMarketCap', () => {
  it('1조 이상은 조 단위로 포맷팅한다', () => {
    expect(formatMarketCap(1_930_000_000_000)).toBe('1.93조');
    expect(formatMarketCap(1_000_000_000_000)).toBe('1.00조');
  });

  it('1억 이상 1조 미만은 억 단위로 포맷팅한다', () => {
    expect(formatMarketCap(500_000_000_000)).toBe('5000.00억');
    expect(formatMarketCap(100_000_000)).toBe('1.00억');
  });

  it('1만 이상 1억 미만은 만 단위로 포맷팅한다', () => {
    expect(formatMarketCap(50_000_000)).toBe('5000.00만');
    expect(formatMarketCap(10_000)).toBe('1.00만');
  });

  it('1만 미만은 그대로 표시한다', () => {
    expect(formatMarketCap(9999)).toBe('9,999');
    expect(formatMarketCap(100)).toBe('100');
  });

  it('null 또는 undefined는 - 를 반환한다', () => {
    expect(formatMarketCap(null)).toBe('-');
    expect(formatMarketCap(undefined)).toBe('-');
  });
});

describe('formatVolume', () => {
  it('10억 이상은 B 단위로 포맷팅한다', () => {
    expect(formatVolume(25_000_000_000)).toBe('25.0B');
    expect(formatVolume(1_500_000_000)).toBe('1.5B');
  });

  it('100만 이상 10억 미만은 M 단위로 포맷팅한다', () => {
    expect(formatVolume(500_000_000)).toBe('500.0M');
    expect(formatVolume(1_000_000)).toBe('1.0M');
  });

  it('1000 이상 100만 미만은 K 단위로 포맷팅한다', () => {
    expect(formatVolume(50_000)).toBe('50.0K');
    expect(formatVolume(1_000)).toBe('1.0K');
  });

  it('1000 미만은 그대로 표시한다', () => {
    expect(formatVolume(999)).toBe('999');
    expect(formatVolume(100)).toBe('100');
  });

  it('null 또는 undefined는 - 를 반환한다', () => {
    expect(formatVolume(null)).toBe('-');
    expect(formatVolume(undefined)).toBe('-');
  });
});

describe('formatChartDate', () => {
  it('ISO date string을 MM.DD 형식으로 포맷팅한다', () => {
    expect(formatChartDate('2024-01-15')).toBe('01.15');
    expect(formatChartDate('2024-12-25')).toBe('12.25');
  });

  it('timestamp를 MM.DD 형식으로 포맷팅한다', () => {
    // 2024-01-15 00:00:00 UTC
    const timestamp = new Date('2024-01-15T00:00:00Z').getTime();
    const result = formatChartDate(timestamp);
    // 로컬 타임존에 따라 01.15 또는 01.14일 수 있음
    expect(result).toMatch(/^\d{2}\.\d{2}$/);
  });

  it('월과 일을 2자리로 패딩한다', () => {
    expect(formatChartDate('2024-05-03')).toBe('05.03');
    expect(formatChartDate('2024-09-01')).toBe('09.01');
  });
});
