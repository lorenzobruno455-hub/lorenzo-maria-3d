import {SCENE_PUZZLES,sceneStops} from '../data/script-staging.js';
import corpus from '../data/definitive-script.json' with {type:'json'};
export const groupScenes=group=>corpus.scenes.filter(s=>group==='prologue'?s.id.startsWith('PRO-'):group==='epilogue'?s.id.startsWith('EP-'):s.id.startsWith(`CAP0${group?.split('-')[1]}-`));
export const freshScript=()=>({version:1,active:null,completed:[],choices:{},collected:{},puzzles:{},endingTitle:''});
const groups=['prologue',...Array.from({length:6},(_,i)=>`chapter-${i+1}`),'epilogue'];
export function validateScript(raw){
 const s=freshScript();if(!raw||typeof raw!=='object')return s;
 const ids=new Set(corpus.scenes.map(s=>s.id));
 s.completed=Array.isArray(raw.completed)?[...new Set(raw.completed.filter(id=>ids.has(id)))]:[];
 for(const [id,value]of Object.entries(raw.choices||{}))if(ids.has(id)&&typeof value==='string'&&value.length<=120)s.choices[id]=value;
 for(const [id,values]of Object.entries(raw.collected||{}))if(ids.has(id)&&Array.isArray(values)){const valid=sceneStops(id).map(p=>p.stopId);s.collected[id]=[...new Set(values.filter(v=>valid.includes(v)))];}
 for(const [id,values]of Object.entries(raw.puzzles||{})){
  if(!Array.isArray(values))continue;
  if((SCENE_PUZZLES[id]||id==='CAP04-CENA02')&&values.length===1&&values[0]==='complete')s.puzzles[id]=['complete'];
  else{const cards=SCENE_PUZZLES[id]?.cards;if(cards&&values.length===cards.length&&new Set(values).size===cards.length&&values.every(v=>cards.includes(v)))s.puzzles[id]=[...values];}
 }
 const a=raw.active;if(groups.includes(a?.group)&&Number.isInteger(a.index)&&a.index>=0&&a.index<groupScenes(a.group).length)s.active={group:a.group,index:a.index,replay:a.replay===true};
 if(['Amanhã','Próxima página','Nossa história continua'].includes(raw.endingTitle))s.endingTitle=raw.endingTitle;
 return s;
}
export function startScript(state,group,replay=false){if(state.active||!groups.includes(group))return false;state.active={group,index:0,replay};return true;}
export function completeScene(state,id,choice){const a=state.active,scene=a&&groupScenes(a.group)[a.index];if(scene?.id!==id)return false;if(choice)state.choices[id]=choice;if(!state.completed.includes(id))state.completed.push(id);if(++a.index>=groupScenes(a.group).length)state.active=null;return true;}
