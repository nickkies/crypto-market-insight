import { test, expect } from '@playwright/test';

const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
};

test.describe('Responsive Layout - Mobile (375px)', () => {
  test.use({ viewport: viewports.mobile });

  test('Home 페이지에서 가로 스크롤이 없다', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth,
    );

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('Market 페이지에서 가로 스크롤이 없다', async ({ page }) => {
    await page.goto('/market');
    await page.waitForLoadState('networkidle');

    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth,
    );

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('Backtest 페이지에서 가로 스크롤이 없다', async ({ page }) => {
    await page.goto('/backtest');
    await page.waitForLoadState('networkidle');

    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth,
    );

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('Header 네비게이션이 표시된다', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Market' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Backtest' })).toBeVisible();
  });
});

test.describe('Responsive Layout - Mobile Chart Carousel', () => {
  test.use({ viewport: viewports.mobile });

  test('Market 페이지에서 차트 캐로셀 탭이 표시된다', async ({ page }) => {
    await page.goto('/market');
    await page.waitForLoadState('networkidle');

    // 캐로셀 탭 확인
    await expect(page.getByRole('button', { name: 'Price' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Indicators' }),
    ).toBeVisible();
  });

  test('캐로셀 탭 전환이 동작한다', async ({ page }) => {
    await page.goto('/market');
    await page.waitForLoadState('networkidle');

    // Indicators 탭 클릭
    await page.getByRole('button', { name: 'Indicators' }).click();

    // Price 탭 다시 클릭
    await page.getByRole('button', { name: 'Price' }).click();
  });
});

test.describe('Responsive Layout - Tablet (768px)', () => {
  test.use({ viewport: viewports.tablet });

  test('Home 페이지 레이아웃이 정상이다', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('home-page')).toBeVisible();

    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth,
    );

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('Market 페이지 레이아웃이 정상이다', async ({ page }) => {
    await page.goto('/market');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('market-page')).toBeVisible();

    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth,
    );

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('Backtest 페이지 레이아웃이 정상이다', async ({ page }) => {
    await page.goto('/backtest');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('backtest-page')).toBeVisible();

    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth,
    );

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
});

test.describe('Responsive Layout - Desktop (1280px)', () => {
  test.use({ viewport: viewports.desktop });

  test('Home 페이지 기존 레이아웃 유지', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('home-page')).toBeVisible();
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('Market 페이지 기존 레이아웃 유지', async ({ page }) => {
    await page.goto('/market');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('market-page')).toBeVisible();
  });

  test('Backtest 페이지 기존 레이아웃 유지', async ({ page }) => {
    await page.goto('/backtest');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('backtest-page')).toBeVisible();
  });
});
