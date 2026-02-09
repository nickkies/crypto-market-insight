import { describe, it, expect, vi, beforeEach } from 'vitest';
import { marketService } from './marketService';
import { client } from '@/features/common/api';
import { marketFixtures } from '@/test/helpers';

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
      const mockData = marketFixtures.coins();
      vi.mocked(client.get).mockResolvedValue({ data: mockData });

      const result = await marketService.getCoins();

      expect(client.get).toHaveBeenCalledWith(
        '/api/market/coins?page=1&size=10',
      );
      expect(result).toEqual(mockData);
    });

    it('커스텀 파라미터로 코인 목록을 조회한다', async () => {
      const mockData = { ...marketFixtures.coins(), page: 2, size: 20 };
      vi.mocked(client.get).mockResolvedValue({ data: mockData });

      const result = await marketService.getCoins({
        page: 2,
        size: 20,
        keyword: 'btc',
      });

      expect(client.get).toHaveBeenCalledWith(
        '/api/market/coins?page=2&size=20&keyword=btc',
      );
      expect(result).toEqual(mockData);
    });

    it('keyword가 빈 문자열이면 파라미터에 포함하지 않는다', async () => {
      const mockData = marketFixtures.emptyCoins();
      vi.mocked(client.get).mockResolvedValue({ data: mockData });

      await marketService.getCoins({ keyword: '' });

      expect(client.get).toHaveBeenCalledWith(
        '/api/market/coins?page=1&size=10',
      );
    });
  });

  describe('getCoinDetail', () => {
    it('코인 상세 정보를 조회한다', async () => {
      const mockData = marketFixtures.bitcoin();
      vi.mocked(client.get).mockResolvedValue({ data: mockData });

      const result = await marketService.getCoinDetail('bitcoin');

      expect(client.get).toHaveBeenCalledWith('/api/market/coins/bitcoin');
      expect(result).toEqual(mockData);
    });
  });

  describe('getOhlcv', () => {
    it('기본 타임프레임(1d)으로 OHLCV 데이터를 조회한다', async () => {
      const mockData = marketFixtures.ohlcv();
      vi.mocked(client.get).mockResolvedValue({ data: mockData });

      const result = await marketService.getOhlcv('bitcoin');

      expect(client.get).toHaveBeenCalledWith(
        '/api/market/coins/bitcoin/ohlcv?timeframe=1d',
      );
      expect(result).toEqual(mockData);
    });

    it('지정된 타임프레임으로 OHLCV 데이터를 조회한다', async () => {
      const mockData = marketFixtures.emptyOhlcv();
      vi.mocked(client.get).mockResolvedValue({ data: mockData });

      const result = await marketService.getOhlcv('bitcoin', '3d');

      expect(client.get).toHaveBeenCalledWith(
        '/api/market/coins/bitcoin/ohlcv?timeframe=3d',
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('getIndicators', () => {
    it('기술적 지표를 조회한다', async () => {
      const mockData = marketFixtures.indicators();
      vi.mocked(client.get).mockResolvedValue({ data: mockData });

      const result = await marketService.getIndicators('bitcoin');

      expect(client.get).toHaveBeenCalledWith(
        '/api/market/coins/bitcoin/indicators?period=90',
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('getGlobalStats', () => {
    it('글로벌 시장 통계를 조회한다', async () => {
      const mockData = marketFixtures.globalStats();
      vi.mocked(client.get).mockResolvedValue({ data: mockData });

      const result = await marketService.getGlobalStats();

      expect(client.get).toHaveBeenCalledWith('/api/market/global');
      expect(result).toEqual(mockData);
    });
  });
});
