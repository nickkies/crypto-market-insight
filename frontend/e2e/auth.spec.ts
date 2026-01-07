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
});
