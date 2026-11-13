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

test('archive requires six original memories, including validated legacy saves',()=>{
 const p=freshProgress();assert.equal(startExpansion(p.expansion,'archive',p.campaign),false);
 const old=validateProgress({stage:2,collected:['notebook','card','photo'],campaign:{memories:Array.from({length:6},(_,i)=>`memory-${i+1}`)}});
 assert.equal(startExpansion(old.expansion,'archive',old.campaign),true);
 assert.deepEqual(PUZZLES.timeline.cards.map(c=>c.label),[
 '19/08/2024 · Quando a gente começou','19/05/2025 · Se fomos babau','17/08/2025 · Um dos dias mais importantes da minha vida','31/03/2026 · O meu primeiro beijo','05/09/2026 · O último dia (que não foi)','21/09/2026 · Finalmente']);
});
test('partial puzzles, choices, fragments and simultaneous mission guards survive normalization',()=>{
 const p=freshProgress();startExpansion(p.expansion,'plan',p.campaign);
 assert.equal(startExpansion(p.expansion,'letter',p.campaign),false);
 advanceExpansion(p.expansion,'plan-notebook');advanceExpansion(p.expansion,'bia',{choice:'Pedir uma pista sobre os blocos'});
 advanceExpansion(p.expansion,'plan-pages-b');
 const q=validateProgress(p).expansion.quests.plan;assert.deepEqual(q.collected,['plan-pages-b']);assert.equal(q.choices.bia,'Pedir uma pista sobre os blocos');
 advanceExpansion(p.expansion,'plan-pages-a');advanceExpansion(p.expansion,'plan-pages-c');
 const order=shuffledOrder('plan');setPuzzleOrder(p.expansion,'plan',order);assert.deepEqual(validateProgress(p).expansion.quests.plan.puzzles.plan,order);
 assert.equal(setPuzzleOrder(p.expansion,'plan',Array(14).fill('plan-1')),false);
});
