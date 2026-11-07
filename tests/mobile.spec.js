import { test, expect } from '@playwright/test';
import { seed, start, state } from './helpers.js';

test.use({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });

test('real multitouch: analogue joystick, camera and run are independent', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message)); await seed(page); await start(page);
  const client = await page.context().newCDPSession(page), r = await page.locator('#joystick').boundingBox(), run = await page.locator('#run').boundingBox();
  const cx = r.x + r.width / 2, cy = r.y + r.height / 2;
  const touch = async (type, points) => client.send('Input.dispatchTouchEvent', { type, touchPoints: points.map(([id, x, y]) => ({ id, x, y, radiusX: 3, radiusY: 3, force: 1 })) });
  await touch('touchStart', [[1, cx + 20, cy - 10]]); await expect.poll(async () => (await state(page)).analog.x).toBeGreaterThan(0); const partial = (await state(page)).analog; expect(Math.hypot(partial.x, partial.z)).toBeGreaterThan(0); expect(Math.hypot(partial.x, partial.z)).toBeLessThan(1);
  await touch('touchStart', [[1, cx + 20, cy - 10], [2, 650, 180], [3, run.x + 30, run.y + 20]]);
  const before = await state(page);
  await touch('touchMove', [[1, cx + 45, cy - 30], [2, 710, 210], [3, run.x + 30, run.y + 20]]);
  await expect.poll(async () => (await state(page)).yaw).not.toBe(before.yaw);
  const during = await state(page); expect(during.running).toBe(true); expect(during.pitch).toBeGreaterThan(before.pitch); expect(Math.hypot(during.analog.x, during.analog.z)).toBeCloseTo(1, 1);
  await touch('touchEnd', []); await expect.poll(async () => Math.hypot(...Object.values((await state(page)).analog))).toBe(0); expect((await state(page)).running).toBe(false);
  expect(errors).toEqual([]); await page.screenshot({ path: 'test-results/v02-android-landscape.png' });
});

test('left-side gestures do not move camera; cancel, blur and overlays clear input', async ({ page }) => {
  await seed(page); await start(page); const c = await page.context().newCDPSession(page);
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ id: 1, x: 360, y: 230 }] });
  await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ id: 1, x: 400, y: 270 }] });
  expect((await state(page)).yaw).toBe(0); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  const r = await page.locator('#joystick').boundingBox();
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ id: 1, x: r.x + r.width - 5, y: r.y + r.height / 2 }] });
  await c.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] }); expect((await state(page)).analog.x).toBe(0);
  await page.evaluate(() => dispatchEvent(new Event('blur'))); expect((await state(page)).paused).toBe(true); expect((await state(page)).running).toBe(false);
  await expect(page.locator('#touch')).toHaveJSProperty('inert', true);
});

test('portrait and landscape keep controls usable and do not overflow', async ({ page }) => {
  await seed(page); await start(page); await expect(page.locator('#touch')).toBeVisible();
  for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport); const j = await page.locator('#joystick').boundingBox(), b = await page.locator('#interact').boundingBox();
    expect(j.x).toBeGreaterThanOrEqual(0); expect(j.y + j.height).toBeLessThanOrEqual(viewport.height); expect(b.x + b.width).toBeLessThanOrEqual(viewport.width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
