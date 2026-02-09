/**
 * E2E Test Mock Data
 *
 * Unit test fixture와 동일한 JSON 파일을 사용하여 데이터 중복을 제거합니다.
 */
import coinsExtendedJson from '../../src/test/fixtures/market/happy/coins-extended.json';
import coinsPage2Json from '../../src/test/fixtures/market/happy/coins-page2.json';

import type { CoinSummaryDto } from '../../src/features/market/services';

// Type assertion for imported JSON
type CoinListResponse = {
  coins: CoinSummaryDto[];
  page: number;
  size: number;
};

// 1페이지 데이터 (20개)
export const mockCoins = (coinsExtendedJson as CoinListResponse).coins;

// 2페이지 데이터
export const mockCoinsPage2 = (coinsPage2Json as CoinListResponse).coins;

// 검색 결과 mock (bitcoin만 필터링)
export const mockSearchResult = mockCoins.filter(
  (coin) => coin.id === 'bitcoin',
);

/**
 * 코인 응답 생성 헬퍼
 */
export function createMockCoinsResponse(
  coins: CoinSummaryDto[],
  page: number,
  size: number = 20,
) {
  return {
    coins,
    page,
    size,
  };
}
