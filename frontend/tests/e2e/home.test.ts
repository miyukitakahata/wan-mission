import { test, expect } from '@playwright/test';

test('TC-FE001 あさごはんボタンが有効化される', async ({ page }) => {
  await page.goto('http://localhost:3000');

  const button = await page.getByRole('button', { name: 'あさごはん' });

  // ボタンが有効であることを確認
  await expect(button).toBeEnabled();

  await page.screenshot({
    path: 'tests/evidence/TC-FE001_asagohan_enabled.png',
  });
});

// import { test, expect } from '@playwright/test';

// test('TC-FE001 ごはんボタンが有効化される', async ({ page }) => {
//   await page.goto('http://localhost:3000');
//   const button = await page.getByRole('button', { name: 'ごはん' });
//   await expect(button).toBeEnabled();
//   await page.screenshot({ path: 'tests/evidence/TC-FE001_gohan_enabled.png' });
// });

// test('TC-FE002 ごはんボタン押下でAPIが呼ばれる', async ({ page }) => {
//   await page.route('**/api/care_logs**', async (route) => {
//     console.log('📡 APIが呼ばれました:', route.request().url());
//     await route.continue();
//   });

//   await page.goto('http://localhost:3000');
//   await page.getByRole('button', { name: 'ごはん' }).click();
//   await page.screenshot({ path: 'tests/evidence/TC-FE002_api_called.png' });
// });

// test('TC-FE003 お散歩画面に遷移する', async ({ page }) => {
//   await page.goto('http://localhost:3000');
//   await page.getByRole('button', { name: 'おさんぽ' }).click();
//   await expect(page).toHaveURL(/\/walk/);
//   await page.screenshot({ path: 'tests/evidence/TC-FE003_walk_navi.png' });
// });
