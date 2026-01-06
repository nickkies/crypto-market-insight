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
}

export interface OhlcvResponseDto {
  coinId: string;
  timeframe: string;
  data: OhlcvDataDto[];
}

export type Timeframe = '1h' | '4h' | '1d' | '1w';

interface GetCoinsParams {
  page?: number;
  size?: number;
  keyword?: string;
}

export const marketService = {
  getCoins: async ({
    page = 1,
    size = 10,
    keyword,
  }: GetCoinsParams = {}): Promise<CoinListResponseDto> => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('size', String(size));
    if (keyword) {
      params.append('keyword', keyword);
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
};
