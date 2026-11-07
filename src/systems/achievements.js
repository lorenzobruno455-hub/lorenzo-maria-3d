import definitions from '../data/achievements.json' with { type: 'json' };
export function checkAchievements(c, now = new Date().toISOString()) {
  const conditions = { talk: c.talks >= 1, conv: c.talks >= 20, narr: c.special.includes('reflection'), combo: c.special.includes('duo'), album: c.memories.length === 6, mem: c.results.mem?.completed, quiz: c.results.quiz?.score >= 5, rit: c.results.rit?.score >= 12, egg: c.special.includes('moon') };
  const unlocked = [];
  for (const a of definitions) if (a.available && conditions[a.id] && !c.achievements[a.id]) { c.achievements[a.id] = now; unlocked.push(a); }
  return unlocked;
}
export { definitions };
