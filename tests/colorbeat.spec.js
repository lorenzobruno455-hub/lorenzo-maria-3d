import { test, expect } from '@playwright/test';

test('Colorbeat theme applies to menus and adjusts outline quality without affecting exploration', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://localhost:5173');
  await expect(page.locator('#start')).toBeVisible();
  const theme = await page.evaluate(() => ({
    sun: getComputedStyle(document.documentElement).getPropertyValue('--cb-sun').trim(),
    overdriveSun: getComputedStyle(document.body).getPropertyValue('--co-sun').trim(),
    titleFont: getComputedStyle(document.querySelector('.welcome-content h2')).fontFamily,
    menuColor: getComputedStyle(document.querySelector('#start')).backgroundColor,
  }));
  expect(theme.sun).toBe('#ffd43b');
  expect(theme.overdriveSun).toBe('#ffe238');
  expect(theme.titleFont).toContain('Barlow Condensed');
  // Vite may finish applying stylesheet changes after the first browser paint.
  await expect.poll(async () => page.locator('#start').evaluate(el => getComputedStyle(el).backgroundColor), { timeout: 5000 }).toBe('rgb(255, 226, 56)');
  await page.screenshot({ path: 'test-results/v06-menu.png' });
  await page.locator('#start').click();
  await page.evaluate(async () => { window.readColorbeat = (await import('/src/systems/diagnostics.js')).getGameState; });
  await expect.poll(async () => page.evaluate(() => window.readColorbeat().outlines)).toBeGreaterThan(0);
  await page.screenshot({ path: 'test-results/v06-courtyard.png' });
  await page.locator('#pause-button').click();
  const detailed=await page.evaluate(()=>window.readColorbeat().outlines);
  await page.locator('#quality').selectOption('low');
  await page.locator('#resume').click();
  await expect.poll(async()=>page.evaluate(()=>window.readColorbeat().outlines)).toBeLessThan(detailed);
  await page.locator('#pause-button').click();
  await page.locator('#quality').selectOption('high');
  await page.locator('#resume').click();
  await page.locator('#pause-button').click();
  await expect.poll(async () => page.evaluate(() => window.readColorbeat().outlines)).toBeGreaterThan(0);
  await page.locator('#resume').click();
  expect(errors).toEqual([]);
});

test('Colorbeat remains operable in narrow portrait layout', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://localhost:5173');
  await expect(page.locator('#start')).toBeVisible();
  await page.screenshot({ path: 'test-results/v06-portrait-menu.png' });
  await page.locator('#start').tap();
  await expect(page.locator('#joystick')).toBeVisible();
  await page.screenshot({ path: 'test-results/v06-portrait-play.png' });
  expect(errors).toEqual([]);
  await context.close();
});
