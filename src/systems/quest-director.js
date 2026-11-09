import { ADVENTURES } from '../data/adventures.js';
const copy=value=>JSON.parse(JSON.stringify(value));
const record=()=>({status:'available',node:0,choices:{},receipts:[],rewarded:false});
export function freshAdventure(definitions=ADVENTURES) {return {version:1,active:null,quests:Object.fromEntries(definitions.map(d=>[d.id,record()]))};}
export function validateAdventure(raw,definitions=ADVENTURES) {
 const state=freshAdventure(definitions);
 if(!raw || typeof raw!=='object')return state;
 for(const d of definitions){
  const input=raw.quests?.[d.id];if(!input || typeof input!=='object')continue;
  const node=input.node;
  if(!Number.isInteger(node)||node<0||node>d.steps.length)continue;
  const complete=node===d.steps.length && input.status==='completed';
  if(!complete && input.status!=='active' && !(node===0&&input.status==='available'))continue;
  if(node===d.steps.length&&!complete)continue;
  const next=record();next.node=node;next.status=complete?'completed':input.status;
  let valid=true;
  for(let i=0;i<node;i++){
   const step=d.steps[i];if(step.type!=='choice')continue;
   const selected=input.choices?.[step.id];
   if(!step.choices.some(c=>c.id===selected)){valid=false;break;}
   next.choices[step.id]=selected;
  }
  if(!valid)continue;
  next.rewarded=complete && input.rewarded===true;
  next.receipts=Array.isArray(input.receipts)?[...new Set(input.receipts.filter(v=>typeof v==='string'&&v.length>0&&v.length<=160))].slice(0,100):[];
  state.quests[d.id]=next;
 }
 // A dependent quest cannot be restored beyond its prerequisite.
 for(const d of definitions) if((d.prerequisites||[]).some(id=>state.quests[id]?.status!=='completed'))state.quests[d.id]=record();
 if(typeof raw.active==='string'&&state.quests[raw.active]?.status==='active')state.active=raw.active;
 for(const d of definitions)if(state.quests[d.id].status==='active'&&d.id!==state.active){if(!state.active)state.active=d.id;else state.quests[d.id]=record();}
 return state;
}
export class QuestDirector {
 constructor({getState=()=>null,save=()=>{},onReward=()=>{},onChange=()=>{},definitions=ADVENTURES}={}) {this.getState=getState;this.save=save;this.onReward=onReward;this.onChange=onChange;this.definitions=definitions;this.state=validateAdventure(getState(),definitions);}
 snapshot(){return copy(this.state);}
 current(id=this.state.active){
  const definition=this.definitions.find(d=>d.id===id);if(!definition)return null;
  const state=this.state.quests[id];const step=definition.steps[state.node]||null;
  return copy({id,questId:id,title:definition.title,...state,step,awaitingChoice:step?.type==='choice',definition});
 }
 start(id){
  const d=this.definitions.find(d=>d.id===id);if(!d||this.state.active||this.state.quests[id].status!=='available'||(d.prerequisites||[]).some(p=>this.state.quests[p]?.status!=='completed'))return false;
  this.state.active=id;this.state.quests[id].status='active';this.publish();return true;
 }
 emit(type,target,payload={}){
  const c=this.current();if(!c||c.status!=='active'||!c.step||c.step.type==='choice'||type!==c.step.type||target!==c.step.target)return false;
  if(type==='activity'&&payload?.completed!==true)return false;
  const receipt=payload?.receipt;
  if(receipt!==undefined&&(typeof receipt!=='string'||!receipt.length||receipt.length>160||c.receipts.includes(receipt)))return false;
  if(receipt!==undefined)this.state.quests[c.id].receipts.push(receipt);
  return this.advance(c.id);
 }
 choose(choice){const c=this.current();if(!c||c.status!=='active'||c.step?.type!=='choice'||!c.step.choices.some(v=>v.id===choice))return false;this.state.quests[c.id].choices[c.step.id]=choice;return this.advance(c.id);}
 advance(id){
  const state=this.state.quests[id],definition=this.definitions.find(d=>d.id===id);state.node++;
  let reward=null;
  if(state.node===definition.steps.length){state.status='completed';this.state.active=null;if(!state.rewarded){state.rewarded=true;reward={questId:id,reward:copy(definition.reward),choices:copy(state.choices)};}}
  // Persist the terminal receipt before invoking reward callbacks: replay is idempotent.
  this.publish();if(reward)this.onReward(reward);return true;
 }
 publish(){const snapshot=this.snapshot();this.save(snapshot);this.onChange(this.snapshot());}
}
