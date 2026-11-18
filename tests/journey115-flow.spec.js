import {test,expect} from '@playwright/test';
import {seed,start,state} from './helpers.js';
import {sceneStops,SCENE_PUZZLES} from '../src/data/script-staging.js';
import {NARRATIVE_POINTS as P} from '../src/systems/school-narrative-map.js';
import {EXPANSION,PUZZLES} from '../src/data/expansion.js';
import {JOURNEY} from '../src/systems/journey-progress.js';
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
const NARRATIVE_POINTS=P;
const points={
 'plan-notebook':{...NARRATIVE_POINTS['study-notebook'],x:-3.2},
 'plan-pages-a':NARRATIVE_POINTS['school-exercise'],
 'plan-pages-b':{...NARRATIVE_POINTS['shelf-clue'],x:-6.05},
 'plan-pages-c':{floor:0,x:0,z:-8},
 'archive-diary':{...NARRATIVE_POINTS.album,x:-6.2},
 'radio-antique':{...NARRATIVE_POINTS.instrument,x:9.45},'radio-coil':{...NARRATIVE_POINTS['science-book'],x:-8.45},'radio-crystal':{...NARRATIVE_POINTS['shelf-clue'],x:-6.1},'radio-antenna':{...NARRATIVE_POINTS.score,x:9.45},
 'letter-envelope':{...NARRATIVE_POINTS.album,x:-7.6},
 'letter-fragment-1':{...NARRATIVE_POINTS['shelf-clue'],x:-6.85},
 'letter-mural':{floor:0,x:0,z:-4},'letter-fragment-2':{floor:0,x:0,z:-4},
 'letter-fragment-3':{...NARRATIVE_POINTS['school-exercise'],x:-6.1},
 'letter-fragment-4':{outside:true,x:12,z:23},'letter-box':{outside:true,x:12,z:23},'letter-fragment-5':{outside:true,x:12,z:23},

};
test.use({viewport:{width:915,height:412},deviceScaleFactor:.5,hasTouch:true,isMobile:true,reducedMotion:'reduce'});
const checkpoint='work/aurora115/campaign-checkpoint.json';
async function relocate(page,p){
 await page.addInitScript(()=>{const raw=sessionStorage.getItem('journey-return');if(!raw)return;sessionStorage.removeItem('journey-return');const p=JSON.parse(raw),k='lorenzo-maria-v04',s=JSON.parse(localStorage.getItem(k));if(p.outside){s.progress.schoolVisit.active=false;s.progress.position={x:p.x,z:p.z};}else s.progress.schoolVisit={...s.progress.schoolVisit,active:true,floor:p.floor,position:{x:(p.approach||p).x,z:(p.approach||p).z},yaw:0,pitch:.38};localStorage.setItem(k,JSON.stringify(s));});
 await page.evaluate(p=>sessionStorage.setItem('journey-return',JSON.stringify(p)),p);await page.reload();await page.locator('#start').click();await page.evaluate(async()=>window.readGame=(await import('/src/systems/diagnostics.js')).getGameState);await expect.poll(async()=>(await state(page)).school.active).toBe(!p.outside);
}
async function actorPoint(page,id){const s=await state(page),w=s.spatialActors.instances.find(a=>a.id===id).world;const local={x:60-w.x,z:-w.z};return Math.abs(local.x)<10.5&&Math.abs(local.z)<19.5?{floor:Math.max(0,Math.min(2,Math.round(w.y/3.6))),x:local.x+.85,z:local.z}:{outside:true,x:w.x+.85,z:w.z};}
async function interact(page){await expect(page.locator('#interact')).toBeEnabled();await page.locator('#interact').tap();}
async function drain(page){await page.evaluate(()=>{for(let i=0;i<400;i++){
 const choice=document.querySelector('.dialogue-choices button');if(choice){choice.click();continue;}
 if(!document.getElementById('dialog').hidden){document.getElementById('dialogue-speed').click();document.getElementById('next').click();continue;}
 if(!document.getElementById('cinematic').hidden){document.getElementById('scene-skip').click();continue;}break;
 }});}
async function solve(page){
 if(await page.locator('[data-script-card]').count()){
  const id=(await state(page)).scriptScene,expected=SCENE_PUZZLES[id].cards;
  for(let i=0;i<expected.length;i++){const actual=await page.locator('[data-script-card]').evaluateAll(ns=>ns.map(n=>n.dataset.scriptCard));if(actual[i]!==expected[i]){await page.locator('[data-script-card]').nth(i).click();await page.locator(`[data-script-card="${expected[i]}"]`).click();}}
  await page.getByRole('button',{name:'Conferir sequência',exact:true}).click();return;
 }
 if(await page.locator('[data-puzzle-card]').count()){
  const s=await state(page),m=EXPANSION.find(m=>m.id===s.expansion.active),id=m.tasks[s.expansion.quests[m.id].step].puzzle,expected=PUZZLES[id].cards.map(c=>c.id);
  for(let i=0;i<expected.length;i++){const actual=await page.locator('[data-puzzle-card]').evaluateAll(ns=>ns.map(n=>n.dataset.puzzleCard));if(actual[i]!==expected[i]){await page.locator(`[data-slot="${i}"]`).click();await page.locator(`[data-puzzle-card="${expected[i]}"]`).click();}}
  await page.getByRole('button',{name:'Conferir sequência',exact:true}).click();return;
 }
 if(await page.locator('[data-spine]').count()){for(const title of ['Aurora','Jardim','Memória'])await page.getByRole('button',{name:title,exact:true}).click();return;}
 if(await page.getByRole('button',{name:'O relato original, mantendo a data e identificando a encenação como ficção',exact:true}).count()){await page.getByRole('button',{name:'O relato original, mantendo a data e identificando a encenação como ficção',exact:true}).click();return;}
 if(await page.locator('#adventure-note').count())for(let i=0;i<4;i++){await page.waitForFunction(()=>readGame().adventureRhythm>.4&&readGame().adventureRhythm<.6);await page.getByRole('button',{name:'Tocar nota',exact:true}).click();if(i<3)await page.waitForFunction(()=>readGame().adventureRhythm<.2);}
}
async function settle(page){await expect.poll(async()=>(await state(page)).physicalAction,{timeout:20000}).toBeFalsy();await drain(page);await solve(page);}

