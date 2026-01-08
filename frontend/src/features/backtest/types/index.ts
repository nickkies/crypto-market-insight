// API 요청/응답 타입
export type StrategyType = 'RSI';

export interface RsiParameters {
  period: number;
  oversold: number;
  overbought: number;
}

export interface BacktestRequestDto {
  coinId: string;
  strategyType: StrategyType;
  parameters: RsiParameters;
  timeframe: string;
  startDate: string;
  endDate: string;
}

export interface MetricsDto {
  cumulativeReturn: number;
  mdd: number;
  winRate: number;
  tradeCount: number;
}

export interface TradeDto {
  entryTime: string;
  exitTime: string;
  entryPrice: number;
  exitPrice: number;
  profit: number;
  profitPercent: number;
}

export interface BacktestResponseDto {
  id: number;
  coinId: string;
  strategyType: StrategyType;
  parameters: RsiParameters;
  timeframe: string;
  startDate: string;
  endDate: string;
  metrics: MetricsDto;
  trades: TradeDto[];
  createdAt: string;
}

// Equity Curve 데이터
export interface EquityCurvePoint {
  date: string;
  equity: number;
}

// Drawdown 데이터
export interface DrawdownPoint {
  date: string;
  drawdown: number;
}

// 확장된 백테스트 결과 (차트 데이터 포함)
export interface BacktestResult extends BacktestResponseDto {
  equityCurve: EquityCurvePoint[];
  drawdownCurve: DrawdownPoint[];
}
