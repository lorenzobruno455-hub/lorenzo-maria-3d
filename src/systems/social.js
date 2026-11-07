import activities from '../data/activities.json' with { type: 'json' };
import npcs from '../data/npcs.json' with { type: 'json' };
import events from '../data/events.json' with { type: 'json' };
export function freshLiving() { return { mode: 'campaign', events: {}, reputation: {}, grants: [], achievements: {}, decisions: {}, history: [], snacks: [], actorClock: 0 }; }
export function validateLiving(raw = {}) {
  const s = freshLiving(); if (!raw || typeof raw !== 'object') return s;
  s.mode = raw.mode === 'free' ? 'free' : 'campaign';
  for (const e of events) { const state = raw.events?.[e.id]; if (['active', 'found', 'answered', 'done'].includes(state)) s.events[e.id] = state; }
  for (const n of npcs) if (Number.isFinite(raw.reputation?.[n.id])) s.reputation[n.id] = Math.max(0, Math.min(5, Math.floor(raw.reputation[n.id])));
  s.grants = Array.isArray(raw.grants) ? [...new Set(raw.grants.filter(k => typeof k === 'string' && k.length < 90))].slice(0, 100) : [];
  for (const e of events) if (typeof raw.achievements?.[e.id] === 'string') s.achievements[e.id] = raw.achievements[e.id];
  for (const [key, value] of Object.entries(raw.decisions || {})) if (typeof value === 'string' && value.length < 120) s.decisions[key] = value;
  s.history = Array.isArray(raw.history) ? raw.history.filter(h => h && typeof h.speaker === 'string' && typeof h.text === 'string').slice(-60).map(h => ({ speaker: h.speaker.slice(0, 50), text: h.text.slice(0, 1500), at: typeof h.at === 'string' ? h.at : '', provenance: typeof h.provenance === 'string' ? h.provenance : '' })) : [];
  s.snacks = Array.isArray(raw.snacks) ? [...new Set(raw.snacks.filter(id => ['water', 'fruit', 'bread'].includes(id)))] : [];
  s.actorClock = Number.isFinite(raw.actorClock) ? Math.max(0, raw.actorClock % 86400) : 0; return s;
}
export function befriend(s, npc, reason, amount = 1) {
  if (!npcs.some(n => n.id === npc) || s.grants.includes(reason)) return false;
  s.grants.push(reason); s.reputation[npc] = Math.min(5, (s.reputation[npc] || 0) + amount); return true;
}
export function rememberLine(s, line) {
  if (!line?.text || line.speaker === 'MENU') return;
  const last = s.history.at(-1); if (last?.text === line.text && last?.speaker === line.speaker) return;
  s.history.push({ speaker: line.speaker, text: line.text, provenance: line.provenance || 'game-interface', at: new Date().toISOString() }); s.history = s.history.slice(-60);
}
export { npcs as NPC_DATA, events as EVENT_DATA };

export function solveFriendActivity(s, npc, option) {
  const activity = activities.find(a => a.npc === npc); if (!activity || (s.reputation[npc] || 0) < 2 || !Number.isInteger(option) || !activity.options[option]) return false;
  const passed = option === activity.answer; const key = `bonus:${npc}`;
  s.decisions[key] = passed || s.decisions[key] === 'won' ? 'won' : 'retry';
  if (passed) befriend(s, npc, `friend-activity:${npc}`); return passed;
}
export { activities as FRIEND_ACTIVITIES };
