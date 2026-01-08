import { test, expect } from '@playwright/test';

test.describe('Backtest Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/backtest');
  });

  test('페이지가 샘플 데이터와 함께 로드된다', async ({ page }) => {
    // 페이지 타이틀 확인
    const pageTitle = page.getByRole('heading', { name: 'Strategy Backtest' });
    await expect(pageTitle).toBeVisible();

    // 샘플 데이터 통계 확인
    const returnStat = page.getByTestId('stat-return');
    await expect(returnStat).toBeVisible();
    await expect(returnStat).toContainText('%');

    const mddStat = page.getByTestId('stat-mdd');
    await expect(mddStat).toBeVisible();

    const winrateStat = page.getByTestId('stat-winrate');
    await expect(winrateStat).toBeVisible();

    const tradesStat = page.getByTestId('stat-trades');
    await expect(tradesStat).toBeVisible();
  });

  test('Trade History 테이블이 표시된다', async ({ page }) => {
    const tradeHistory = page.getByTestId('trade-history');
    await expect(tradeHistory).toBeVisible();

    // 테이블 헤더 확인
    await expect(
      page.getByRole('columnheader', { name: 'Entry Date' }),
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Exit Date' }),
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Entry Price' }),
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Exit Price' }),
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Profit' }),
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Return' }),
    ).toBeVisible();
  });

  test('백테스트 폼이 기본값과 함께 로드된다', async ({ page }) => {
    // 코인 선택 확인
    const coinSelect = page.getByTestId('coin-select');
    await expect(coinSelect).toBeVisible();

    // 전략 선택 확인
    const strategySelect = page.getByTestId('strategy-select');
    await expect(strategySelect).toBeVisible();
    await expect(strategySelect).toHaveValue('RSI');

    // 타임프레임 선택 확인
    const timeframeSelect = page.getByTestId('timeframe-select');
    await expect(timeframeSelect).toBeVisible();
    await expect(timeframeSelect).toHaveValue('1d');

    // RSI 파라미터 기본값 확인
    const periodInput = page.getByTestId('param-period');
    await expect(periodInput).toHaveValue('14');

    const oversoldInput = page.getByTestId('param-oversold');
    await expect(oversoldInput).toHaveValue('30');

    const overboughtInput = page.getByTestId('param-overbought');
    await expect(overboughtInput).toHaveValue('70');
  });

  test('실행 버튼이 표시된다', async ({ page }) => {
    const runButton = page.getByTestId('run-backtest-button');
    await expect(runButton).toBeVisible();
    await expect(runButton).toContainText('Run Backtest');
  });

  test('미인증 사용자에게 로그인 배너가 표시된다', async ({ page }) => {
    const loginBanner = page.getByTestId('login-banner');
    await expect(loginBanner).toBeVisible();
    await expect(loginBanner).toContainText('로그인하면 백테스트 결과를 저장');
  });

  test('파라미터 유효성 검증이 동작한다', async ({ page }) => {
    // Period를 범위 밖으로 설정
    const periodInput = page.getByTestId('param-period');
    await periodInput.fill('1');
    await periodInput.blur();

    // 에러 메시지 확인
    await expect(page.getByText('Period는 2 이상이어야 합니다')).toBeVisible();
  });

  test('타임프레임 변경이 가능하다', async ({ page }) => {
    const timeframeSelect = page.getByTestId('timeframe-select');

    await timeframeSelect.selectOption('4h');
    await expect(timeframeSelect).toHaveValue('4h');

    await timeframeSelect.selectOption('1w');
    await expect(timeframeSelect).toHaveValue('1w');
  });
});
