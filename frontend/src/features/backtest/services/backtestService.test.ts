import { describe, it, expect, vi, beforeEach } from 'vitest';
import { backtestService } from './backtestService';
import { client } from '@/features/common/api';
import type { BacktestRequestDto, BacktestResponseDto } from '../types';

vi.mock('@/features/common/api', () => ({
  client: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockBacktestResponse: BacktestResponseDto = {
  id: 1,
  coinId: 'bitcoin',
  strategyType: 'RSI',
  timeframe: '1d',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  metrics: {
    tradeCount: 5,
    winRate: 60,
    mdd: -10,
    cumulativeReturn: 15.5,
  },
  trades: [
    {
      entryTime: '2024-01-05T00:00:00Z',
      exitTime: '2024-01-10T00:00:00Z',
      entryPrice: 40000,
      exitPrice: 42000,
      profit: 2000,
      profitPercent: 5,
    },
    {
      entryTime: '2024-01-15T00:00:00Z',
      exitTime: '2024-01-20T00:00:00Z',
      entryPrice: 42000,
      exitPrice: 43000,
      profit: 1000,
      profitPercent: 2.38,
    },
  ],
  createdAt: '2024-01-31T12:00:00Z',
};

const mockRequest: BacktestRequestDto = {
  coinId: 'bitcoin',
  strategyType: 'RSI',
  timeframe: '1d',
  rsiParameters: { period: 14, overbought: 70, oversold: 30 },
};

describe('backtestService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('runBacktest', () => {
    it('백테스트를 실행하고 결과를 반환한다', async () => {
      vi.mocked(client.post).mockResolvedValue({ data: mockBacktestResponse });

      const result = await backtestService.runBacktest(mockRequest);

      expect(client.post).toHaveBeenCalledWith('/api/backtests', mockRequest);
      expect(result.id).toBe(1);
      expect(result.coinId).toBe('bitcoin');
      expect(result.trades).toHaveLength(2);
    });

    it('equityCurve와 drawdownCurve를 생성한다', async () => {
      vi.mocked(client.post).mockResolvedValue({ data: mockBacktestResponse });

      const result = await backtestService.runBacktest(mockRequest);

      expect(result.equityCurve).toBeDefined();
      expect(result.equityCurve.length).toBeGreaterThan(0);
      expect(result.drawdownCurve).toBeDefined();
      expect(result.drawdownCurve.length).toBeGreaterThan(0);
    });

    it('equityCurve가 올바른 equity 값을 계산한다', async () => {
      vi.mocked(client.post).mockResolvedValue({ data: mockBacktestResponse });

      const result = await backtestService.runBacktest(mockRequest);

      // 초기 equity: 10000
      // 첫 번째 거래 후: 10000 * 1.05 = 10500
      // 두 번째 거래 후: 10500 * 1.0238 = 10750 (반올림)
      expect(result.equityCurve[0].equity).toBe(10000);
      expect(result.equityCurve[1].equity).toBe(10500);
      expect(result.equityCurve[2].equity).toBe(10750);
    });

    it('API 에러 시 예외를 throw한다', async () => {
      vi.mocked(client.post).mockRejectedValue(new Error('API Error'));

      await expect(backtestService.runBacktest(mockRequest)).rejects.toThrow(
        'API Error',
      );
    });
  });

  describe('getBacktest', () => {
    it('백테스트 결과를 조회한다', async () => {
      vi.mocked(client.get).mockResolvedValue({ data: mockBacktestResponse });

      const result = await backtestService.getBacktest(1);

      expect(client.get).toHaveBeenCalledWith('/api/backtests/1');
      expect(result.id).toBe(1);
    });
  });

  describe('getMyBacktests', () => {
    it('내 백테스트 목록을 조회한다', async () => {
      vi.mocked(client.get).mockResolvedValue({
        data: [mockBacktestResponse],
      });

      const result = await backtestService.getMyBacktests();

      expect(client.get).toHaveBeenCalledWith('/api/backtests');
      expect(result).toHaveLength(1);
      expect(result[0].equityCurve).toBeDefined();
    });

    it('빈 목록을 반환할 수 있다', async () => {
      vi.mocked(client.get).mockResolvedValue({ data: [] });

      const result = await backtestService.getMyBacktests();

      expect(result).toHaveLength(0);
    });
  });

  describe('deleteBacktest', () => {
    it('백테스트를 삭제한다', async () => {
      vi.mocked(client.delete).mockResolvedValue({ data: undefined });

      await backtestService.deleteBacktest(1);

      expect(client.delete).toHaveBeenCalledWith('/api/backtests/1');
    });
  });
});
