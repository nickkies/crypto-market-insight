import { test, expect } from '@playwright/test';

test.describe('Market Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/market');
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

  test('코인 카드 클릭 시 상세 페이지로 이동한다', async ({ page }) => {
    const firstCard = page.locator('[data-testid="coin-card"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });

    await firstCard.click();

    await expect(page).toHaveURL(/\/market\/[a-z-]+/);
  });

  test('스크롤 시 추가 코인이 로드된다', async ({ page }) => {
    // 초기 로드 대기
    await expect(page.locator('[data-testid="coin-card"]').first()).toBeVisible(
      {
        timeout: 10000,
      },
    );

    // 초기 카드 수 확인
    const initialCount = await page
      .locator('[data-testid="coin-card"]')
      .count();

    // 페이지 하단으로 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // 추가 로드 대기
    await page.waitForTimeout(2000);

    // 카드 수가 증가했는지 확인
    const newCount = await page.locator('[data-testid="coin-card"]').count();
    expect(newCount).toBeGreaterThan(initialCount);
  });
});
