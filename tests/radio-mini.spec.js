import { test, expect } from '@playwright/test';
import { seed, start, state } from './helpers.js';

test('radio waits for gameplay and user playback before requesting an MP3', async ({ page }) => {
  const radioRequests = [];
  page.on('request', request => { if (request.url().includes('/radio/audio/')) radioRequests.push(request.url()); });
  await seed(page);
  await page.goto('http://localhost:5173/');
  const radio = page.locator('.lm-radio');
  await expect(radio).toBeHidden();
  await page.locator('#start').click();
  await expect(radio).toBeVisible();
  await expect(radio.locator('select option')).toHaveCount(3);
  await expect(radio.locator('.lm-radio__artist')).toHaveCount(0);
  await expect(radio.locator('.lm-radio__title')).not.toBeEmpty();
  await expect(radio.locator('audio')).toHaveAttribute('preload', 'none');
  const audio = radio.locator('audio');
  const toggle = radio.locator('[data-radio-action="toggle"]');
  await radio.locator('select').selectOption('maria');
  await expect(radio.locator('.lm-radio__title')).not.toBeEmpty();
  expect(radioRequests).toHaveLength(0);
  for (const [station, folder] of [['maria', 'maria'], ['lorenzo', 'lorenzo'], ['juntos', 'juntos']]) {
    if (station !== 'maria') await radio.locator('select').selectOption(station);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-label', 'Pausar');
    await expect.poll(async () => audio.evaluate(element => element.src)).toMatch(new RegExp(`/radio/audio/${folder}/`));
    await expect.poll(async () => audio.evaluate(element => element.currentTime)).toBeGreaterThan(0.2);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-label', 'Reproduzir');
  }
  expect(radioRequests.length).toBeGreaterThan(0);
});

test('station shuffle rounds, history, paused next, and ended auto-advance work', async ({ page }) => {
  await seed(page);
  await start(page);
  const radio = page.locator('.lm-radio');
  const title = radio.locator('.lm-radio__title');
  const next = radio.locator('[data-radio-action="next"]');
  const previous = radio.locator('[data-radio-action="prev"]');
  const toggle = radio.locator('[data-radio-action="toggle"]');
  const audio = radio.locator('audio');

  for (const [station, count] of [['lorenzo', 5], ['maria', 5], ['juntos', 10]]) {
    await radio.locator('select').selectOption(station);
    const seen = new Set();
    for (let i = 0; i < count; i++) {
      const current = await title.textContent();
      expect(current).toBeTruthy();
      seen.add(current);
      if (i < count - 1) await next.click();
    }
    expect(seen.size).toBe(count);
  }

  const current = await title.textContent();
  await previous.click();
  const earlier = await title.textContent();
  expect(earlier).not.toBe(current);
  await next.click();
  await expect(title).toHaveText(current);

  await next.click();
  await expect(toggle).toHaveAttribute('aria-label', 'Reproduzir');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-label', 'Pausar');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-label', 'Reproduzir');
  const pausedTitle = await title.textContent();
  await next.click();
  await expect(toggle).toHaveAttribute('aria-label', 'Reproduzir');
  expect(await title.textContent()).not.toBe(pausedTitle);

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-label', 'Pausar');
  const beforeEnded = await title.textContent();
  const beforeEndedSource = await audio.evaluate(element => element.src);
  await audio.evaluate(element => { element.pause(); element.dispatchEvent(new Event('ended')); });
  await expect(title).not.toHaveText(beforeEnded);
  await expect(toggle).toHaveAttribute('aria-label', 'Pausar');
  const afterEndedSource = await audio.evaluate(element => element.src);
  expect(afterEndedSource).not.toBe('');
  expect(afterEndedSource).not.toBe(beforeEndedSource);

  const beforeStation = await title.textContent();
  await radio.locator('select').selectOption('lorenzo');
  await expect(title).not.toHaveText(beforeStation);
  await expect(toggle).toHaveAttribute('aria-label', 'Pausar');
  await expect(radio).toBeVisible();
  await toggle.focus();
  const zBeforeRadioKey = (await state(page)).z;
  await page.keyboard.press('w');
  await page.waitForTimeout(150);
  expect((await state(page)).z).toBeCloseTo(zBeforeRadioKey, 1);
  await page.evaluate(async () => { const { mountLorenzoMariaRadio } = await import('/src/radio/radio.js'); mountLorenzoMariaRadio(); });
  await expect(page.locator('.lm-radio')).toHaveCount(1);
});

test.describe('radio placement on mobile', () => {
test.use({ hasTouch: true, isMobile: true });

test('radio and virtual movement controls do not overlap in phone portrait or landscape', async ({ page }) => {
  await seed(page);
  await start(page);
  await page.evaluate(() => {
    document.body.classList.add('school-visit');
    document.querySelector('#school-toolbar').hidden = false;
    document.querySelector('#prompt').hidden = false;
  });
  for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    const radio = await page.locator('.lm-radio').boundingBox();
    const parts = await page.locator('.lm-radio').evaluate(element => [...element.children].map(child => ({ className: child.className || child.tagName, rect: (() => { const r = child.getBoundingClientRect(); return { y: r.y, height: r.height }; })(), css: { height: getComputedStyle(child).height, margin: getComputedStyle(child).margin, padding: getComputedStyle(child).padding } })));
    const run = await page.locator('#run').boundingBox();
    const interact = await page.locator('#interact').boundingBox();
    const hud = await Promise.all(['#joystick', '#school-toolbar', '#mission', '#prompt', '#location'].map(async selector => [selector, await page.locator(selector).boundingBox()]));
    for (const [label, control] of [['#run', run], ['#interact', interact], ...hud.filter(([, box]) => box)]) {
      const overlapX = radio.x < control.x + control.width && radio.x + radio.width > control.x;
      const overlapY = radio.y < control.y + control.height && radio.y + radio.height > control.y;
      expect(overlapX && overlapY, `${viewport.width}x${viewport.height}: ${label} overlaps ${JSON.stringify({ radio, control, parts })}`).toBe(false);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
});

test('radio minimizes and restores without interrupting playback', async ({ page }) => {
  await seed(page);
  await start(page);
  const radio = page.locator('.lm-radio');
  await radio.locator('[data-radio-action="toggle"]').click();
  const audio = radio.locator('audio');
  await expect.poll(() => audio.evaluate(a => a.currentTime)).toBeGreaterThan(0.2);
  const source = await audio.evaluate(a => a.src);
  const title = await radio.locator('.lm-radio__title').textContent();
  await radio.getByRole('button', { name: 'Minimizar rádio' }).click();
  await expect(radio.locator('select')).toBeHidden();
  await expect(radio.getByRole('button', { name: 'Expandir rádio' })).toHaveAttribute('aria-expanded', 'false');
  expect(await audio.evaluate(a => a.paused)).toBe(false);
  await radio.getByRole('button', { name: 'Expandir rádio' }).click();
  await expect(radio.locator('select')).toBeVisible();
  await expect(radio.locator('.lm-radio__title')).toHaveText(title);
  expect(await audio.evaluate(a => a.src)).toBe(source);
});
