import { test, expect } from '@playwright/test';
import { seed, start, state } from './helpers.js';
async function next(page) { await page.locator('#dialogue-speed').click(); await page.locator('#next').click(); }
async function choose(page, label) { await next(page); await page.getByRole('button', { name: label, exact: true }).click(); }
async function travel(page, x, z) {
  await page.evaluate(({ x, z }) => sessionStorage.setItem('test-travel', JSON.stringify({ x, z })), { x, z });
  await page.addInitScript(() => {
    const destination = sessionStorage.getItem('test-travel'); if (!destination) return;
    sessionStorage.removeItem('test-travel');
    const key = 'lorenzo-maria-v04', raw = JSON.parse(localStorage.getItem(key)); raw.progress.position = JSON.parse(destination); raw.progress.doors = [true, true]; localStorage.setItem(key, JSON.stringify(raw));
  });
  await page.reload(); await page.locator('#start').click(); await page.evaluate(async () => window.readGame = (await import('/src/systems/diagnostics.js')).getGameState);
}

test('free exploration runs five NPC routines and Maria without altering campaign', async ({ page }) => {
  await seed(page); await page.goto('http://localhost:5173'); await page.locator('#welcome-free').click(); await page.evaluate(async () => window.readGame = (await import('/src/systems/diagnostics.js')).getGameState);
  const initial = await state(page); expect(initial.living.mode).toBe('free'); expect(initial.npcs).toHaveLength(6);
  await expect.poll(async () => (await state(page)).npcs.find(n => n.id === 'maria').distance).toBeGreaterThan(.5);
  expect((await state(page)).campaign).toEqual(initial.campaign); await expect(page.locator('#objective')).toContainText('Exploração livre');
  await page.locator('#story-menu').click(); await page.getByRole('button', { name: 'Retomar campanha', exact: true }).click(); expect((await state(page)).living.mode).toBe('campaign');
  await page.screenshot({ path: 'test-results/v04-courtyard.png' });
});

test('lost book: accept, find in library, return, gain friendship and persist', async ({ page }) => {
  await seed(page, { position: { x: -6, z: 18 } }); await start(page); await expect(page.locator('#prompt')).toContainText('Bia'); await page.keyboard.press('e');
  await choose(page, 'Ajudar: O Livro Perdido'); await next(page); expect((await state(page)).living.events['lost-book']).toBe('active');
  await travel(page, 21, -15.8); await expect(page.locator('#prompt')).toContainText('Livro de Bia'); await page.keyboard.press('e'); await next(page);
  expect((await state(page)).living.events['lost-book']).toBe('found'); await travel(page, -6, 18); await page.keyboard.press('e'); await choose(page, 'Devolver o livro'); await next(page);
  const saved = await state(page); expect(saved.living.events['lost-book']).toBe('done'); expect(saved.living.reputation.bia).toBe(2); expect(saved.living.achievements['lost-book']).toBeTruthy();
  await page.keyboard.press('e'); await next(page); await expect(page.getByRole('button', { name: 'Conversa de amizade', exact: true })).toBeVisible(); await page.getByRole('button', { name: 'Conversa de amizade', exact: true }).click(); await choose(page, 'Prefiro conversar'); await next(page);
  expect((await state(page)).living.decisions['friend:bia']).toBe('talk');
  await page.keyboard.press('e'); await choose(page, 'Conversa de amizade'); await choose(page, 'Vamos fazer uma atividade'); await choose(page, 'Biblioteca'); await next(page); expect((await state(page)).living.decisions['bonus:bia']).toBe('won'); expect((await state(page)).living.reputation.bia).toBe(3); await travel(page, -6, 18); expect((await state(page)).living.events['lost-book']).toBe('done');
});

test('physics question offers real choices, explanation and a recoverable interruption', async ({ page }) => {
  await seed(page, { position: { x: -14, z: 1 } }); await start(page); await expect(page.locator('#prompt')).toContainText('Helena'); await page.keyboard.press('e'); await choose(page, 'Ajudar: A Pergunta Impossível');
  await choose(page, 'A mais pesada'); await page.locator('#dialogue-speed').click(); await expect(page.locator('#speech')).toContainText('mesma aceleração gravitacional'); await page.locator('#dialogue-exit').click();
  expect((await state(page)).living.events['physics-question']).toBe('answered'); await page.keyboard.press('e'); await choose(page, 'Ouvir a explicação'); await next(page);
  expect((await state(page)).living.events['physics-question']).toBe('done'); expect((await state(page)).living.decisions['physics-question']).toBe('heavy');
});

test('music encounter requires listening and returning to Davi', async ({ page }) => {
  await seed(page, { position: { x: 12, z: 19 } }); await start(page); await expect(page.locator('#prompt')).toContainText('Davi'); await page.keyboard.press('e'); await choose(page, 'Ajudar: Uma Música Conhecida'); await next(page);
  await travel(page, 31, -12.5); await expect(page.locator('#prompt')).toContainText('Partitura'); await page.keyboard.press('e'); await next(page); await next(page);
  expect((await state(page)).living.events['familiar-music']).toBe('found'); await travel(page, 12, 19); await page.keyboard.press('e'); await choose(page, 'Compartilhar a partitura'); await next(page);
  expect((await state(page)).living.events['familiar-music']).toBe('done'); expect((await state(page)).living.reputation.davi).toBe(2);
  await page.locator('#story-menu').click(); await page.getByRole('button', { name: 'Histórico de conversas', exact: true }).click(); await expect(page.locator('#story-content')).toContainText('PARTITURA');
});

test('canteen and court are interactive without purchases', async ({ page }) => {
  await seed(page, { position: { x: 0, z: -22 } }); await start(page); await expect(page.locator('#prompt')).toContainText('Cardápio'); await page.keyboard.press('e'); await choose(page, 'Pão de queijo');
  expect((await state(page)).living.snacks).toContain('bread'); await travel(page, -33, 6); await expect(page.locator('#prompt')).toContainText('Bola'); await page.keyboard.press('e'); await expect(page.locator('#toast')).toContainText('Bola em jogo');
});

test('Android control size, opacity and individual volumes persist', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true }); const page = await context.newPage(); await seed(page); await start(page);
  const before = await page.locator('#joystick').boundingBox(); await page.locator('#pause-button').tap(); await page.locator('#controls-size').fill('1.3'); await page.locator('#controls-opacity').fill('0.5'); await page.locator('#music-volume').fill('0.2'); await page.locator('#effects-volume').fill('0.7'); await page.locator('#resume').tap();
  const after = await page.locator('#joystick').boundingBox(); expect(after.width).toBeGreaterThan(before.width); await expect(page.locator('#touch')).toHaveCSS('opacity', '0.5');
  await page.reload(); await page.locator('#start').tap(); await page.locator('#pause-button').tap(); await expect(page.locator('#controls-size')).toHaveValue('1.3'); await expect(page.locator('#music-volume')).toHaveValue('0.2'); await expect(page.locator('#effects-volume')).toHaveValue('0.7'); await context.close();
});
