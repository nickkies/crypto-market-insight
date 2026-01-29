import { client } from '@/features/common/api';

// API 응답 타입
export interface CoinSummaryDto {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  marketCap: number;
  marketCapRank: number;
  priceChangePercentage24h: number;
}

export interface CoinListResponseDto {
  coins: CoinSummaryDto[];
  page: number;
  size: number;
}

export interface CoinMarketDataDto {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  marketCap: number;
  marketCapRank: number;
  totalVolume: number;
  high24h: number;
  low24h: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  circulatingSupply: number;
  totalSupply: number;
  lastUpdated: string;
}

export interface OhlcvDataDto {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
}

export interface OhlcvResponseDto {
  coinId: string;
  timeframe: string;
  data: OhlcvDataDto[];
}

// Indicator Types
export type RsiStatus = 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL';
export type MacdStatus = 'BULLISH' | 'BEARISH';

export interface RsiIndicatorDto {
  value: number | null;
  status: RsiStatus | null;
}

export interface MacdIndicatorDto {
  macd: number | null;
  signal: number | null;
  histogram: number | null;
  status: MacdStatus | null;
}

export interface MaIndicatorDto {
  ma20: number | null;
  ma50: number | null;
}

export interface BollingerBandsIndicatorDto {
  upper: number | null;
  middle: number | null;
  lower: number | null;
}

export interface IndicatorResponseDto {
  coinId: string;
  rsi: RsiIndicatorDto;
  macd: MacdIndicatorDto;
  ma: MaIndicatorDto;
  bollingerBands: BollingerBandsIndicatorDto;
}

export interface GlobalStatsDto {
  totalMarketCap: number;
  total24hVolume: number;
  btcDominance: number;
  activeCryptocurrencies: number;
  marketCapChange24h: number;
}

export type Timeframe = '1d' | '3d' | '1w';

interface GetCoinsParams {
  page?: number;
  size?: number;
  keyword?: string;
  category?: string;
}

export const marketService = {
  getCoins: async ({
    page = 1,
    size = 10,
    keyword,
    category,
  }: GetCoinsParams = {}): Promise<CoinListResponseDto> => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('size', String(size));
    if (keyword) {
      params.append('keyword', keyword);
    }
    if (category) {
      params.append('category', category);
    }

    const { data } = await client.get<CoinListResponseDto>(
      `/api/market/coins?${params.toString()}`,
    );
    return data;
  },

  getCoinDetail: async (coinId: string): Promise<CoinMarketDataDto> => {
    const { data } = await client.get<CoinMarketDataDto>(
      `/api/market/coins/${coinId}`,
    );
    return data;
  },

  getOhlcv: async (
    coinId: string,
    timeframe: Timeframe = '1d',
  ): Promise<OhlcvResponseDto> => {
    const { data } = await client.get<OhlcvResponseDto>(
      `/api/market/coins/${coinId}/ohlcv?timeframe=${timeframe}`,
    );
    return data;
  },

  getIndicators: async (
    coinId: string,
    period: number = 90,
  ): Promise<IndicatorResponseDto> => {
    const { data } = await client.get<IndicatorResponseDto>(
      `/api/market/coins/${coinId}/indicators?period=${period}`,
    );
    return data;
  },

  getGlobalStats: async (): Promise<GlobalStatsDto> => {
    const { data } = await client.get<GlobalStatsDto>('/api/market/global');
    return data;
  },
};
