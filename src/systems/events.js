import { EVENT_DATA, befriend } from './social.js';
export function eventAction(s, id, action, choice = '') {
  const definition = EVENT_DATA.find(e => e.id === id); if (!definition) return false;
  const state = s.events[id];
  if (action === 'start' && !state) { s.events[id] = 'active'; return true; }
  if (action === 'find' && state === 'active' && id !== 'physics-question') { s.events[id] = 'found'; return true; }
  if (action === 'answer' && state === 'active' && id === 'physics-question' && ['together', 'heavy'].includes(choice)) { s.events[id] = 'answered'; s.decisions[id] = choice; return true; }
  const ready = id === 'physics-question' ? 'answered' : 'found';
  if (action === 'complete' && state === ready) {
    s.events[id] = 'done'; s.achievements[id] ||= new Date().toISOString(); befriend(s, definition.npc, `event:${id}`, definition.reward); return true;
  }
  return false;
}
export function eventObjective(s) {
  const e = EVENT_DATA.find(e => s.events[e.id] && s.events[e.id] !== 'done');
  if (!e) return null;
  const state = s.events[e.id];
  return { ...e, returnToNPC: ['found', 'answered'].includes(state), label: state === 'active' ? e.description : `Volte a conversar com ${e.npc === 'bia' ? 'Bia' : e.npc === 'davi' ? 'Davi' : 'Helena'}.` };
}
