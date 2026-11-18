import {chapters,memories} from './quests.js';
import {groupScenes,validateScript} from './script-progress.js';
const chapter=n=>({id:`chapter-${n}`,system:'script',key:`chapter-${n}`,title:chapters[n-1].title,memory:`memory-${n}`});
export const JOURNEY=Object.freeze([
 {id:'tutorial',system:'tutorial',key:'tutorial',title:'Primeiro sinal'},
 {id:'opening',system:'script',key:'prologue',title:'Uma página em branco'},
 {id:'first',system:'adventure',key:'first-encounter',title:'Primeiro Encontro',memory:'memory-1'},
 {id:'lost-book',system:'adventure',key:'lost-book',title:'O Livro Perdido'},chapter(2),
 {id:'plan',system:'expansion',key:'plan',title:'O Plano de 14 Etapas'},chapter(3),
 {id:'familiar-music',system:'adventure',key:'familiar-music',title:'Uma Música Conhecida'},chapter(4),
 {id:'letter',system:'expansion',key:'letter',title:'Uma Carta Nunca Entregue'},chapter(5),
 {id:'frequency',system:'expansion',key:'frequency',title:'A Frequência Perdida'},chapter(6),
 {id:'archive',system:'expansion',key:'archive',title:'O Arquivo Aurora'},
 {id:'epilogue',system:'script',key:'epilogue',title:'A próxima página'},
]);
export const freshJourney=()=>({version:1,suspendedScript:{}});
export function validateJourney(raw){const state=freshJourney();for(const [group,value] of Object.entries(raw?.suspendedScript||{})){
 const active=validateScript({active:value}).active;if(active?.group===group)state.suspendedScript[group]=active;
}
 const r=raw?.review;if(r&&groupScenes(r.group).length&&r.snapshot&&typeof r.snapshot==='object')state.review={group:r.group,mode:r.mode==='free'?'free':'campaign',snapshot:validateScript(r.snapshot)};
 return state;}
export function journeyDone(p,m){
 if(m.id==='tutorial')return p.stage===2;
 if(m.id==='opening')return p.script.completed.includes('PRO-CENA01')||p.campaign.memories.length>0||p.adventure.quests['first-encounter']?.node>0;
 if(m.memory)return p.campaign.memories.includes(m.memory);
 if(m.system==='adventure')return p.adventure.quests[m.key]?.status==='completed'||p.living.events[m.key]==='done';
 if(m.system==='expansion')return p.expansion.quests[m.key]?.completed===true;
 return groupScenes(m.key).every(s=>p.script.completed.includes(s.id));
}
export const currentJourney=p=>JOURNEY.find(m=>!journeyDone(p,m))||null;
export function canStartJourney(p,system,key){if(p.journey?.review)return system==='script'&&key===p.journey.review.group;const m=currentJourney(p);if(!m)return false;
 if(system==='script'&&key==='chapter-1'&&m.id==='first'){
  const q=p.adventure.quests['first-encounter'];return q?.status==='completed'||q?.node===7;
 }
 return m.system===system&&m.key===key;
}
/** Reconcile ownership only. Never grant rewards, remove receipts or reset objectives. */
export function reconcileJourney(p){
 p.journey ||= freshJourney();let changed=false;
 const active=p.script.active;
 if(active&&!canStartJourney(p,'script',active.group)){
  p.journey.suspendedScript[active.group]={...active};p.script.active=null;changed=true;
 }
 if(p.expansion.active&&!canStartJourney(p,'expansion',p.expansion.active)){p.expansion.active=null;changed=true;}
 const id=p.adventure.active;
 if(id&&!canStartJourney(p,'adventure',id)){
  if(p.adventure.quests[id]?.status==='active')p.adventure.quests[id].status='paused';
  p.adventure.active=null;changed=true;
 }
 return changed;
}
