import chapters from '../data/chapters.json' with { type: 'json' };
import memories from '../data/memories.json' with { type: 'json' };
const ids = memories.map(m => m.id);
export function freshCampaign() { return { memories: [], steps: {}, achievements: {}, vouchers: [], special: [], results: {}, lastSpoken: '', talks: 0, lastDialogue: {}, letter: false }; }
export function validateCampaign(raw = {}) {
  const c = freshCampaign(); if (!raw || typeof raw !== 'object') return c;
  // Only a sequential prefix of chapters can have been completed.
  for (const id of ids) { if (!Array.isArray(raw.memories) || !raw.memories.includes(id)) break; c.memories.push(id); }
  for (const chapter of chapters) {
    c.steps[chapter.id] = Array.isArray(raw.steps?.[chapter.id]) ? [...new Set(raw.steps[chapter.id].filter(s => chapter.steps.some(step => step.id === s)))] : [];
    const index = chapters.indexOf(chapter);
    if (index < c.memories.length) c.steps[chapter.id] = chapter.steps.map(s => s.id);
    else if (index > c.memories.length) c.steps[chapter.id] = [];
    else { const prefix = []; for (const step of chapter.steps) { if (step.type === 'memory' || !c.steps[chapter.id].includes(step.id)) break; prefix.push(step.id); } c.steps[chapter.id] = prefix; }
  }
  c.talks = Number.isFinite(raw.talks) ? Math.max(0, Math.floor(raw.talks)) : 0;
  for (const [id, stamp] of Object.entries(raw.achievements || {})) if (typeof stamp === 'string' && /^\d{4}-/.test(stamp)) c.achievements[id] = stamp;
  c.vouchers = [...new Set(Array.isArray(raw.vouchers) ? raw.vouchers.filter(id => /^vale-(?:[1-9]|1[0-2])$/.test(id)) : [])];
  c.special = [...new Set(Array.isArray(raw.special) ? raw.special.filter(id => ['garden-letter', 'reflection', 'flowers', 'duo', 'moon'].includes(id)) : [])];
  for (const id of ['mem', 'quiz', 'rit']) {
    const result = raw.results?.[id]; if (result && Number.isFinite(result.score)) c.results[id] = { score: Math.max(0, Math.min(id === 'quiz' ? 6 : id === 'rit' ? 20 : 999, result.score)), completed: result.completed === true };
  }
  for (const [key, value] of Object.entries(raw.lastDialogue || {})) if (typeof value === 'string') c.lastDialogue[key] = value;
  c.lastSpoken = typeof raw.lastSpoken === 'string' ? raw.lastSpoken : '';
  c.letter = c.memories.length === 6; return c;
}
export function currentChapter(c) { return chapters[c.memories.length] || null; }
export function nextStep(c) { const chapter = currentChapter(c); return chapter?.steps.find(step => !(c.steps[chapter.id] || []).includes(step.id)) || null; }
export function questEvent(c, type, id) {
  const chapter = currentChapter(c), step = nextStep(c); if (!chapter || !step || step.type !== type) return false;
  if (type === 'memory' && step.memory !== id) return false;
  c.steps[chapter.id] ||= []; c.steps[chapter.id].push(step.id); return true;
}
export function unlockMemory(c, id) {
  const chapter = currentChapter(c); if (!chapter || !questEvent(c, 'memory', id)) return false;
  c.memories.push(id); if (!c.vouchers.includes(chapter.reward)) c.vouchers.push(chapter.reward);
  c.letter = c.memories.length === 6; return true;
}
export function recordGame(c, id, score, completed) {
  if (!['mem', 'quiz', 'rit'].includes(id)) return false;
  const previous = c.results[id]; c.results[id] = { score: Math.max(previous?.score || 0, score), completed: !!(completed || previous?.completed) }; return true;
}
export { chapters, memories };
