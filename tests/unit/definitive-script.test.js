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
