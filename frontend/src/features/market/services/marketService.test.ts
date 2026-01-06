import { describe, it, expect, vi, beforeEach } from 'vitest';
import { marketService } from './marketService';
import { client } from '@/features/common/api';

vi.mock('@/features/common/api', () => ({
  client: {
    get: vi.fn(),
  },
}));

describe('marketService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCoins', () => {
    it('기본 파라미터로 코인 목록을 조회한다', async () => {
      const mockResponse = {
        data: {
          coins: [{ id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' }],
          page: 1,
          size: 10,
        },
      };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      const result = await marketService.getCoins();

      expect(client.get).toHaveBeenCalledWith(
        '/api/market/coins?page=1&size=10',
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('커스텀 파라미터로 코인 목록을 조회한다', async () => {
      const mockResponse = {
        data: {
          coins: [],
          page: 2,
          size: 20,
        },
      };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      const result = await marketService.getCoins({
        page: 2,
        size: 20,
        keyword: 'btc',
      });

      expect(client.get).toHaveBeenCalledWith(
        '/api/market/coins?page=2&size=20&keyword=btc',
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('keyword가 빈 문자열이면 파라미터에 포함하지 않는다', async () => {
      const mockResponse = {
        data: { coins: [], page: 1, size: 10 },
      };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await marketService.getCoins({ keyword: '' });

      expect(client.get).toHaveBeenCalledWith(
        '/api/market/coins?page=1&size=10',
      );
    });
  });

  describe('getCoinDetail', () => {
    it('코인 상세 정보를 조회한다', async () => {
      const mockResponse = {
        data: {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          currentPrice: 97500,
        },
      };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      const result = await marketService.getCoinDetail('bitcoin');

      expect(client.get).toHaveBeenCalledWith('/api/market/coins/bitcoin');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getOhlcv', () => {
    it('기본 타임프레임(1d)으로 OHLCV 데이터를 조회한다', async () => {
      const mockResponse = {
        data: {
          coinId: 'bitcoin',
          timeframe: '1d',
          data: [
            {
              timestamp: 1234567890,
              open: 100,
              high: 110,
              low: 90,
              close: 105,
            },
          ],
        },
      };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      const result = await marketService.getOhlcv('bitcoin');

      expect(client.get).toHaveBeenCalledWith(
        '/api/market/coins/bitcoin/ohlcv?timeframe=1d',
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('지정된 타임프레임으로 OHLCV 데이터를 조회한다', async () => {
      const mockResponse = {
        data: {
          coinId: 'ethereum',
          timeframe: '4h',
          data: [],
        },
      };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      const result = await marketService.getOhlcv('ethereum', '4h');

      expect(client.get).toHaveBeenCalledWith(
        '/api/market/coins/ethereum/ohlcv?timeframe=4h',
      );
      expect(result).toEqual(mockResponse.data);
    });
  });
});
