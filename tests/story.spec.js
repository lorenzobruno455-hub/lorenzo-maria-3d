import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { seed, start, state } from './helpers.js';
const memories = JSON.parse(readFileSync(new URL('../src/data/memories.json', import.meta.url)));
const questions = JSON.parse(readFileSync(new URL('../src/data/quiz.json', import.meta.url)));
const chapterSteps = JSON.parse(readFileSync(new URL('../src/data/chapters.json', import.meta.url)));
async function advance(page) { await page.locator('#dialogue-speed').click(); await page.locator('#next').click(); }
for (let i = 0; i < 6; i++) test(`chapter ${i + 1}: original memory, reward and persistence`, async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const steps = {}; for (let n = 0; n <= i; n++) steps[`chapter-${n + 1}`] = chapterSteps[n].steps.filter(s => s.type !== 'memory').map(s => s.id);
  const m = memories[i]; await seed(page, { stage: 2, collected: ['notebook', 'card', 'photo'], doors: [true, true], position: { x: m.position.x, z: m.position.z + (i===0||i===5?-1.15:i===2?-.7:1.05) }, campaign: { memories: memories.slice(0, i).map(m => m.id), steps } }); await start(page);
  await expect(page.locator('#prompt')).toContainText(m.title); await page.keyboard.press('e'); await advance(page);
  await page.locator('#dialogue-speed').click(); await expect(page.locator('#speech')).toHaveText(m.description); await page.locator('#next').click();
  await expect.poll(async () => (await state(page)).campaign.memories.length).toBe(i + 1);
  expect((await state(page)).campaign.vouchers).toContain(`vale-${i + 1}`);
  await page.locator('#story-menu').click(); await page.locator('#story-content').getByRole('button', { name: 'Álbum', exact: true }).click();
  await expect(page.locator('#story-content')).toContainText(m.title);
  if (i === 5) { await page.locator('#story-close').click(); await page.locator('#story-menu').click(); await page.locator('#story-content').getByRole('button', { name: 'Carta final', exact: true }).click(); await expect(page.locator('.letter-text')).toContainText('feliz 1 mês!!'); }
  await page.reload(); await page.locator('#start').click(); await page.evaluate(async () => { window.readGame = (await import('/src/systems/diagnostics.js')).getGameState; });
  expect((await state(page)).campaign.memories.length).toBe(i + 1); expect(errors).toEqual([]);
});

test('quiz and memory activities launch from actual 3D objects', async ({ page }) => {
  await seed(page, { position: { x: -20, z: -8.9 }, doors: [true, true] }); await start(page);
  await expect(page.locator('#prompt')).toContainText('QUIZ'); await page.keyboard.press('e'); await page.getByRole('button', { name: 'Iniciar atividade' }).click();
  for (const q of questions) { await expect(page.locator('#story-content')).toContainText(q.question); await page.locator('#story-content').getByRole('button', { name: q.options[0], exact: true }).click(); }
  await expect(page.locator('#story-content')).toContainText('6 pontos'); expect((await state(page)).campaign.achievements.quiz).toBeTruthy();
  await page.screenshot({ path: 'test-results/v03-quiz.png' });
});

test('matching cards, dialogue choices and Android album navigation', async ({ page, browser }) => {
  await seed(page, { position: { x: 19, z: -8.9 }, doors: [true, true] }); await start(page); await expect(page.locator('#prompt')).toContainText('MEMÓRIA DE VOCÊS'); await page.keyboard.press('e'); await page.getByRole('button', { name: 'Iniciar atividade' }).click();
  await page.locator('[data-card="0"]').click(); await expect(page.locator('[data-card="0"]')).not.toHaveText('?'); await page.locator('[data-card="1"]').click(); await expect(page.locator('#story-content')).toContainText('1 jogadas');
  await page.locator('#story-close').click(); await page.locator('#story-menu').click(); await page.locator('#story-content').getByRole('button', { name: 'Álbum', exact: true }).click(); await page.getByLabel('Filtrar por raridade').selectOption('LENDÁRIA'); await expect(page.locator('.album-grid article')).toHaveCount(2); await page.getByLabel('Filtrar por data').selectOption('31/03/2026'); await expect(page.locator('.album-grid article')).toHaveCount(1);
  const context = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true }); const mobile = await context.newPage(); await seed(mobile); await start(mobile); await mobile.locator('#story-menu').tap(); await mobile.getByRole('button', { name: 'Conquistas', exact: true }).tap(); await expect(mobile.locator('#story-content .story-card')).toHaveCount(20); await mobile.locator('#story-close').tap(); await expect(mobile.locator('#touch')).toBeVisible(); await context.close();
});

test('rhythm object accepts timed taps and cleans up when leaving', async ({ page }) => {
  await seed(page, { position: { x: 30, z: -9.9 } }); await start(page); await expect(page.locator('#prompt')).toContainText('COMPASSO'); await page.keyboard.press('e'); await page.getByRole('button', { name: 'Iniciar atividade' }).click();
  await page.waitForFunction(() => window.readGame().rhythm > .46 && window.readGame().rhythm < .55);
  await page.keyboard.press('Space'); await expect(page.locator('.rhythm-status')).toContainText('PERFEITO');
  await page.locator('#story-close').click(); const before = await state(page); await page.keyboard.down('s'); await expect.poll(async () => (await state(page)).z).toBeGreaterThan(before.z); await page.keyboard.up('s');
});

test('Maria uses imported creative dialogue with acceleration, choices and exit', async ({ page }) => {
  await seed(page, { stage: 1, collected: [], position: { x: 5, z: 6 } }); await start(page); await page.keyboard.press('e');
  await page.getByRole('button', { name: 'Humor', exact: true }).click(); await page.locator('#dialogue-speed').click(); await expect(page.locator('.dialogue-source')).toContainText('não é transcrição');
  await expect(page.locator('#speech')).not.toHaveText(''); await page.locator('#dialogue-exit').click(); await expect(page.locator('#dialog')).toBeHidden();
});