test('one new campaign from first greeting through seven adventures, six memories and epilogue',async({page})=>{
 test.setTimeout(3000000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const saved=existsSync(checkpoint)?JSON.parse(readFileSync(checkpoint,'utf8')):null;
 await seed(page,saved?.progress||{position:{x:5,z:6.5},living:{spatialActors:{maria:{x:5,y:0,z:5,index:0}}}},saved?.settings||{});await start(page);
 for(let iteration=0;iteration<220;iteration++){
  const s=await state(page),phase=s.journey.current;if(!phase)break;console.log('journey',phase,s.scriptScene||'',s.adventure.active||'',s.expansion.active||'');
  if(s.cinematic.active||s.dialog){await drain(page);await solve(page);continue;}
  if(await page.locator('#story-panel').isVisible()){await solve(page);continue;}
  const previous=phase;
  if(phase==='tutorial'){
   if(s.stage===0||s.items.length===3){await relocate(page,await actorPoint(page,'maria'));await interact(page);await drain(page);}
   else{const id=['notebook','card','photo'].find(id=>!s.items.includes(id));await relocate(page,id==='photo'?{outside:true,x:10,z:22}:P[id]);await interact(page);await settle(page);}
  }else if(s.script.active){
   const id=s.scriptScene,done=s.script.collected[id]||[],p=sceneStops(id).find(p=>!done.includes(p.stopId));if(!p)throw Error('No pending script stop '+id);await relocate(page,p);await interact(page);await settle(page);
  }else if(s.expansion.active){
   const mission=EXPANSION.find(m=>m.id===s.expansion.active),q=s.expansion.quests[mission.id],t=mission.tasks[q.step],id=(t.targets||[t.target]).find(id=>t.type!=='collect'||!q.collected.includes(id));
   let p=['maria','bia','davi'].includes(id)?await actorPoint(page,id):id.startsWith('archive-symbol-')?P[`memory-${id.split('-').at(-1)}`]:points[id];if(!p)throw Error('Unknown target '+id);
   await relocate(page,p);await interact(page);await settle(page);
  }else if(s.adventure.active){
   const q=s.adventure.quests[s.adventure.active],definition=(await import('../src/data/adventures.js')).ADVENTURES.find(a=>a.id===s.adventure.active),step=definition.steps[q.node];
   if(step.type==='scene'){await relocate(page,P.classroom);await expect.poll(async()=>{const n=await state(page);return n.cinematic.active||!!n.script.active;}).toBe(true);if((await state(page)).cinematic.active)await drain(page);}
   else if(step.type==='choice'){await expect(page.locator('.dialogue-choices button').first()).toBeVisible();await drain(page);}
   else{const p=['maria','bia','davi'].includes(step.target)?await actorPoint(page,step.target):P[step.target];if(!p)throw Error('Unknown adventure target '+step.target);await relocate(page,p);if(step.type==='visit'){await expect.poll(async()=>(await state(page)).adventure.quests[definition.id].node).toBeGreaterThan(q.node);}else{await interact(page);await settle(page);}}
  }else{await expect.poll(async()=>{const d=await state(page);return !!(d.script.active||d.adventure.active||d.expansion.active);}).toBe(true);}
  writeFileSync(checkpoint,await page.evaluate(()=>localStorage.getItem('lorenzo-maria-v04')));
  const now=await state(page);if(now.journey.current!==previous){console.log('COMPLETED',previous);writeFileSync(checkpoint,await page.evaluate(()=>localStorage.getItem('lorenzo-maria-v04')));await page.screenshot({path:`docs/captures/aurora115/completed-${previous}.png`});}
 }
 const final=await state(page);expect(final.journey.current).toBeUndefined();expect(final.campaign.memories).toHaveLength(6);expect(final.script.completed).toContain('EP-CENA02');for(const id of ['first-encounter','lost-book','familiar-music'])expect(final.adventure.quests[id].rewarded).toBe(true);for(const id of ['plan','letter','frequency','archive'])expect(final.expansion.quests[id].rewarded).toBe(true);expect(errors).toEqual([]);
 writeFileSync('work/aurora115/campaign-final.json',JSON.stringify(final));
});
