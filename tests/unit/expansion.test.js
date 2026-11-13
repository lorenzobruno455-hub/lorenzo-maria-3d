import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshProgress,validateProgress,saveProgress,loadSave} from '../../src/systems/progress.js';
import {EXPANSION,PUZZLES} from '../../src/data/expansion.js';
import {freshExpansion,validateExpansion,startExpansion,currentExpansion,advanceExpansion,setPuzzleOrder,shuffledOrder,finishExpansion,rewardExpansion} from '../../src/systems/expansion-progress.js';

test('legacy and malformed expansion saves preserve the original campaign',()=>{
 const p=freshProgress();p.campaign.memories=['memory-1'];p.campaign.results.quiz={score:5,completed:true};
 const migrated=validateProgress(p);assert.deepEqual(migrated.campaign.memories,['memory-1']);assert.equal(migrated.campaign.results.quiz.score,5);assert.deepEqual(migrated.expansion,freshExpansion());
 assert.deepEqual(validateExpansion(null),freshExpansion());
 const q=validateExpansion({active:'plan',quests:{plan:{step:Infinity,puzzles:{plan:['bad']},collected:['bad'],completed:true}}});assert.equal(q.quests.plan.step,0);assert.equal(q.quests.plan.completed,false);assert.deepEqual(q.quests.plan.collected,[]);
});
for(const m of EXPANSION)test(`${m.id}: complete/resume every stage, reject wrong actions, unique rewards`,()=>{
 let p=freshProgress();if(m.requiresMemories)p.campaign.memories=Array.from({length:6},(_,i)=>`memory-${i+1}`);
 assert.equal(startExpansion(p.expansion,m.id,p.campaign),true);
 for(const task of m.tasks){assert.equal(currentExpansion(p.expansion).task.id,task.id);assert.equal(advanceExpansion(p.expansion,'not-the-target'),false);
  if(task.type==='collect'){for(const id of task.targets){assert.equal(advanceExpansion(p.expansion,id),true);assert.equal(advanceExpansion(p.expansion,id),false);}}
  else if(task.type==='puzzle'){
   const wrong=shuffledOrder(task.puzzle,()=>0);setPuzzleOrder(p.expansion,task.puzzle,wrong);assert.equal(advanceExpansion(p.expansion,task.target,{puzzle:task.puzzle}),false);
   setPuzzleOrder(p.expansion,task.puzzle,PUZZLES[task.puzzle].cards.map(c=>c.id));assert.equal(advanceExpansion(p.expansion,task.target,{puzzle:task.puzzle}),true);
  }else if(task.type==='scene')assert.equal(finishExpansion(p.expansion,m.id),true);
  else assert.equal(advanceExpansion(p.expansion,task.target,{choice:task.choices?.[0]}),true);
  // Simulate closing the game after every interaction through the real save API.
  const values=new Map();const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
  assert.equal(saveProgress(storage,p,{}),true);p=loadSave(storage).progress;
 }
 assert.equal(rewardExpansion(p.expansion,p.campaign,m.id,'2026-11-13T00:00:00Z'),true);assert.equal(rewardExpansion(p.expansion,p.campaign,m.id),false);assert.equal(finishExpansion(p.expansion,m.id),false);
 assert.equal(Object.keys(p.campaign.achievements).filter(k=>k===`expansion-${m.id}`).length,1);
});
