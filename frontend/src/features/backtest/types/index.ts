// API 요청/응답 타입
export type StrategyType =
  | 'RSI'
  | 'MACD'
  | 'BOLLINGER_BANDS'
  | 'MOVING_AVERAGE';

export interface RsiParameters {
  period: number;
  oversold: number;
  overbought: number;
}

export interface MacdParameters {
  fastPeriod: number;
  slowPeriod: number;
  signalPeriod: number;
}

export interface BollingerBandsParameters {
  period: number;
  stdDev: number;
}

export interface MovingAverageParameters {
  shortPeriod: number;
  longPeriod: number;
}

export type StrategyParameters =
  | RsiParameters
  | MacdParameters
  | BollingerBandsParameters
  | MovingAverageParameters;

export interface BacktestRequestDto {
  coinId: string;
  strategyType: StrategyType;
  // 전략별 파라미터 (하나만 사용)
  rsiParameters?: RsiParameters;
  macdParameters?: MacdParameters;
  bollingerBandsParameters?: BollingerBandsParameters;
  movingAverageParameters?: MovingAverageParameters;
  // Backward compatibility
  parameters?: RsiParameters;
  timeframe: string; // 1d=90일, 3d=180일, 1w=365일
  endDate?: string; // 미입력시 오늘, startDate는 타임프레임 기반 자동 계산
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

// 차트 데이터 타입
export interface OhlcvDto {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorValuesDto {
  rsi?: number[];
  macdLine?: number[];
  signalLine?: number[];
  histogram?: number[];
  bbUpper?: number[];
  bbMiddle?: number[];
  bbLower?: number[];
  maShort?: number[];
  maLong?: number[];
}

export interface ChartDataDto {
  timestamps: number[];
  ohlcv: OhlcvDto[];
  indicators: IndicatorValuesDto;
}

export interface BacktestResponseDto {
  id: number | null;
  coinId: string;
  strategyType: StrategyType;
  // Backward compatibility
  parameters?: RsiParameters;
  // 전략별 파라미터
  rsiParameters?: RsiParameters;
  macdParameters?: MacdParameters;
  bollingerBandsParameters?: BollingerBandsParameters;
  movingAverageParameters?: MovingAverageParameters;
  timeframe: string;
  startDate: string; // 타임프레임 기반 자동 계산된 값
  endDate: string;
  metrics: MetricsDto;
  trades: TradeDto[];
  chartData?: ChartDataDto; // 백엔드에서 반환하는 차트 데이터 (샘플 데이터에는 없음)
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

// 전략별 기본값 (90일 분석에 최적화 - 단기 트레이딩용)
export const DEFAULT_RSI_PARAMS: RsiParameters = {
  period: 7, // 14→7: 더 민감한 RSI
  oversold: 45, // 30→45: 더 많은 매수 시그널
  overbought: 55, // 70→55: 더 많은 매도 시그널
};

export const DEFAULT_MACD_PARAMS: MacdParameters = {
  fastPeriod: 5, // 12→5: 빠른 반응
  slowPeriod: 13, // 26→13: 빠른 크로스오버
  signalPeriod: 6, // 9→6: 빠른 시그널
};

export const DEFAULT_BOLLINGER_BANDS_PARAMS: BollingerBandsParameters = {
  period: 10, // 20→10: 더 민감한 밴드
  stdDev: 1.5, // 2.0→1.5: 더 좁은 밴드
};

export const DEFAULT_MOVING_AVERAGE_PARAMS: MovingAverageParameters = {
  shortPeriod: 3, // 10→3: 초단기 MA
  longPeriod: 10, // 20→10: 빠른 크로스오버
};
