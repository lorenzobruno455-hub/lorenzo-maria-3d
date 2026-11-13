import {EXPANSION,PUZZLES,missionById} from '../data/expansion.js';
const blank=()=>({step:0,collected:[],puzzles:{},choices:{},completed:false,rewarded:false});
export function freshExpansion(){return{active:null,quests:{}};}
export function validateExpansion(raw){
 const state=freshExpansion();if(!raw||typeof raw!=='object')return state;
 for(const m of EXPANSION){const r=raw.quests?.[m.id];if(!r||typeof r!=='object')continue;const q=blank();
  q.step=Number.isInteger(r.step)?Math.max(0,Math.min(m.tasks.length,r.step)):0;
  q.completed=r.completed===true&&q.step===m.tasks.length;
  if(!q.completed&&q.step===m.tasks.length)q.step=m.tasks.length-1;
  q.rewarded=q.completed&&r.rewarded===true;
  const ids=m.tasks.flatMap(t=>t.targets||[]);q.collected=Array.isArray(r.collected)?[...new Set(r.collected.filter(id=>ids.includes(id)))]:[];
  for(const t of m.tasks){if(t.choices&&t.choices.includes(r.choices?.[t.id]))q.choices[t.id]=r.choices[t.id];
   if(t.puzzle&&isOrder(t.puzzle,r.puzzles?.[t.puzzle]))q.puzzles[t.puzzle]=[...r.puzzles[t.puzzle]];
  }state.quests[m.id]=q;
 }if(missionById(raw.active)&&state.quests[raw.active]&&!state.quests[raw.active].completed)state.active=raw.active;return state;
}
export function isOrder(id,order){const cards=PUZZLES[id]?.cards;return !!cards&&Array.isArray(order)&&order.length===cards.length&&new Set(order).size===cards.length&&order.every(id=>cards.some(c=>c.id===id));}
export function currentExpansion(state){const mission=missionById(state.active),quest=state.quests[state.active];return mission&&quest&&!quest.completed?{mission,quest,task:mission.tasks[quest.step]}:null;}
export function startExpansion(state,id,campaign){const m=missionById(id);if(!m||state.active&&state.active!==id||state.quests[id]?.completed)return false;if(m.requiresMemories&&campaign.memories.length!==6)return false;state.quests[id]||=blank();state.active=id;return true;}
export function advanceExpansion(state,target,{choice,puzzle}={}){
 const c=currentExpansion(state);if(!c)return false;const{task,quest}=c;
 if(task.type==='scene')return false;
 if(task.type==='collect'){
  if(!task.targets.includes(target)||quest.collected.includes(target))return false;quest.collected.push(target);
  if(task.targets.some(id=>!quest.collected.includes(id)))return true;
 }else{
  if(task.target!==target)return false;
  if(task.type==='talk'&&task.choices&&!task.choices.includes(choice))return false;
  if(task.type==='puzzle'&&(puzzle!==task.puzzle||!puzzleCorrect(puzzle,quest.puzzles[puzzle])))return false;
  if(choice)quest.choices[task.id]=choice;
 }
 quest.step++;return true;
}
export function puzzleCorrect(id,order){return isOrder(id,order)&&order.every((value,i)=>value===PUZZLES[id].cards[i].id);}
export function setPuzzleOrder(state,id,order){const c=currentExpansion(state);if(!c||c.task.puzzle!==id||!isOrder(id,order))return false;c.quest.puzzles[id]=[...order];return true;}
export function shuffledOrder(id,random=Math.random){const a=PUZZLES[id].cards.map(c=>c.id);for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}if(puzzleCorrect(id,a))a.push(a.shift());return a;}
export function finishExpansion(state,id){const c=currentExpansion(state);if(!c||c.mission.id!==id||c.task.type!=='scene')return false;c.quest.step=c.mission.tasks.length;c.quest.completed=true;state.active=null;return true;}
export function rewardExpansion(state,campaign,id,now=new Date().toISOString()){
 const q=state.quests[id],m=missionById(id);if(!q?.completed||!m||q.rewarded)return false;
 campaign.achievements[`expansion-${id}`]||=now;q.rewarded=true;return true;
}
