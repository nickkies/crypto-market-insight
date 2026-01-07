import { test, expect } from '@playwright/test';

test.describe('Market Page', () => {
  test.beforeEach(async ({ page }) => {
    // API 응답을 기다리며 페이지 로드
    await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes('/api/market/coins'),
      ),
      page.goto('/market'),
    ]);
  });

  test('코인 목록이 표시된다', async ({ page }) => {
    // 로딩이 완료될 때까지 대기
    await expect(page.locator('[data-testid="coin-card"]').first()).toBeVisible(
      {
        timeout: 10000,
      },
    );

    // 코인 카드가 여러 개 표시되는지 확인
    const cards = page.locator('[data-testid="coin-card"]');
    await expect(cards).toHaveCount(20, { timeout: 10000 });
  });

  test('코인 카드에 필수 정보가 표시된다', async ({ page }) => {
    const firstCard = page.locator('[data-testid="coin-card"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });

    // 코인 이미지
    await expect(firstCard.locator('img')).toBeVisible();

    // 코인 이름
    await expect(firstCard.locator('[data-testid="coin-name"]')).toBeVisible();

    // 가격
    await expect(firstCard.locator('[data-testid="coin-price"]')).toBeVisible();

    // 변동률
    await expect(
      firstCard.locator('[data-testid="coin-change"]'),
    ).toBeVisible();
  });

  test('즐겨찾기 토글이 동작한다', async ({ page }) => {
    const firstCard = page.locator('[data-testid="coin-card"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });

    const favoriteButton = firstCard.locator('[data-testid="favorite-button"]');

    // 초기 상태 확인 (비활성)
    await expect(favoriteButton).toHaveText('☆');

    // 클릭하여 활성화
    await favoriteButton.click();
    await expect(favoriteButton).toHaveText('★');

    // 다시 클릭하여 비활성화
    await favoriteButton.click();
    await expect(favoriteButton).toHaveText('☆');
  });

  test('상세 버튼 클릭 시 상세 페이지로 이동한다', async ({ page }) => {
    const firstCard = page.locator('[data-testid="coin-card"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });

    const detailButton = firstCard.locator('[data-testid="detail-button"]');
    await detailButton.click();

    await expect(page).toHaveURL(/\/market\/[a-z-]+/);
  });

  test('스크롤 시 추가 코인이 로드된다', async ({ page }) => {
    // 초기 로드 대기 - 20개 코인이 로드될 때까지
    await expect(page.locator('[data-testid="coin-card"]')).toHaveCount(20, {
      timeout: 10000,
    });

    // 두 번째 API 요청을 추적
    const secondPagePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/market/coins') &&
        response.url().includes('page=2'),
    );

    // 마지막 카드를 스크롤 뷰로 가져와 IntersectionObserver 트리거
    await page
      .locator('[data-testid="coin-card"]')
      .last()
      .scrollIntoViewIfNeeded();

    // Load More Trigger 요소를 뷰포트로 스크롤
    await page
      .locator('[data-testid="load-more-trigger"]')
      .scrollIntoViewIfNeeded();

    // 두 번째 페이지 API 응답 대기
    await secondPagePromise;

    // 21번째 카드가 나타날 때까지 대기 (nth는 0-indexed)
    await expect(page.locator('[data-testid="coin-card"]').nth(20)).toBeVisible(
      {
        timeout: 15000,
      },
    );

    // 최종 카드 수가 20개보다 많은지 확인
    const finalCount = await page.locator('[data-testid="coin-card"]').count();
    expect(finalCount).toBeGreaterThan(20);
  });

  test('검색 입력이 동작한다', async ({ page }) => {
    await expect(page.locator('[data-testid="coin-card"]').first()).toBeVisible(
      {
        timeout: 10000,
      },
    );

    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toBeVisible();

    // 검색어 입력
    await searchInput.fill('bitcoin');

    // 검색 API 요청 대기 (debounce 300ms)
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/market/coins') &&
        response.url().includes('keyword=bitcoin'),
    );

    // 검색 결과 표시 대기
    await expect(
      page.locator('[data-testid="coin-card"]').first(),
    ).toBeVisible();
  });

  test('검색어 클리어 버튼이 동작한다', async ({ page }) => {
    await expect(page.locator('[data-testid="coin-card"]').first()).toBeVisible(
      {
        timeout: 10000,
      },
    );

    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('test');

    // 클리어 버튼 표시 확인
    const clearButton = page.locator('[data-testid="search-clear-button"]');
    await expect(clearButton).toBeVisible();

    // 클리어 버튼 클릭
    await clearButton.click();

    // 입력값이 비워졌는지 확인
    await expect(searchInput).toHaveValue('');
  });

  test('즐겨찾기 필터가 동작한다', async ({ page }) => {
    await expect(page.locator('[data-testid="coin-card"]').first()).toBeVisible(
      {
        timeout: 10000,
      },
    );

    // 필터 탭 확인
    const allTab = page.locator('[data-testid="filter-tab-all"]');
    const favoritesTab = page.locator('[data-testid="filter-tab-favorites"]');
    await expect(allTab).toBeVisible();
    await expect(favoritesTab).toBeVisible();

    // 첫 번째 코인 즐겨찾기 추가
    const firstFavoriteBtn = page
      .locator('[data-testid="coin-card"]')
      .first()
      .locator('[data-testid="favorite-button"]');
    await firstFavoriteBtn.click();
    await expect(firstFavoriteBtn).toHaveText('★');

    // 즐겨찾기 탭으로 전환
    await favoritesTab.click();

    // 즐겨찾기한 코인만 표시됨
    await expect(page.locator('[data-testid="coin-card"]')).toHaveCount(1);

    // 전체 탭으로 다시 전환
    await allTab.click();

    // 모든 코인이 다시 표시됨
    await expect(page.locator('[data-testid="coin-card"]')).toHaveCount(20, {
      timeout: 5000,
    });
  });

  test('즐겨찾기 없을 때 빈 상태 메시지가 표시된다', async ({ page }) => {
    await expect(page.locator('[data-testid="coin-card"]').first()).toBeVisible(
      {
        timeout: 10000,
      },
    );

    // 즐겨찾기 탭으로 전환
    const favoritesTab = page.locator('[data-testid="filter-tab-favorites"]');
    await favoritesTab.click();

    // 빈 상태 컴포넌트 확인
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    await expect(page.getByText('즐겨찾기한 코인이 없습니다')).toBeVisible();
  });
});
