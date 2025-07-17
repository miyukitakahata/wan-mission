import { test } from '@playwright/test';

test('デバッグ：現在の画面をスクリーンショット', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(3000); // ページ読み込み待ち（必要なら調整）
  await page.screenshot({ path: 'tests/evidence/debug_screen.png' });
});
// import { test, expect } from '@playwright/test';
