import { client } from '@/features/common/api';
import type {
  BacktestRequestDto,
  BacktestResponseDto,
  BacktestResult,
  EquityCurvePoint,
  DrawdownPoint,
} from '../types';

// 거래 내역에서 Equity Curve 생성
function generateEquityCurve(
  trades: BacktestResponseDto['trades'],
  initialCapital: number = 10000,
): EquityCurvePoint[] {
  const curve: EquityCurvePoint[] = [];
  let equity = initialCapital;

  // 시작점 추가
  if (trades.length > 0) {
    const firstTradeDate = trades[0].entryTime.split('T')[0];
    curve.push({ date: firstTradeDate, equity: initialCapital });
  }

  for (const trade of trades) {
    // 거래 수익률 적용
    equity = equity * (1 + trade.profitPercent / 100);
    curve.push({
      date: trade.exitTime.split('T')[0],
      equity: Math.round(equity),
    });
  }

  return curve;
}

// Equity Curve에서 Drawdown 계산
function generateDrawdownCurve(
  equityCurve: EquityCurvePoint[],
): DrawdownPoint[] {
  const drawdownCurve: DrawdownPoint[] = [];
  let peak = 0;

  for (const point of equityCurve) {
    if (point.equity > peak) {
      peak = point.equity;
    }
    const drawdown = peak > 0 ? ((point.equity - peak) / peak) * 100 : 0;
    drawdownCurve.push({
      date: point.date,
      drawdown: Math.round(drawdown * 100) / 100,
    });
  }

  return drawdownCurve;
}

// API 응답을 확장된 BacktestResult로 변환
function toBacktestResult(response: BacktestResponseDto): BacktestResult {
  const equityCurve = generateEquityCurve(response.trades);
  const drawdownCurve = generateDrawdownCurve(equityCurve);

  return {
    ...response,
    equityCurve,
    drawdownCurve,
  };
}

export const backtestService = {
  runBacktest: async (request: BacktestRequestDto): Promise<BacktestResult> => {
    const { data } = await client.post<BacktestResponseDto>(
      '/api/backtests',
      request,
    );
    return toBacktestResult(data);
  },

  getBacktest: async (id: number): Promise<BacktestResult> => {
    const { data } = await client.get<BacktestResponseDto>(
      `/api/backtests/${id}`,
    );
    return toBacktestResult(data);
  },

  getMyBacktests: async (): Promise<BacktestResult[]> => {
    const { data } = await client.get<BacktestResponseDto[]>('/api/backtests');
    return data.map(toBacktestResult);
  },

  deleteBacktest: async (id: number): Promise<void> => {
    await client.delete(`/api/backtests/${id}`);
  },
};
