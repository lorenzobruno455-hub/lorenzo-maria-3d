import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QuestDirector, freshAdventure, validateAdventure } from '../../src/systems/quest-director.js';
import { ADVENTURES } from '../../src/data/adventures.js';
function fixture(raw=freshAdventure()) { let state=raw; const rewards=[]; const changes=[]; const make=()=>new QuestDirector({getState:()=>state,save:value=>{state=value;},onReward:r=>rewards.push(r),onChange:s=>changes.push(s)}); return {make,rewards,changes,get state(){return state;}}; }
for(const definition of ADVENTURES) test(`${definition.id} guards ordered events and survives reload with one reward`,()=>{
 const f=fixture(); let q=f.make();
 // Complete prerequisites through their actual events.
 for(const prerequisite of definition.prerequisites||[]) {q.start(prerequisite);finish(q);}
 assert.equal(q.start(definition.id),true); assert.equal(q.start(definition.id),false);
 assert.equal(q.emit('pickup','unrelated'),false);
 let count=0;
 while(q.current()?.status==='active') {
  const current=q.current(); const step=current.step;
  if(current.awaitingChoice) {assert.equal(q.choose('invalid'),false);assert.equal(q.choose(step.choices[0].id),true);}
  else {if(step.type==='activity') {assert.equal(q.emit(step.type,step.target,{completed:false}),false);assert.equal(q.emit(step.type,'wrong',{completed:true}),false);}
   assert.equal(q.emit(step.type,step.target,{completed:true,receipt:`r${count++}`}),true);}
  q=f.make();
 }
 assert.equal(q.current(definition.id).status,'completed');
 assert.equal(q.emit('scene',definition.steps.at(-1).target),false);
 assert.equal(q.start(definition.id),false);
 assert.equal(f.rewards.filter(r=>r.questId===definition.id).length,1);
 assert.equal(q.snapshot().quests[definition.id].rewarded,true);
 const snapshot=q.snapshot();snapshot.quests[definition.id].node=0;assert.equal(q.current(definition.id).status,'completed');
});
function finish(q) {while(q.current()?.status==='active'){const c=q.current();if(c.awaitingChoice)q.choose(c.step.choices[0].id);else q.emit(c.step.type,c.step.target,{completed:true});}}
test('prerequisites and unknown quests reject without changing save',()=>{const f=fixture(),q=f.make();assert.equal(q.start('lost-book'),false);assert.equal(q.start('missing'),false);assert.deepEqual(q.snapshot(),freshAdventure());});
test('invalid saves sanitize unknown data, nodes, choices and terminal flags',()=>{const s=validateAdventure({active:'hacked',quests:{'first-encounter':{status:'completed',node:999,rewarded:true,choices:{hack:'yes'}},hack:{}}});assert.equal(s.active,null);assert.equal(s.quests['first-encounter'].status,'available');assert.equal(s.quests['first-encounter'].rewarded,false);assert.deepEqual(s.quests['first-encounter'].choices,{});assert(!s.quests.hack);});
test('activity receipts cannot be reused and choices block further events',()=>{const q=fixture().make();q.start('first-encounter');while(!q.current().awaitingChoice){const s=q.current().step;q.emit(s.type,s.target,{completed:true});}assert.equal(q.emit('activity','school-exercise',{completed:true}),false);assert.equal(q.choose('listen'),true);assert.equal(q.emit('activity','school-exercise',{completed:true,receipt:'same'}),true);assert.equal(q.emit('scene','first-finale',{receipt:'same'}),false);assert.equal(q.emit('scene','first-finale',{receipt:'new'}),true);});
test('the first memory keeps the author date and exact wording',async()=>{const {readFile}=await import('node:fs/promises');const original=JSON.parse(await readFile(new URL('../../src/data/memories.json',import.meta.url),'utf8'))[0];const first=ADVENTURES[0].memory;assert.equal(first.date,original.date);assert.equal(first.description,original.description);});
test('choice nodes restore safely and malformed prerequisites cannot unlock secondaries',()=>{const f=fixture(),q=f.make();q.start('first-encounter');while(!q.current().awaitingChoice){const s=q.current().step;q.emit(s.type,s.target);}const resumed=f.make();assert.equal(resumed.current().step.type,'choice');assert.equal(resumed.choose('listen'),true);assert.equal(resumed.current().step.target,'school-exercise');const bad=validateAdventure({active:'lost-book',quests:{'lost-book':{node:3,status:'active',choices:{help:'clues'}}}});assert.equal(bad.quests['lost-book'].node,0);assert.equal(bad.active,null);});
test('repeated talk target requires its proper current node and snapshots cannot mutate callbacks',()=>{const f=fixture();const q=f.make();q.start('first-encounter');finish(q);q.start('familiar-music');q.emit('talk','davi');q.choose('practice');assert.equal(q.emit('talk','davi'),false);assert.equal(q.current().step.target,'score');f.changes.at(-1).quests['familiar-music'].node=6;assert.equal(q.current().step.target,'score');});
