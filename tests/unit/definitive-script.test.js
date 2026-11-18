import {test} from 'node:test';
import assert from 'node:assert/strict';
import npcs from '../../src/data/npcs.json' with {type:'json'};
import {readFileSync} from 'node:fs';
test('five display names change while canonical NPC IDs remain',()=>{
 assert.deepEqual(npcs.map(n=>[n.id,n.name]),[['bia','Rafaella'],['caio','Porva'],['helena','Prof Newmara'],['davi','Bassarab'],['lia','Helô']]);
});
test('definitive corpus preserves every scripted scene and stable speakers',()=>{
 const data=JSON.parse(readFileSync(new URL('../../src/data/definitive-script.json',import.meta.url)));
 assert.equal(data.scenes.filter(s=>s.id.startsWith('CAP01-')).length,12);
 for(let i=1;i<=6;i++)assert.ok(data.scenes.some(s=>s.id.startsWith(`CAP0${i}-`)));
 for(let i=1;i<=7;i++)assert.ok(data.scenes.some(s=>s.id.startsWith(`AV0${i}-`)));
 assert.equal(data.books.length,6);assert.ok(data.scenes.find(s=>s.id==='EP-CENA01'));
 for(const scene of data.scenes){assert.ok(scene.lines.length,scene.id);for(const l of scene.lines){assert.ok(l.speakerId);assert.ok(l.text);assert.ok(l.sourceKind);}}
 assert.equal(data.scenes.find(s=>s.id==='CAP01-CENA09').lines.find(l=>l.speakerId==='maria'&&l.text==='Pode ser.').sourceKind,'real_report');
});
test('script saves validate legacy data, resume and reject forged scene IDs',async()=>{
 const {freshScript,validateScript,startScript,completeScene}=await import('../../src/systems/script-progress.js');
 assert.deepEqual(validateScript(null),freshScript());const s=freshScript();assert.equal(startScript(s,'chapter-1'),true);
 assert.equal(completeScene(s,'CAP01-CENA02'),false);assert.equal(completeScene(s,'CAP01-CENA01','ask'),true);
 const saved=validateScript(JSON.parse(JSON.stringify(s)));assert.equal(saved.active.index,1);assert.equal(saved.choices['CAP01-CENA01'],'ask');
 assert.equal(completeScene(saved,'CAP01-CENA01'),false);assert.deepEqual(validateScript({completed:['fake'],active:{group:'fake',index:99}}),freshScript());
});
test('all chapters complete and replay preserves receipts, old campaign survives save validation',async()=>{
 const {freshScript,startScript,completeScene,groupScenes,validateScript}=await import('../../src/systems/script-progress.js');
 const {freshProgress,validateProgress}=await import('../../src/systems/progress.js');const s=freshScript();
 for(let i=1;i<=6;i++){const g=`chapter-${i}`;startScript(s,g);for(const scene of groupScenes(g))assert.ok(completeScene(s,scene.id));assert.equal(s.active,null);}
 const before=[...s.completed];startScript(s,'chapter-1',true);for(const scene of groupScenes('chapter-1'))completeScene(s,scene.id);assert.deepEqual(s.completed,before);
 const p=freshProgress();p.campaign.memories=['memory-1','memory-2'];p.script=s;const loaded=validateProgress(p);assert.deepEqual(loaded.script,validateScript(s));assert.deepEqual(loaded.campaign.memories,p.campaign.memories);
});
test('script targets use the existing clear approach, not the desk interior',async()=>{
 const {DefinitiveScript}=await import('../../src/systems/definitive-script.js');
 const context={current:{id:'CAP01-CENA03',title:'Conversas de aula'},school:{active:true,inspecting:false,floor:0,navigation:{floor:()=>({baseY:0})}},adventure:{cutscenes:{active:false}},stops:()=>[{floor:0,x:-6.5,z:13.22,top:.78,approach:{x:-5.5,z:12.8}}]};
 const [target]=DefinitiveScript.prototype.targets.call(context);assert.equal(target.x,-5.5);assert.equal(target.z,12.8);
});
test('Maria contextual conversations require their narrative phase',async()=>{
 const {DefinitiveScript}=await import('../../src/systems/definitive-script.js');
 const progress={campaign:{memories:[]},script:{completed:[]},adventure:{quests:{'lost-book':{status:'available'},'familiar-music':{status:'available'}}},expansion:{quests:{}}};
 const context={getProgress:()=>progress,state:progress.script};const available=condition=>DefinitiveScript.prototype.conversationAvailable.call(context,{condition});
 assert.equal(available('fase escolar pós 20/08/2024'),false);assert.equal(available('fase posterior, sem data exata'),false);
 progress.script.completed.push('CAP01-CENA10');assert.equal(available('fase escolar pós 20/08/2024'),true);assert.equal(available('fase posterior, sem data exata'),false);
 progress.campaign.memories.push('memory-1');assert.equal(available('fase posterior, sem data exata'),true);
});
test('new campaign starts without old expansion and epilogue eligibility',async()=>{
 const {readFileSync}=await import('node:fs');const {Story}=await import('../../src/systems/story.js');
 global.document={createElement:tag=>({tag,append(){}})};
 const progress={campaign:{memories:['memory-1']},script:{completed:['EP-CENA01']},expansion:{active:'plan',quests:{archive:{completed:true}}}};const nodes=[];
 const context={content:{replaceChildren(){},append(...ns){nodes.push(...ns);}},getProgress:()=>progress,adventure:{reset(){}},living:{setMode(){}},changed(){},close(){},start(){},show(){}};
 Story.prototype.newCampaign.call(context);nodes[0].onclick();assert.equal(progress.expansion.active,null);assert.deepEqual(progress.expansion.quests,{});assert.deepEqual(progress.script.completed,[]);delete global.document;
});
test('school interactions use local obstacles and campus interactions keep world obstacles',async()=>{
 const {narrativeOccluders}=await import('../../src/systems/narrative-identity.js');
 const {InteractionRegistry}=await import('../../src/systems/interaction-registry.js');
 const wall={minX:-1,maxX:1,minY:0,maxY:3,minZ:1,maxZ:1.2};const world={occluders:[wall]},school={active:true},follow={obstacles:[]};
 const registry=new InteractionRegistry({get occluders(){return narrativeOccluders(world,school,follow);}});registry.register({id:'scene',object:{x:0,z:2},distance:3,height:1.4,action(){}});
 assert.ok(registry.nearest({x:0,y:.03,z:0}));follow.obstacles=[wall];assert.equal(registry.nearest({x:0,y:.03,z:0}),null);school.active=false;follow.obstacles=[];assert.equal(registry.nearest({x:0,z:0}),null);
});
test('script chapter completion unlocks canonical memories once and closes the legacy first adventure',async()=>{
 const {DefinitiveScript}=await import('../../src/systems/definitive-script.js');const {freshProgress}=await import('../../src/systems/progress.js');const {groupScenes,startScript}=await import('../../src/systems/script-progress.js');
 const p=freshProgress();p.stage=2;let receipts=0;
 const context={get state(){return p.script;},get current(){return p.script.active?groupScenes(p.script.active.group)[p.script.active.index]:null;},getProgress:()=>p,save(){},notify(){},story:{changed(){}},living:{setMode(){}},adventure:{current:{id:'first-encounter',step:{target:'first-finale'}},director:{emit(type,id){assert.equal(type,'scene');assert.equal(id,'first-finale');receipts++;}}}};
 for(let i=1;i<=6;i++){startScript(p.script,`chapter-${i}`);for(const s of groupScenes(`chapter-${i}`))DefinitiveScript.prototype.finish.call(context,s.id);assert.equal(p.campaign.memories.length,i);}
 assert.equal(receipts,1);assert.equal(p.campaign.vouchers.length,6);assert.equal(p.campaign.letter,true);
 startScript(p.script,'chapter-1',true);for(const s of groupScenes('chapter-1'))DefinitiveScript.prototype.finish.call(context,s.id);assert.equal(receipts,1);assert.equal(p.campaign.vouchers.length,6);
});
test('all seven adventure scripts are mapped to unchanged legacy quest nodes',async()=>{
 const {MISSION_SCENES}=await import('../../src/data/script-staging.js');const {ADVENTURES}=await import('../../src/data/adventures.js');const {EXPANSION}=await import('../../src/data/expansion.js');
 const corpus=JSON.parse(readFileSync(new URL('../../src/data/definitive-script.json',import.meta.url)));const mapped=Object.values(MISSION_SCENES).flat();
 assert.deepEqual([...new Set(mapped)].sort(),corpus.scenes.filter(s=>s.id.startsWith('AV')).map(s=>s.id).sort());
 for(const key of Object.keys(MISSION_SCENES)){const [id,step]=key.split(':');const d=ADVENTURES.find(q=>q.id===id)||EXPANSION.find(q=>q.id===id);assert.ok((d.steps||d.tasks).some(s=>s.id===step),key);}
 assert.deepEqual(ADVENTURES.map(d=>d.id),['first-encounter','lost-book','familiar-music']);assert.deepEqual(EXPANSION.map(d=>d.id),['plan','letter','frequency','archive']);
});
test('outdoor chapter stops avoid the existing photo table footprint',async()=>{
 const {sceneStops}=await import('../../src/data/script-staging.js');
 for(const id of ['CAP02-CENA02','CAP05-CENA01','CAP05-CENA02','EP-CENA02'])for(const p of sceneStops(id).filter(p=>p.outside))assert.ok(!(p.x>=9.25&&p.x<=10.75&&p.z>=21.6&&p.z<=22.4),id);
});
test('Maria topic menu never speaks a remote NPC conversation in her place',async()=>{
 const {DefinitiveScript}=await import('../../src/systems/definitive-script.js');let played;
 const context={freeConversations:id=>{assert.equal(id,'maria');return[{id:'LIV-MARIA-01',lines:[{speakerId:'maria',text:'Você tá prestando atenção?',sourceKind:'fictional'}]}];},getProgress:()=>({campaign:{lastDialogue:{}}}),story:{dialogue:{start(lines){played=lines;}}}};
 DefinitiveScript.prototype.talkCategory.call(context,'escola');assert.equal(played[0].speaker,'MARIA');
});
test('reading a rewritten memory book retains the original book camera focus',async()=>{
 const {DefinitiveScript}=await import('../../src/systems/definitive-script.js');let lines;
 const context={story:{dialogue:{start(value){lines=value;}}}};
 DefinitiveScript.prototype.readBook.call(context,'memory-2',{x:-7,z:-11.7,height:.84});
 assert.equal(context.story.focus.x,-7);assert.equal(context.story.focus.z,-11.7);assert.equal(context.story.focus.hidePlayer,true);assert.equal(lines[1].provenance,'pending_verification');
});
