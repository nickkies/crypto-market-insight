import { useMemo } from 'react';
import type {
  TradeDto,
  EquityCurvePoint,
  DrawdownPoint,
  BacktestResult,
} from '../types';

interface BacktestChartData {
  equityCurve: EquityCurvePoint[];
  drawdownCurve: DrawdownPoint[];
}

function generateChartDataFromTrades(
  trades: TradeDto[],
  initialEquity: number = 10000,
): BacktestChartData {
  if (trades.length === 0) {
    return {
      equityCurve: [
        { date: new Date().toISOString().split('T')[0], equity: initialEquity },
      ],
      drawdownCurve: [
        { date: new Date().toISOString().split('T')[0], drawdown: 0 },
      ],
    };
  }

  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.exitTime).getTime() - new Date(b.exitTime).getTime(),
  );

  const equityCurve: EquityCurvePoint[] = [];
  const drawdownCurve: DrawdownPoint[] = [];

  let currentEquity = initialEquity;
  let peakEquity = initialEquity;

  // 시작점 추가
  const firstDate = new Date(sortedTrades[0].entryTime);
  firstDate.setDate(firstDate.getDate() - 1);
  equityCurve.push({
    date: firstDate.toISOString().split('T')[0],
    equity: initialEquity,
  });
  drawdownCurve.push({
    date: firstDate.toISOString().split('T')[0],
    drawdown: 0,
  });

  sortedTrades.forEach((trade) => {
    // 거래 후 equity 계산
    const returnRate = trade.profitPercent / 100;
    currentEquity = currentEquity * (1 + returnRate);

    // Peak 업데이트
    if (currentEquity > peakEquity) {
      peakEquity = currentEquity;
    }

    // Drawdown 계산
    const drawdown = ((currentEquity - peakEquity) / peakEquity) * 100;

    const exitDate = trade.exitTime.split('T')[0];

    equityCurve.push({
      date: exitDate,
      equity: Math.round(currentEquity),
    });

    drawdownCurve.push({
      date: exitDate,
      drawdown: Number(drawdown.toFixed(2)),
    });
  });

  return { equityCurve, drawdownCurve };
}

export function useBacktestChartData(
  result: BacktestResult,
): BacktestChartData {
  return useMemo(() => {
    // 이미 차트 데이터가 있으면 그대로 사용
    if (result.equityCurve.length > 0 && result.drawdownCurve.length > 0) {
      return {
        equityCurve: result.equityCurve,
        drawdownCurve: result.drawdownCurve,
      };
    }

    // 없으면 trades에서 생성
    return generateChartDataFromTrades(result.trades);
  }, [result]);
}
