import type {
  CoinMarketDataDto,
  CoinListResponseDto,
  CoinSummaryDto,
  OhlcvResponseDto,
  IndicatorResponseDto,
  GlobalStatsDto,
} from '@/features/market/services';
import type { BacktestResponseDto } from '@/features/backtest/types';

// Market Happy Fixtures
import bitcoinJson from '../fixtures/market/happy/bitcoin.json';
import ethereumJson from '../fixtures/market/happy/ethereum.json';
import coinsJson from '../fixtures/market/happy/coins.json';
import coinsExtendedJson from '../fixtures/market/happy/coins-extended.json';
import coinsPage2Json from '../fixtures/market/happy/coins-page2.json';
import ohlcvJson from '../fixtures/market/happy/ohlcv.json';
import indicatorsJson from '../fixtures/market/happy/indicators.json';
import globalStatsJson from '../fixtures/market/happy/global-stats.json';

// Market Edge Fixtures
import emptyCoinsJson from '../fixtures/market/edge/empty-coins.json';
import nullFieldsJson from '../fixtures/market/edge/null-fields.json';
import emptyOhlcvJson from '../fixtures/market/edge/empty-ohlcv.json';

// Market Error Fixtures
import rateLimitJson from '../fixtures/market/error/rate-limit.json';
import serverErrorJson from '../fixtures/market/error/server-error.json';

// Backtest Happy Fixtures
import backtestResultJson from '../fixtures/backtest/happy/result.json';
import backtestHistoryJson from '../fixtures/backtest/happy/history.json';

// Backtest Edge Fixtures
import emptyTradesJson from '../fixtures/backtest/edge/empty-trades.json';

/**
 * Market domain fixtures
 *
 * Note: JSON fixtures with null fields use `unknown` intermediate cast
 * to support edge case testing (e.g., nullable API responses)
 */
export const marketFixtures = {
  // Happy path
  bitcoin: () => bitcoinJson as CoinMarketDataDto,
  ethereum: () => ethereumJson as unknown as CoinMarketDataDto,
  coins: () => coinsJson as CoinListResponseDto,
  coinsList: () => (coinsJson as CoinListResponseDto).coins,
  coinsExtended: () => coinsExtendedJson as CoinListResponseDto,
  coinsExtendedList: () => (coinsExtendedJson as CoinListResponseDto).coins,
  coinsPage2: () => coinsPage2Json as CoinListResponseDto,
  coinsPage2List: () => (coinsPage2Json as CoinListResponseDto).coins,
  ohlcv: () => ohlcvJson as OhlcvResponseDto,
  indicators: () => indicatorsJson as IndicatorResponseDto,
  globalStats: () => globalStatsJson as GlobalStatsDto,

  // Edge cases (may contain null fields for testing null handling)
  emptyCoins: () => emptyCoinsJson as CoinListResponseDto,
  nullFields: () => nullFieldsJson as unknown as CoinMarketDataDto,
  emptyOhlcv: () => emptyOhlcvJson as OhlcvResponseDto,

  // Error responses
  rateLimitError: () => rateLimitJson as { code: string; message: string },
  serverError: () => serverErrorJson as { code: string; message: string },
};

/**
 * Backtest domain fixtures
 */
export const backtestFixtures = {
  // Happy path
  result: () => backtestResultJson as BacktestResponseDto,
  history: () => backtestHistoryJson as BacktestResponseDto[],

  // Edge cases
  emptyTrades: () => emptyTradesJson as BacktestResponseDto,
};

/**
 * Helper to create a coin summary from full market data
 */
export const toCoinSummary = (coin: CoinMarketDataDto): CoinSummaryDto => ({
  id: coin.id,
  symbol: coin.symbol,
  name: coin.name,
  image: coin.image,
  currentPrice: coin.currentPrice,
  marketCap: coin.marketCap,
  marketCapRank: coin.marketCapRank,
  priceChangePercentage24h: coin.priceChangePercentage24h,
});
