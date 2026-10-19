import { test, expect } from '@playwright/test';

const chapter = '/chapters/cyclic-groups.html';

test('experiment starts without revealing the answer and records an entire orbit', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(chapter);
  const lab = page.locator('[data-cyclic-clock]');
  await expect(lab.locator('[data-status]')).toContainText('已走 0 步');
  await expect(lab.locator('[data-result]')).toBeHidden();
  await page.getByRole('button', { name: '再走一步', exact: true }).click();
  await expect(lab.locator('[data-trace]')).toHaveText('行走记录：0 → 4');
  await page.getByRole('button', { name: '走到首次返回', exact: true }).click();
  await expect(lab.locator('[data-trace]')).toHaveText('行走记录：0 → 4 → 8 → 0');
  await expect(lab.locator('[data-result]')).toContainText('第一次返回 0 需要 3 步');
  await expect(lab.locator('svg')).toHaveAccessibleName(/12 格钟面/);
  await lab.screenshot({ path: testInfo.outputPath('clock.png') });
  await page.getByRole('button', { name: '再走一步', exact: true }).click();
  await expect(lab.locator('[data-trace]')).toHaveText('行走记录：0 → 4 → 8 → 0 → 4（轨道开始重复）');
  await expect(lab.locator('[data-status]')).toContainText('当前位置 4');
  expect(errors).toEqual([]);
});

test('changing parameters resets history; generator and negative steps agree with the text', async ({ page }) => {
  await page.goto(chapter);
  await page.getByLabel('每次步长 k').fill('5');
  await page.getByRole('button', { name: '走到首次返回', exact: true }).click();
  await expect(page.locator('[data-result]')).toContainText('需要 12 步');
  await expect(page.locator('[data-result]')).toContainText('能生成整个循环群');
  await page.getByLabel('钟面格数 n').fill('10');
  await expect(page.locator('[data-result]')).toBeHidden();
  await page.getByLabel('每次步长 k').fill('-4');
  await page.getByRole('button', { name: '走到首次返回', exact: true }).click();
  await expect(page.locator('[data-trace]')).toHaveText('行走记录：0 → 6 → 2 → 8 → 4 → 0');
  await page.getByRole('button', { name: '回到起点', exact: true }).click();
  await expect(page.locator('[data-status]')).toContainText('已走 0 步');
});

test('zero step, n=1 and largest clock remain usable', async ({ page }) => {
  await page.goto(chapter);
  await page.getByLabel('每次步长 k').fill('0');
  await page.getByRole('button', { name: '走到首次返回', exact: true }).click();
  await expect(page.locator('[data-result]')).toContainText('需要 1 步');
  await page.getByLabel('钟面格数 n').fill('1');
  await page.getByRole('button', { name: '走到首次返回', exact: true }).click();
  await expect(page.locator('[data-result]')).toContainText('能生成整个循环群');
  await page.getByLabel('钟面格数 n').fill('36');
  await page.getByLabel('每次步长 k').fill('35');
  await page.getByRole('button', { name: '走到首次返回', exact: true }).click();
  await expect(page.locator('[data-result]')).toContainText('需要 36 步');
  await expect(page.locator('[data-node]')).toHaveCount(36);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('invalid and empty input explains the problem without breaking state', async ({ page }) => {
  await page.goto(chapter);
  await page.getByLabel('钟面格数 n').fill('0');
  await expect(page.locator('[data-error]')).toContainText('请输入');
  await expect(page.getByRole('button', { name: '再走一步', exact: true })).toBeDisabled();
  await page.getByLabel('钟面格数 n').fill('12');
  await page.getByLabel('每次步长 k').fill('');
  await expect(page.getByRole('button', { name: '再走一步', exact: true })).toBeDisabled();
  await page.getByLabel('每次步长 k').fill('-360');
  await expect(page.locator('[data-error]')).toBeEmpty();
  await expect(page.getByRole('button', { name: '再走一步', exact: true })).toBeEnabled();
});

test('experiment can be operated from keyboard', async ({ page }) => {
  await page.goto(chapter);
  await page.getByLabel('钟面格数 n').focus();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('每次步长 k')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '再走一步', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-status]')).toContainText('当前位置 4');
});

test('MathJax, bibliography, navigation and completed event links render', async ({ page }) => {
  await page.goto(chapter);
  await expect(page.locator('mjx-container').first()).toBeVisible({ timeout: 25000 });
  await expect(page.locator('[data-cites="gauss1801"]')).toBeVisible();
  await page.goto('/events.html');
  await expect(page.getByRole('link', { name: '阅读证明', exact: true })).toHaveCount(2);
  await page.getByRole('link', { name: '阅读证明', exact: true }).last().click();
  await expect(page).toHaveURL(/cyclic-groups.html#sec-simple/);
  await page.goto('/references.html');
  await expect(page.locator('#ref-gauss1801')).toBeVisible();
});

test('the static experiment and proofs remain readable without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL + chapter);
  await expect(page.getByText('静态实验（可打印、无需 JavaScript）', { exact: true })).toBeVisible();
  await expect(page.locator('#sec-subgroups')).toContainText('子群分类');
  await expect(page.locator('[data-controls]')).toBeHidden();
  await context.close();
});
