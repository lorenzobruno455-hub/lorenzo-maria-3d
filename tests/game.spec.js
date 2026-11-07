import { test, expect } from '@playwright/test';
import { seed, start, state, move } from './helpers.js';

test('explore courtyard, move, run and talk to Maria without runtime errors', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await seed(page); await start(page); await expect(page.locator('#welcome')).toBeHidden();
  await move(page, 'd', 'x', 5, 'greater'); await page.keyboard.down('Shift'); await move(page, 'w', 'z', 6); await page.keyboard.up('Shift');
  await expect(page.locator('#prompt')).toContainText('Maria'); await page.keyboard.press('e');
  await expect(page.locator('#dialog')).toBeVisible(); await expect(page.locator('#speech')).toContainText('três lembranças');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.locator('#objective')).toContainText('três lembranças');
  expect((await state(page)).stage).toBe(1); expect(errors).toEqual([]);
  await page.screenshot({ path: 'test-results/v02-desktop.png' });
});

test('wall collision, door interaction and camera wall contraction', async ({ page }) => {
  await seed(page, { position: { x: -17, z: -3.4 }, yaw: Math.PI, pitch: .2 }); await start(page);
  await expect(page.locator('#prompt')).toContainText('Abrir'); const initial = await state(page); expect(initial.camera.distance).toBeLessThan(7);
  await page.keyboard.down('s'); await page.waitForTimeout(1100); await page.keyboard.up('s');
  expect((await state(page)).z).toBeGreaterThan(-5.6);
  // A safe distance is required to avoid sweeping the door into the player.
  await move(page, 'w', 'z', -3.3, 'greater');
  await page.keyboard.press('e'); await expect.poll(async () => (await state(page)).doors[0].open).toBe(true);
  await expect.poll(async () => (await state(page)).doors[0].angle).toBeGreaterThan(1.3);
  await page.keyboard.down('s'); await move(page, 's', 'z', -7); await page.keyboard.up('s');
  expect((await state(page)).z).toBeLessThan(-6);
});

test('collection, dialogue completion, persistence and settings', async ({ page }) => {
  await seed(page, { stage: 1, collected: ['notebook', 'card'], position: { x: 10, z: 21 } }); await start(page);
  await expect(page.locator('#prompt')).toContainText('Fotografia'); await page.keyboard.press('e');
  await expect(page.locator('#toast')).toContainText('encontrado'); await expect.poll(async () => (await state(page)).collected).toBe(3);
  await page.locator('#pause-button').click(); await page.locator('#quality').selectOption('high'); await page.locator('#shadows').uncheck();
  await page.locator('#resume').click(); await page.reload(); await page.locator('#start').click();
  await page.evaluate(async () => { window.readGame = (await import('/src/systems/diagnostics.js')).getGameState; });
  expect((await state(page)).collected).toBe(3); expect((await state(page)).quality).toBe('high');
  // Continue through the actual game, using the already collected items.
  await page.keyboard.down('Shift'); await move(page, 'a', 'x', 5); await move(page, 'w', 'z', 6); await page.keyboard.up('Shift');
  await expect(page.locator('#prompt')).toContainText('Maria'); await page.keyboard.press('e'); await expect(page.locator('#speech')).toContainText('Você encontrou tudo');
  await page.locator('#next').click(); expect((await state(page)).stage).toBe(2); await expect(page.locator('#count')).toContainText('concluído');
});

test('pause stops movement and reset requires explicit confirmation', async ({ page }) => {
  await seed(page, { stage: 1, collected: ['card'] }); await start(page);
  await page.keyboard.press('Escape'); const before = await state(page); await page.keyboard.down('w'); await page.waitForTimeout(300); await page.keyboard.up('w');
  expect((await state(page)).z).toBe(before.z); await page.locator('#restart').click(); await page.locator('#cancel-reset').click(); expect((await state(page)).collected).toBe(1);
  await page.locator('#restart').click(); await page.locator('#confirm-reset').click(); expect((await state(page)).collected).toBe(0); expect((await state(page)).stage).toBe(0);
});

for (const [x, item] of [[-14, 'Caderno'], [14, 'Cartão']]) test(`collect ${item} inside its classroom`, async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await seed(page, { stage: 1, collected: [], doors: [true, true], position: { x, z: -9.4 } }); await start(page);
  await expect(page.locator('#prompt')).toContainText(item); await page.keyboard.press('e');
  await expect.poll(async () => (await state(page)).collected).toBe(1); await expect(page.locator('#toast')).toContainText('encontrado');
  await page.reload(); await page.locator('#start').click(); await page.evaluate(async () => { window.readGame = (await import('/src/systems/diagnostics.js')).getGameState; });
  expect((await state(page)).collected).toBe(1); expect((await state(page)).doors[x < 0 ? 0 : 1].open).toBe(true); expect(errors).toEqual([]);
});

test('mouse controls both camera axes and sensitivity is saved', async ({ page }) => {
  await seed(page, {}, { sensitivity: .5 }); await start(page);
  await page.mouse.move(500, 230); await page.mouse.down(); await page.mouse.move(550, 260); await page.mouse.up();
  await expect.poll(async () => (await state(page)).yaw).toBeLessThan(-.05);
  const result = await state(page); expect(result.pitch).toBeGreaterThan(.38);
  await page.locator('#pause-button').click(); await page.locator('#sensitivity').fill('2');
  const value = await page.evaluate(() => JSON.parse(localStorage.getItem('lorenzo-maria-v04')).settings.sensitivity); expect(value).toBe(2);
});

test('toolbar focus does not steal WASD and static batching keeps draw calls bounded', async ({ page }) => {
  await seed(page); await start(page); await page.locator('#sound').click(); const initial = await state(page);
  await move(page, 'd', 'x', initial.x + .4, 'greater');
  const after = await state(page); expect(after.x).toBeGreaterThan(initial.x); expect(after.drawCalls).toBeLessThan(160); expect(after.geometries).toBeLessThan(110);
});
