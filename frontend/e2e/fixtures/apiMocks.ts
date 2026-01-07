import { Page } from '@playwright/test';
import { mockCoins, mockCoinsPage2, createMockCoinsResponse } from './mockData';

/**
 * Market API 모킹 설정
 * CoinGecko API 요청 제한에 영향받지 않도록 mock 데이터 반환
 */
export async function setupMarketApiMocks(page: Page) {
  await page.route('**/api/market/coins**', async (route) => {
    const url = new URL(route.request().url());
    const pageParam = parseInt(url.searchParams.get('page') || '1', 10);
    const keyword = url.searchParams.get('keyword');

    // 검색 요청
    if (keyword) {
      const filtered = mockCoins.filter(
        (coin) =>
          coin.name.toLowerCase().includes(keyword.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(keyword.toLowerCase()),
      );
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createMockCoinsResponse(filtered, 1)),
      });
      return;
    }

    // 페이지네이션
    if (pageParam === 1) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createMockCoinsResponse(mockCoins, 1)),
      });
    } else if (pageParam === 2) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createMockCoinsResponse(mockCoinsPage2, 2)),
      });
    } else {
      // 3페이지 이상은 빈 배열
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createMockCoinsResponse([], pageParam)),
      });
    }
  });

  // 코인 상세 API mock (필요시)
  await page.route('**/api/market/coins/*', async (route) => {
    const url = route.request().url();
    const coinId = url.split('/').pop()?.split('?')[0];
    const coin = mockCoins.find((c) => c.id === coinId);

    if (coin) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...coin,
          description: `${coin.name} is a cryptocurrency.`,
          high24h: coin.currentPrice * 1.05,
          low24h: coin.currentPrice * 0.95,
          circulatingSupply: 19000000,
          totalSupply: 21000000,
        }),
      });
    } else {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Coin not found' }),
      });
    }
  });
}

/**
 * 모든 외부 API 의존성 제거를 위한 전체 mock 설정
 */
export async function setupAllApiMocks(page: Page) {
  await setupMarketApiMocks(page);
}
