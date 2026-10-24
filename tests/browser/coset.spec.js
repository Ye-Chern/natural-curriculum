import { test, expect } from '@playwright/test';

const standalone = '/experiments/coset-stage.html';
const chapter = '/chapters/coset-actions.html';

test('C6 stage displays actual cosets and detects an invisible nonidentity element', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(standalone);
  await expect(page.locator('[data-interactive]')).toBeVisible();
  await expect(page.locator('[data-cosets]')).toContainText('A = {0, 3}');
  await expect(page.locator('[data-cosets]')).toContainText('B = {1, 4}');
  await page.getByRole('button', { name: '施加一次 g', exact: true }).click();
  await expect(page.locator('[data-trace]')).toHaveText('行走记录：A → B');
  await page.getByLabel('操作 g', { exact: true }).selectOption('3');
  await expect(page.locator('[data-status]')).toContainText('已施加 0 次');
  await page.getByRole('button', { name: '施加一次 g', exact: true }).click();
  await expect(page.locator('[data-trace]')).toHaveText('行走记录：A → A');
  await expect(page.locator('[data-kernel]')).toContainText('{0, 3}');
  await expect(page.locator('[data-orbit]')).toContainText('{A, B, C}');
  await expect(page.locator('[data-faithful]')).toContainText('非忠实');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('coset-c6.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('S3 separates full-group orbit, a transposition cycle, stabilizer and kernel', async ({ page }, testInfo) => {
  await page.goto(standalone);
  await page.getByLabel('选择舞台').selectOption('s3');
  await expect(page.locator('svg')).toHaveAccessibleName(/S3 三角形.*操作 \(12\)/);
  await expect(page.locator('[data-cosets]')).toContainText('(12)H = {(12), (123)}');
  await expect(page.locator('[data-cycle]')).toContainText('1 → 2 → 1');
  await expect(page.locator('[data-orbit]')).toContainText('{1, 2, 3}');
  await expect(page.locator('[data-stabilizer]')).toContainText('{e, (23)}');
  await expect(page.locator('[data-kernel]')).toContainText('{e}');
  await page.getByLabel('观察起点 x').selectOption('1');
  await expect(page.locator('[data-stabilizer]')).toContainText('{e, (13)}');
  await page.getByRole('button', { name: '施加一次 g', exact: true }).click();
  await expect(page.locator('[data-status]')).toContainText('当前位置 1');
  await page.getByRole('button', { name: '回到起点', exact: true }).click();
  await expect(page.locator('[data-status]')).toContainText('已施加 0 次 (12)；当前位置 2');
  await page.getByLabel('操作 g', { exact: true }).selectOption({ label: '(123)' });
  await expect(page.locator('[data-map]')).toContainText('1 → 2；2 → 3；3 → 1');
  await page.screenshot({ path: testInfo.outputPath('coset-s3.png'), fullPage: true });
});

test('native controls support keyboard and long iteration keeps an accurate count', async ({ page }) => {
  await page.goto(standalone);
  await page.getByLabel('选择舞台').focus();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('操作 g', { exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('观察起点 x')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '施加一次 g', exact: true })).toBeFocused();
  for (let step = 0; step < 21; step += 1) await page.keyboard.press('Enter');
  await expect(page.locator('[data-status]')).toHaveText('已施加 21 次 1；当前位置 A。');
  await expect(page.locator('[data-trace]')).toContainText('… → ');
});

test('chapter embeds a working standalone stage and links to it', async ({ page }, testInfo) => {
  test.setTimeout(90000); // Full chapter typesetting also loads MathJax font fragments.
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(chapter);
  await expect(page.locator('mjx-container').first()).toBeVisible({ timeout: 25000 });
  await page.evaluate(async () => {
    await window.MathJax.startup.promise;
    await document.fonts.ready;
  });
  await expect(page.locator('[data-cites="burnside1897-actions"]')).toBeVisible();
  const iframe = page.locator('iframe[src="../experiments/coset-stage.html"]');
  await expect(iframe).toHaveAttribute('title', /陪集/);
  await expect(page.getByRole('link', { name: '单独打开陪集舞台', exact: true })).toHaveAttribute('href', /\/experiments\/coset-stage.html$/);
  await iframe.scrollIntoViewIfNeeded();
  const stage = page.frameLocator('iframe[src="../experiments/coset-stage.html"]');
  await expect(stage.locator('[data-interactive]')).toBeVisible();
  await stage.getByRole('button', { name: '施加一次 g', exact: true }).click();
  await expect(stage.locator('[data-status]')).toContainText('当前位置 B');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (testInfo.project.name === 'mobile') {
    const canReadOverflow = await page.locator('.math.display').evaluateAll(equations => {
      const equation = equations.find(item => item.scrollWidth > item.clientWidth + 1);
      if (!equation || getComputedStyle(equation).overflowX !== 'auto') return false;
      equation.scrollLeft = equation.scrollWidth;
      const canScroll = equation.scrollLeft > 0;
      equation.scrollLeft = 0;
      return canScroll;
    });
    expect(canReadOverflow).toBe(true);
  }
  expect(errors).toEqual([]);
  await iframe.screenshot({ path: testInfo.outputPath('chapter-stage.png') });
  await page.locator('#sec-kernel-core').screenshot({ path: testInfo.outputPath('chapter-proof.png') });
});

test('standalone mathematical explanation remains without JavaScript', async ({ browser, baseURL }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport });
  const page = await context.newPage();
  await page.goto(baseURL + standalone);
  await expect(page.getByRole('heading', { name: '静态实验（无需 JavaScript）' })).toBeVisible();
  await expect(page.locator('.static')).toContainText('整个作用的核只有 {e}');
  await expect(page.locator('[data-interactive]')).toBeHidden();
  await context.close();
});

test('chapter proofs remain readable without JavaScript', async ({ browser, baseURL }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport });
  const page = await context.newPage();
  await page.goto(baseURL + chapter);
  await expect(page.getByRole('heading', { name: /把子群变成位置/ })).toBeVisible();
  await expect(page.locator('main')).toContainText('轨道');
  await expect(page.locator('main')).toContainText('稳定子');
  await context.close();
});
