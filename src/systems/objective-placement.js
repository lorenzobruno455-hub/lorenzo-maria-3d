import{schoolPointToWorld}from'./world-coordinates.js';
// Relocate only an explicitly identified interior objective. Never infer its identity from campaign stage.
export function campusObjective(next,{expansion=false,adventureStep=null,point,rotation=0}){if(!next||expansion)return next;const id=adventureStep?.target||next.id;if(!id||['maria','bia','davi','helena','caio','lia','photo'].includes(id))return next;const p=point(id==='familiar-music'?'score':id);return p?{...next,...schoolPointToWorld(p,rotation),name:next.name||p.name}:next;}
