import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('페이지가 정상적으로 로드된다', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Crypto Market Insight/);
  });

  test('네비게이션이 표시된다', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('navigation')).toBeVisible();
  });
});
