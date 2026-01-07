import { test, expect } from '@playwright/test';

test.describe('Auth', () => {
  test('로그인 버튼이 표시된다', async ({ page }) => {
    await page.goto('/');

    const loginButton = page.getByRole('button', { name: /login/i });
    await expect(loginButton).toBeVisible();
  });

  test('로그인 버튼 클릭 시 GitHub OAuth로 리다이렉트된다', async ({
    page,
  }) => {
    await page.goto('/');

    const loginButton = page.getByRole('button', { name: /login/i });

    const [request] = await Promise.all([
      page.waitForRequest((req) =>
        req.url().includes('/api/auth/login/github'),
      ),
      loginButton.click(),
    ]);

    expect(request.url()).toContain('/api/auth/login/github');
  });

  test('토큰이 있으면 로그아웃 버튼이 표시된다', async ({ page }) => {
    await page.goto('/');

    await page.evaluate(() => {
      sessionStorage.setItem('token', 'test-token');
    });

    await page.reload();

    const logoutButton = page.getByRole('button', { name: /logout/i });
    await expect(logoutButton).toBeVisible();
  });

  test('로그아웃 시 로그인 버튼이 다시 표시된다', async ({ page }) => {
    await page.goto('/');

    await page.evaluate(() => {
      sessionStorage.setItem('token', 'test-token');
    });

    await page.reload();

    // window.confirm을 true로 반환하도록 설정
    page.on('dialog', (dialog) => dialog.accept());

    const logoutButton = page.getByRole('button', { name: /logout/i });
    await logoutButton.click();

    const loginButton = page.getByRole('button', { name: /login/i });
    await expect(loginButton).toBeVisible();

    const token = await page.evaluate(() => sessionStorage.getItem('token'));
    expect(token).toBeNull();
  });

  test('OAuth 콜백 페이지에서 토큰을 저장하고 리다이렉트한다', async ({
    page,
  }) => {
    await page.goto('/market');

    await page.evaluate(() => {
      sessionStorage.setItem('returnUrl', '/market');
    });

    await page.goto('/oauth/callback?token=test-jwt-token');

    await page.waitForURL('/market');

    const token = await page.evaluate(() => sessionStorage.getItem('token'));
    expect(token).toBe('test-jwt-token');
  });

  test('미인증 시 /my/backtests 접근하면 홈으로 리다이렉트된다', async ({
    page,
  }) => {
    await page.goto('/my/backtests');

    await page.waitForURL('/');

    const returnUrl = await page.evaluate(() =>
      sessionStorage.getItem('returnUrl'),
    );
    expect(returnUrl).toBe('/my/backtests');
  });

  test('인증된 사용자는 /my/backtests에 접근할 수 있다', async ({ page }) => {
    await page.goto('/');

    await page.evaluate(() => {
      sessionStorage.setItem('token', 'test-token');
    });

    await page.goto('/my/backtests');

    const pageTitle = page.getByRole('heading', { name: 'My Backtests' });
    await expect(pageTitle).toBeVisible();
  });

  test('백테스트 페이지에서 미인증 시 로그인 배너가 표시된다', async ({
    page,
  }) => {
    await page.goto('/backtest');

    const loginBanner = page.getByTestId('login-banner');
    await expect(loginBanner).toBeVisible();
  });

  test('백테스트 페이지에서 인증 시 로그인 배너가 숨겨진다', async ({
    page,
  }) => {
    await page.goto('/');

    await page.evaluate(() => {
      sessionStorage.setItem('token', 'test-token');
    });

    await page.goto('/backtest');

    const loginBanner = page.getByTestId('login-banner');
    await expect(loginBanner).not.toBeVisible();
  });
});
