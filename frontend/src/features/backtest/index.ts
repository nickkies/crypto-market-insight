// Components
export {
  BacktestForm,
  StrategySelect,
  ParameterForm,
  CoinSelect,
  TimeframeSelect,
  ResultSummary,
  EquityCurve,
  DrawdownChart,
  MonthlyReturnsChart,
} from './components';
export type { BacktestFormValues } from './components';

// Hooks
export { useRunBacktest, useBacktestChartData } from './hooks';

// Services
export { backtestService, sampleBacktestResult } from './services';

// Types
export type {
  StrategyType,
  RsiParameters,
  BacktestRequestDto,
  BacktestResponseDto,
  BacktestResult,
  MetricsDto,
  TradeDto,
  EquityCurvePoint,
  DrawdownPoint,
} from './types';
