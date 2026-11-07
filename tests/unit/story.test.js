import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { freshCampaign, validateCampaign, questEvent, unlockMemory, nextStep, recordGame, memories } from '../../src/systems/quests.js';
import { checkAchievements } from '../../src/systems/achievements.js';
import { MatchingGame, QuizGame, RhythmGame } from '../../src/systems/minigames.js';
import { loadSave, saveProgress, SAVE_KEY, LEGACY_SAVE_KEY } from '../../src/systems/progress.js';
const data = name => JSON.parse(readFileSync(new URL(`../../src/data/${name}.json`, import.meta.url), 'utf8'));
test('Color import has all exact datasets and no repeated dialogue IDs or text', () => {
  const rows = data('dialogues'), report = data('import-report'); assert.equal(rows.length, 154); assert.equal(new Set(rows.map(d => d.id)).size, 154); assert.equal(new Set(rows.map(d => d.text)).size, 154);
  assert.deepEqual(report.counts, { LL: 64, MM: 63, NN: 27, memories: 6, achievements: 17, visibleAchievements: 16, secretAchievements: 1, minigames: 8, quiz: 6, vouchers: 12 });
  assert(rows.every(d => d.provenance === 'creative-fiction')); assert.equal(data('minigames').filter(g => g.playable).length, 3);
  assert.deepEqual(memories.map(m => m.date), ['19/08/2024', '19/05/2025', '17/08/2025', '31/03/2026', '05/09/2026', '21/09/2026']);
  assert(data('rewards').letter.text.endsWith('Eu Te Amo muito Maria, feliz 1 mês!!'));
});
test('six sequential chapters unlock memories, vouchers and final letter without unavailable games', () => {
  const c = freshCampaign(); assert.equal(unlockMemory(c, 'memory-1'), false); assert.equal(unlockMemory(c, 'memory-6'), false);
  for (const memory of memories) { while (nextStep(c)?.type !== 'memory') assert(questEvent(c, nextStep(c).type)); assert(unlockMemory(c, memory.id)); assert.equal(unlockMemory(c, memory.id), false); }
  assert.equal(c.memories.length, 6); assert.equal(c.vouchers.length, 6); assert(c.letter); assert(checkAchievements(c).some(a => a.id === 'album')); assert.equal(nextStep(c), null);
  assert.equal(validateCampaign(c).letter, true); assert.equal(validateCampaign({ memories: ['memory-6'], letter: true }).letter, false);
});
test('original achievements use real game thresholds and unlock once', () => {
  const c = freshCampaign(); c.talks = 20; recordGame(c, 'quiz', 5, true); recordGame(c, 'rit', 12, true); recordGame(c, 'mem', 94, true);
  const unlocked = checkAchievements(c); assert(unlocked.some(a => a.id === 'conv')); assert(unlocked.some(a => a.id === 'quiz')); assert(unlocked.some(a => a.id === 'rit')); assert(!unlocked.some(a => !a.available)); assert.equal(checkAchievements(c).length, 0);
});
test('memory matching, quiz and rhythm are playable and reject duplicate input', () => {
  const m = new MatchingGame(() => .5); const pairs = new Map(); m.cards.forEach((v, i) => { if (!pairs.has(v)) pairs.set(v, []); pairs.get(v).push(i); }); for (const [a, b] of pairs.values()) { m.flip(a); assert.equal(m.flip(a), false); m.flip(b); } assert(m.done); assert.equal(m.moves, 6);
  const q = new QuizGame(() => .5); for (let i = 0; i < 6; i++) q.answer(0); assert(q.done); assert.equal(q.score, 6); assert.equal(q.answer(0), false);
  const r = new RhythmGame(); for (let i = 0; i < 10; i++) { while (r.time < .8) r.update(.01); assert.equal(r.hit(), 2); assert.equal(r.hit(), 0); while (r.round <= i) r.update(.01); } assert(r.done); assert.equal(r.score, 20);
});
test('migration preserves old save untouched while writing campaign progress to v04', () => {
  const map = new Map(), storage = { getItem: k => map.get(k), setItem: (k, v) => map.set(k, v) };
  const old = JSON.stringify({ version: 2, progress: { stage: 1, collected: ['card'], position: { x: 5, z: 6 } }, settings: { quality: 'low' } }); storage.setItem(LEGACY_SAVE_KEY, old);
  const loaded = loadSave(storage); assert.equal(loaded.progress.collected[0], 'card'); assert.equal(loaded.settings.quality, 'low'); assert.equal(loaded.progress.position.x, 5);
  loaded.progress.campaign.talks = 7; assert(saveProgress(storage, loaded.progress, loaded.settings)); assert.equal(storage.getItem(LEGACY_SAVE_KEY), old); assert.equal(JSON.parse(storage.getItem(SAVE_KEY)).version, 4); assert.equal(loadSave(storage).progress.campaign.talks, 7);
});
test('every imported utterance and the final letter exactly match the original HTML literals', () => {
  const html = readFileSync(new URL('../../reference/color-source.txt', import.meta.url), 'utf8');
  const rows = data('dialogues');
  for (const name of ['LL', 'MM', 'NN']) {
    const initial = new RegExp(`var ${name}=(\\[.*?\\]);`).exec(html)[1];
    const extension = new RegExp(`${name}=${name}\\.concat\\((\\[.*?\\])\\);`).exec(html)[1];
    assert.deepEqual(rows.filter(d => d.source === name).map(d => d.text), [...JSON.parse(initial), ...JSON.parse(extension)]);
  }
  const letter = /var CARTA=("(?:\\.|[^"\\])*");/.exec(html)[1]; assert.equal(data('rewards').letter.text, JSON.parse(letter));
});
