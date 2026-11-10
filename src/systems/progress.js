import { freshSchoolVisit, validateSchoolVisit } from './school-progress.js';
export { freshSchoolVisit, validateSchoolVisit };
import {freshAdventure,validateAdventure} from './quest-director.js';
import { freshLiving, validateLiving } from './social.js';
import { freshCampaign, validateCampaign } from './quests.js';
import {BOUNDS} from './physics.js';
import { clamp } from './physics.js';
export const SAVE_KEY = 'lorenzo-maria-v04';
export const PRE08_SAVE_KEY = 'lorenzo-maria-v04-pre08';
export const PREVIOUS_SAVE_KEY = 'lorenzo-maria-v03';
export const LEGACY_SAVE_KEY = 'lorenzo-maria-v02';
export const ITEMS = [
  { id: 'notebook', name: 'Caderno de literatura', x: -14, z: -10.5 },
  { id: 'card', name: 'Cartão da biblioteca', x: 14, z: -10.5 },
  { id: 'photo', name: 'Fotografia do jardim', x: 10, z: 22 },
];
export const DEFAULT_SETTINGS = { quality: 'medium', sensitivity: 1, volume: .5, sound: false, shadows: true, adaptive: true, controlsSize: 1, controlsOpacity: .8, musicVolume: .5, effectsVolume: .5 };
export function freshProgress() { return { schoolVisit: freshSchoolVisit(), stage: 0, collected: [], position: { x: 0, z: 19 }, yaw: 0, pitch: .38, interactions: {}, adventure:freshAdventure(), living: freshLiving(), campaign: freshCampaign(), doors: [false, false] }; }
export function validateProgress(raw) {
  const p = freshProgress();
  if (!raw || typeof raw !== 'object') return p;
  p.collected = [...new Set(Array.isArray(raw.collected) ? raw.collected.filter(id => ITEMS.some(c => c.id === id)) : [])];
  p.stage = raw.stage === 2 && p.collected.length === 3 ? 2 : raw.stage >= 1 ? 1 : 0;
  if (!p.stage) p.collected = [];
  if (Number.isFinite(raw.position?.x) && Number.isFinite(raw.position?.z)) {
    p.position = { x: clamp(raw.position.x, BOUNDS.minX, BOUNDS.maxX), z: clamp(raw.position.z, BOUNDS.minZ, BOUNDS.maxZ) };
  }
  p.yaw = Number.isFinite(raw.yaw) ? raw.yaw % (2 * Math.PI) : 0;
  p.pitch = Number.isFinite(raw.pitch) ? clamp(raw.pitch, .08, 1.15) : .38;
  p.doors = [raw.doors?.[0] === true, raw.doors?.[1] === true];
  p.interactions=Object.fromEntries(Object.entries(raw.interactions||{}).filter(([k,v])=>typeof k==='string'&&k.length<100&&v===true).slice(0,100));
  p.adventure=validateAdventure(raw.adventure);
  p.schoolVisit = validateSchoolVisit(raw.schoolVisit);
  p.living = validateLiving(raw.living);
  p.campaign = validateCampaign(raw.campaign);
  return p;
}
export function validateSettings(raw = {}) {
  const s = { ...DEFAULT_SETTINGS };
  if (['low', 'medium', 'high'].includes(raw.quality)) s.quality = raw.quality;
  for (const k of ['sound', 'shadows', 'adaptive']) if (typeof raw[k] === 'boolean') s[k] = raw[k];
  if (Number.isFinite(raw.sensitivity)) s.sensitivity = clamp(raw.sensitivity, .3, 2.5);
  if (Number.isFinite(raw.volume)) s.volume = clamp(raw.volume, 0, 1);
  for (const k of ['musicVolume', 'effectsVolume']) s[k] = Number.isFinite(raw[k]) ? clamp(raw[k], 0, 1) : s.volume;
  if (Number.isFinite(raw.controlsSize)) s.controlsSize = clamp(raw.controlsSize, .8, 1.4);
  if (Number.isFinite(raw.controlsOpacity)) s.controlsOpacity = clamp(raw.controlsOpacity, .3, 1);
  return s;
}
export function loadSave(storage) {
  for (const key of [SAVE_KEY, PRE08_SAVE_KEY, PREVIOUS_SAVE_KEY, LEGACY_SAVE_KEY]) {
    try { const raw = JSON.parse(storage?.getItem(key) || 'null'); if (raw?.progress && typeof raw.progress === 'object') return { progress: validateProgress(raw.progress), settings: validateSettings(raw.settings || {}), exists: true }; }
    catch { /* Try the untouched legacy backup if the new record is corrupt. */ }
  }
  return { progress: freshProgress(), settings: { ...DEFAULT_SETTINGS }, exists: false };
}
export function saveProgress(storage, progress, settings) {
  try {
    // Minimal write-only test adapters have no readable record to preserve. Real
    // Storage reads must succeed, and the original must be secured before writing.
    if (typeof storage?.getItem === 'function') {
      const original = storage.getItem(SAVE_KEY);
      if (original !== null && original !== undefined && storage.getItem(PRE08_SAVE_KEY) == null) {
        storage.setItem(PRE08_SAVE_KEY, original);
        if (storage.getItem(PRE08_SAVE_KEY) !== original) return false;
      }
    }
    storage.setItem(SAVE_KEY, JSON.stringify({ version: 4, progress: validateProgress(progress), settings: validateSettings(settings) })); return true; }
  catch { return false; }
}
export function collect(progress, id) {
  if (progress.stage !== 1 || progress.collected.includes(id) || !ITEMS.some(c => c.id === id)) return false;
  progress.collected.push(id); return true;
}
export function objective(progress) {
  if (progress.stage === 0) return 'Encontre Maria perto da fonte do pátio.';
  if (progress.stage === 2) return 'Capítulo concluído! Continue explorando o Colégio Aurora.';
  if (progress.collected.length === 3) return 'Volte ao pátio e converse com Maria.';
  return 'Explore a sala, a biblioteca e o jardim. Recolha as três lembranças.';
}
export function mariaDialogue(progress) {
  if (progress.stage === 0) return { text: 'Lorenzo! Ainda bem que chegou. Espalhei três lembranças pela escola: um caderno na sala de literatura, um cartão na biblioteca e uma foto no jardim. Pode me ajudar a encontrá-las?', nextStage: 1 };
  if (progress.collected.length === 3) return { text: 'Você encontrou tudo! Agora temos o começo da nossa história. Vamos descobrir juntos o que este ano reserva?', nextStage: 2 };
  return { text: `Faltam ${3 - progress.collected.length} lembranças. Procure os pequenos pontos dourados na escola!`, nextStage: 1 };
}
