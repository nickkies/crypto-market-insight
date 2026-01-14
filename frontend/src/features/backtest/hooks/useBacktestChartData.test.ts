import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBacktestChartData } from './useBacktestChartData';
import type { BacktestResult } from '../types';

const createMockResult = (
  overrides: Partial<BacktestResult> = {},
): BacktestResult => ({
  id: 1,
  coinId: 'bitcoin',
  strategyType: 'RSI',
  timeframe: '1d',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  metrics: {
    tradeCount: 2,
    winRate: 100,
    mdd: 0,
    cumulativeReturn: 10,
  },
  trades: [],
  equityCurve: [],
  drawdownCurve: [],
  createdAt: '2024-01-31T12:00:00Z',
  ...overrides,
});

describe('useBacktestChartData', () => {
  it('기존 차트 데이터가 있으면 그대로 반환한다', () => {
    const mockResult = createMockResult({
      equityCurve: [
        { date: '2024-01-01', equity: 10000 },
        { date: '2024-01-15', equity: 10500 },
      ],
      drawdownCurve: [
        { date: '2024-01-01', drawdown: 0 },
        { date: '2024-01-15', drawdown: -2 },
      ],
    });

    const { result } = renderHook(() => useBacktestChartData(mockResult));

    expect(result.current.equityCurve).toHaveLength(2);
    expect(result.current.equityCurve[0].equity).toBe(10000);
    expect(result.current.drawdownCurve).toHaveLength(2);
  });

  it('차트 데이터가 없으면 trades에서 생성한다', () => {
    const mockResult = createMockResult({
      trades: [
        {
          entryTime: '2024-01-05T00:00:00Z',
          exitTime: '2024-01-10T00:00:00Z',
          entryPrice: 40000,
          exitPrice: 42000,
          profit: 2000,
          profitPercent: 5,
        },
        {
          entryTime: '2024-01-15T00:00:00Z',
          exitTime: '2024-01-20T00:00:00Z',
          entryPrice: 42000,
          exitPrice: 43000,
          profit: 2000,
          profitPercent: 2.38,
        },
      ],
      equityCurve: [],
      drawdownCurve: [],
    });

    const { result } = renderHook(() => useBacktestChartData(mockResult));

    // 시작점 + 거래 2개 = 3개 포인트
    expect(result.current.equityCurve.length).toBeGreaterThanOrEqual(2);
    expect(result.current.drawdownCurve.length).toBeGreaterThanOrEqual(2);
  });

  it('trades가 비어있으면 기본 차트 데이터를 반환한다', () => {
    const mockResult = createMockResult({
      trades: [],
      equityCurve: [],
      drawdownCurve: [],
    });

    const { result } = renderHook(() => useBacktestChartData(mockResult));

    expect(result.current.equityCurve).toHaveLength(1);
    expect(result.current.equityCurve[0].equity).toBe(10000);
    expect(result.current.drawdownCurve).toHaveLength(1);
    expect(result.current.drawdownCurve[0].drawdown).toBe(0);
  });

  it('equity가 올바르게 계산된다', () => {
    const mockResult = createMockResult({
      trades: [
        {
          entryTime: '2024-01-05T00:00:00Z',
          exitTime: '2024-01-10T00:00:00Z',
          entryPrice: 40000,
          exitPrice: 42000,
          profit: 2000,
          profitPercent: 10, // +10%
        },
      ],
      equityCurve: [],
      drawdownCurve: [],
    });

    const { result } = renderHook(() => useBacktestChartData(mockResult));

    // 초기 10000 * 1.10 = 11000
    const lastEquity =
      result.current.equityCurve[result.current.equityCurve.length - 1].equity;
    expect(lastEquity).toBe(11000);
  });

  it('drawdown이 올바르게 계산된다', () => {
    const mockResult = createMockResult({
      trades: [
        {
          entryTime: '2024-01-05T00:00:00Z',
          exitTime: '2024-01-10T00:00:00Z',
          entryPrice: 40000,
          exitPrice: 42000,
          profit: 2000,
          profitPercent: 10, // +10%: equity = 11000
        },
        {
          entryTime: '2024-01-15T00:00:00Z',
          exitTime: '2024-01-20T00:00:00Z',
          entryPrice: 42000,
          exitPrice: 40000,
          profit: 2000,
          profitPercent: -5, // -5%: equity = 10450
        },
      ],
      equityCurve: [],
      drawdownCurve: [],
    });

    const { result } = renderHook(() => useBacktestChartData(mockResult));

    // 첫 거래 후: 10000 * 1.10 = 11000 (peak)
    // 두 번째 거래 후: 11000 * 0.95 = 10450
    // drawdown = (10450 - 11000) / 11000 * 100 = -5%
    const lastDrawdown =
      result.current.drawdownCurve[result.current.drawdownCurve.length - 1]
        .drawdown;
    expect(lastDrawdown).toBeLessThan(0);
  });

  it('메모이제이션이 적용된다', () => {
    const mockResult = createMockResult({
      equityCurve: [{ date: '2024-01-01', equity: 10000 }],
      drawdownCurve: [{ date: '2024-01-01', drawdown: 0 }],
    });

    const { result, rerender } = renderHook(() =>
      useBacktestChartData(mockResult),
    );

    const firstResult = result.current;
    rerender();
    const secondResult = result.current;

    expect(firstResult).toBe(secondResult);
  });
});
