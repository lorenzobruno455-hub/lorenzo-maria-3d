import {test} from 'node:test';import assert from 'node:assert/strict';
import {freshProgress,validateProgress} from '../../src/systems/progress.js';
import {JOURNEY,currentJourney,journeyDone,reconcileJourney,canStartJourney} from '../../src/systems/journey-progress.js';
test('one ordered mission, no future starts, completed receipts advance without inventing rewards',()=>{
 const p=freshProgress();assert.equal(currentJourney(p).id,'tutorial');assert(!canStartJourney(p,'expansion','archive'));
 p.stage=2;p.collected=['notebook','card','photo'];assert.equal(currentJourney(p).id,'opening');p.script.completed.push('PRO-CENA01');assert.equal(currentJourney(p).id,'first');
 assert(canStartJourney(p,'adventure','first-encounter'));assert(!canStartJourney(p,'script','chapter-2'));assert.equal(p.campaign.memories.length,0);
});
test('sparse old memories survive save migration and earliest missing chapter is selected',()=>{
 const p=validateProgress({stage:2,collected:['notebook','card','photo'],campaign:{memories:['memory-1','memory-3','memory-6']}});
 assert.deepEqual(p.campaign.memories,['memory-1','memory-3','memory-6']);assert.equal(currentJourney(p).id,'lost-book');assert.equal(p.campaign.achievements['expansion-archive'],undefined);
});
test('future active script/quests are suspended, preserving objectives and choices across roundtrip',()=>{
 const p=freshProgress();p.stage=2;p.collected=['notebook','card','photo'];p.script.active={group:'chapter-5',index:1,replay:false};p.script.collected['CAP05-CENA02']=['CAP05-CENA02:0'];p.expansion={active:'plan',quests:{plan:{step:1,collected:[],puzzles:{},choices:{},completed:false,rewarded:false}}};
 reconcileJourney(p);assert.equal(p.script.active,null);assert.equal(p.expansion.active,null);assert.equal(p.journey.suspendedScript['chapter-5'].index,1);assert.equal(p.expansion.quests.plan.step,1);
 const q=validateProgress(p);assert.equal(q.journey.suspendedScript['chapter-5'].index,1);assert.deepEqual(q.script.collected['CAP05-CENA02'],['CAP05-CENA02:0']);
});
test('fully completed old save remains complete without resets or new rewards',()=>{
 const p=freshProgress();p.stage=2;p.collected=['notebook','card','photo'];p.campaign.memories=Array.from({length:6},(_,i)=>`memory-${i+1}`);p.script.completed=['PRO-CENA01','EP-CENA01','EP-CENA02'];
 for(const id of ['lost-book','familiar-music'])p.living.events[id]='done';for(const id of ['plan','letter','frequency','archive'])p.expansion.quests[id]={completed:true,rewarded:true};
 assert(JOURNEY.every(m=>journeyDone(p,m)));assert.equal(currentJourney(p),null);const before=JSON.stringify(p.campaign);reconcileJourney(p);assert.equal(JSON.stringify(p.campaign),before);
});

test('linear policy covers a whole new campaign and blocks every other phase at each transition',()=>{
 const p=freshProgress();for(const phase of JOURNEY){assert.equal(currentJourney(p).id,phase.id);
  for(const candidate of JOURNEY.filter(m=>!['tutorial'].includes(m.system)&&m.id!==phase.id))assert(!canStartJourney(p,candidate.system,candidate.key),`${phase.id} must block ${candidate.id}`);
  if(phase.id==='tutorial'){p.stage=2;p.collected=['notebook','card','photo'];}
  else if(phase.id==='opening')p.script.completed.push('PRO-CENA01');
  else if(phase.memory)p.campaign.memories.push(phase.memory);
  else if(phase.system==='adventure')p.adventure.quests[phase.key].status='completed';
  else if(phase.system==='expansion')p.expansion.quests[phase.key]={completed:true,rewarded:true};
  else p.script.completed.push('EP-CENA01','EP-CENA02');
 }assert.equal(currentJourney(p),null);
});

test('paused legacy adventure retains node, choice and receipts through validation',()=>{
 const p=freshProgress();p.stage=2;p.collected=['notebook','card','photo'];p.campaign.memories=['memory-1'];p.adventure.quests['first-encounter'].status='completed';p.adventure.quests['first-encounter'].node=8;p.adventure.quests['first-encounter'].choices={approach:'listen'};
 // Use an early valid node before any choice to test suspension independently of puzzle data.
 p.adventure.active='familiar-music';p.adventure.quests['familiar-music']={status:'active',node:1,choices:{},receipts:['heard'],rewarded:false};reconcileJourney(p);
 assert.equal(p.adventure.quests['familiar-music'].status,'paused');const q=validateProgress(p);assert.equal(q.adventure.quests['familiar-music'].node,1);assert.deepEqual(q.adventure.quests['familiar-music'].receipts,['heard']);
});

test('read-only chapter review restores collected steps, puzzle receipts and narrative choices after reload',async()=>{
 const {Journey}=await import('../../src/systems/journey.js');const p=freshProgress();p.stage=2;p.collected=['notebook','card','photo'];p.campaign.memories=['memory-1'];p.script.choices['CAP01-CENA02']='help';p.script.completed=['CAP01-CENA02'];
 const snapshot=structuredClone(p.script);p.journey.review={group:'chapter-1',mode:'free',snapshot};p.script.active={group:'chapter-1',index:0,replay:true};p.script.choices['CAP01-CENA02']='joke';
 const q=validateProgress(p);Journey.prototype.endReview.call({p:q,save(){}});assert.deepEqual(q.script,snapshot);assert.equal(q.living.mode,'free');assert.equal(q.journey.review,undefined);
});

test('casual Maria uses original stage-filtered lines, avoids immediate repeats and does not advance objectives',async()=>{
 const {Journey}=await import('../../src/systems/journey.js');const p=freshProgress();p.campaign.lastDialogue['casual:maria']='old';const before=structuredClone(p.campaign.steps);let spoken;
 const host={p,living:{},script:{freeConversations:()=>[{id:'old',lines:[{speakerId:'maria',text:'original old',sourceKind:'adapted'}]},{id:'new',lines:[{speakerId:'maria',text:'original new',sourceKind:'adapted'}]}]},story:{dialogue:{start(lines,{done}){spoken=lines;done();}}},save(){}};
 await Journey.prototype.casual.call(host,'maria');assert.equal(spoken[0].text,'original new');assert.deepEqual(p.campaign.steps,before);assert.deepEqual(p.campaign.memories,[]);assert.equal(p.script.active,null);assert.equal(p.campaign.lastDialogue['casual:maria'],'new');
});

test('earned historical memories repair missing prologue metadata instead of forcing a restart',()=>{
 const p=validateProgress({campaign:{memories:['memory-1','memory-4']}});assert.equal(p.stage,2);assert.equal(p.collected.length,3);assert.deepEqual(p.campaign.memories,['memory-1','memory-4']);assert.equal(currentJourney(p).id,'lost-book');
});

test('unfinished legacy chapters cannot hide their missing memory behind an orphan step stamp',async()=>{
 const {chapters,nextStep}=await import('../../src/systems/quests.js');const p=validateProgress({campaign:{steps:{'chapter-1':chapters[0].steps.map(s=>s.id)}}});assert.equal(nextStep(p.campaign).type,'memory');assert.deepEqual(p.campaign.memories,[]);
});
