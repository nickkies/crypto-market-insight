import { beforeEach, describe, expect, it } from 'vitest';
import { useMarketStore } from './useMarketStore';

describe('useMarketStore', () => {
  beforeEach(() => {
    useMarketStore.setState({
      selectedCoinId: null,
      timeframe: '1d',
      searchQuery: '',
      sortOrder: 'market_cap_desc',
    });
  });

  describe('setSelectedCoinId', () => {
    it('선택된 코인 ID를 설정한다', () => {
      useMarketStore.getState().setSelectedCoinId('bitcoin');

      expect(useMarketStore.getState().selectedCoinId).toBe('bitcoin');
    });

    it('null로 선택을 해제한다', () => {
      useMarketStore.setState({ selectedCoinId: 'bitcoin' });

      useMarketStore.getState().setSelectedCoinId(null);

      expect(useMarketStore.getState().selectedCoinId).toBeNull();
    });
  });

  describe('setTimeframe', () => {
    it('타임프레임을 변경한다', () => {
      useMarketStore.getState().setTimeframe('3d');

      expect(useMarketStore.getState().timeframe).toBe('3d');
    });
  });

  describe('setSearchQuery', () => {
    it('검색어를 설정한다', () => {
      useMarketStore.getState().setSearchQuery('bitcoin');

      expect(useMarketStore.getState().searchQuery).toBe('bitcoin');
    });
  });

  describe('setSortOrder', () => {
    it('정렬 순서를 변경한다', () => {
      useMarketStore.getState().setSortOrder('price_desc');

      expect(useMarketStore.getState().sortOrder).toBe('price_desc');
    });
  });
});
