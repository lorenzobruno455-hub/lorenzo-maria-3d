import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';
import {seed,start,state} from './helpers.js';
import {EXPANSION,PUZZLES} from '../src/data/expansion.js';
import {NARRATIVE_POINTS} from '../src/systems/school-narrative-map.js';
// Points are plain exported data; browser module additionally imports CSS.
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
mkdirSync('docs/captures/narrative-expansion',{recursive:true});
async function relocate(page,p){
 await page.addInitScript(()=>{
  const text=sessionStorage.getItem('expansion-return');if(!text)return;
  sessionStorage.removeItem('expansion-return');const p=JSON.parse(text),key='lorenzo-maria-v04',s=JSON.parse(localStorage.getItem(key));
  if(p.outside){s.progress.schoolVisit.active=false;s.progress.position={x:p.x,z:p.z};}
  else s.progress.schoolVisit={...s.progress.schoolVisit,active:true,floor:p.floor,position:{x:p.x,z:p.z},yaw:0,pitch:.38};
  localStorage.setItem(key,JSON.stringify(s));
 });
 await page.evaluate(p=>sessionStorage.setItem('expansion-return',JSON.stringify(p)),{...p,...p.approach});
 await page.reload();await page.locator('#start').click();await page.evaluate(async()=>window.readGame=(await import('/src/systems/diagnostics.js')).getGameState);
 await expect.poll(async()=>(await state(page)).school.active).toBe(!p.outside);
}
async function moveToTarget(page,id){
 let p=points[id];
 if(['maria','bia','davi'].includes(id)){const a=(await state(page)).npcs.find(a=>a.id===id);p={floor:a.floor,x:a.x+.9,z:a.z};}
 if(id.startsWith('archive-symbol-'))p=NARRATIVE_POINTS[`memory-${id.split('-').at(-1)}`];
 if(!p)throw new Error(`Missing test point ${id}`);await relocate(page,p);
}
async function interact(page){await expect(page.locator('#prompt')).toBeVisible();await expect(page.locator('#interact')).toBeEnabled();await page.keyboard.press('e');}
async function finishDialog(page,choice){
 await expect(page.locator('#dialog')).toBeVisible();
 for(let i=0;i<5&&await page.locator('#dialog').isVisible();i++){
  if(await page.locator('.dialogue-choices button').count()){await page.getByRole('button',{name:choice,exact:true}).click();break;}
  await page.locator('#dialogue-speed').click();await page.locator('#next').click();
 }
}
async function solve(page,id){
 await expect(page.locator('.expansion-grid')).toBeVisible();
 await page.getByRole('button',{name:'Conferir sequência',exact:true}).click();await expect(page.locator('.expansion-feedback')).toContainText('ainda não combina');
 await page.getByRole('button',{name:'Dica',exact:true}).click();await expect(page.locator('.expansion-feedback')).not.toBeEmpty();
 const expected=PUZZLES[id].cards.map(c=>c.id);
 for(let i=0;i<expected.length;i++){
  const actual=await page.locator('[data-puzzle-card]').evaluateAll(nodes=>nodes.map(n=>n.dataset.puzzleCard));
  if(actual[i]===expected[i])continue;
  await page.locator(`[data-slot="${i}"]`).click();await page.locator(`[data-puzzle-card="${expected[i]}"]`).click();
 }
 // Close/reopen through normal UI: card order must persist, controls release.
 const order=await page.locator('[data-puzzle-card]').evaluateAll(nodes=>nodes.map(n=>n.dataset.puzzleCard));
 await page.locator('#story-close').click();await interact(page);
 expect(await page.locator('[data-puzzle-card]').evaluateAll(nodes=>nodes.map(n=>n.dataset.puzzleCard))).toEqual(order);
 await page.screenshot({animations:'disabled',path:`docs/captures/narrative-expansion/${id}-puzzle.png`});
 await page.getByRole('button',{name:'Conferir sequência',exact:true}).click();await expect(page.locator('#story-panel')).toBeHidden();
}
for(const mission of EXPANSION)test(`${mission.id}: real world interactions complete and resume the mission`,async({page})=>{
 test.setTimeout(600000);
 if(mission.id==='frequency')await page.route('**/radio/audio/**',route=>route.abort());
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await seed(page,{stage:2,collected:['notebook','card','photo'],campaign:mission.requiresMemories?{memories:Array.from({length:6},(_,i)=>`memory-${i+1}`)}:{},schoolVisit:{active:true,floor:0,position:{x:-4.7,z:16},yaw:0,pitch:.38}});
 await start(page);await expect.poll(async()=>(await state(page)).school.active).toBe(true);
 await page.locator('#story-menu').click();await page.getByRole('button',{name:'Expansão narrativa · quatro missões',exact:true}).click();await page.locator(`[data-mission="${mission.id}"]`).click();
 for(let index=0;index<mission.tasks.length;index++){
  const task=mission.tasks[index];console.log(`${mission.id}: ${task.id}`);await expect.poll(async()=>(await state(page)).expansion.quests[mission.id].step).toBe(index);
  for(const id of task.targets||[task.target]){
   await moveToTarget(page,id);await interact(page);
   if(task.type==='puzzle')await solve(page,task.puzzle);
   else if(task.type==='scene'){await expect(page.locator('#cinematic')).toBeVisible();await page.locator('#scene-skip').click();}
   else await finishDialog(page,task.choices?.[0]);
  }
 }
 await expect.poll(async()=>(await state(page)).expansion.quests[mission.id].completed).toBe(true);
 const saved=await state(page);expect(saved.campaign.achievements[`expansion-${mission.id}`]).toBeTruthy();expect(errors).toEqual([]);
 await page.screenshot({animations:'disabled',path:`docs/captures/narrative-expansion/${mission.id}-complete.png`});
 await page.reload();await page.locator('#start').click();await page.evaluate(async()=>window.readGame=(await import('/src/systems/diagnostics.js')).getGameState);
 expect((await state(page)).expansion.quests[mission.id].rewarded).toBe(true);
});

test('plan final scene resumes, skips, rewards once and restores controls',async({page})=>{
 await seed(page,{stage:2,collected:['notebook','card','photo'],expansion:{active:'plan',quests:{plan:{step:5}}},schoolVisit:{active:true,floor:0,position:{x:-4.5,z:16.5},yaw:0,pitch:.38}});
 await start(page);await expect.poll(async()=>(await state(page)).school.active).toBe(true);await interact(page);
 await expect(page.locator('#cinematic')).toBeVisible();await page.locator('#scene-skip').click();
 await expect.poll(async()=>(await state(page)).expansion.quests.plan.completed).toBe(true);
 expect((await state(page)).campaign.achievements['expansion-plan']).toBeTruthy();
 const z=(await state(page)).z;await page.keyboard.down('s');await expect.poll(async()=>(await state(page)).z).toBeGreaterThan(z+.1);await page.keyboard.up('s');
});

test('archive prerequisite and completed rewards integrate into the original album and inventory',async({page})=>{
 await seed(page,{stage:2,collected:['notebook','card','photo']});await start(page);
 await page.locator('#story-menu').click();await page.getByRole('button',{name:'Expansão narrativa · quatro missões',exact:true}).click();await expect(page.locator('[data-mission="archive"]')).toBeDisabled();
 expect((await state(page)).campaign.memories).toHaveLength(0);
 // A completed, legitimate save is used only to verify read-only reward views and replay.
 await page.addInitScript(quests=>{const s=JSON.parse(localStorage.getItem('lorenzo-maria-v04'));s.progress.campaign.memories=Array.from({length:6},(_,i)=>`memory-${i+1}`);s.progress.expansion={active:null,quests};s.progress.schoolVisit={active:true,floor:0,position:{x:-6.5,z:-15.3},yaw:0,pitch:.38};localStorage.setItem('lorenzo-maria-v04',JSON.stringify(s));},Object.fromEntries(EXPANSION.map(m=>[m.id,{step:m.tasks.length,completed:true}])));
 await page.reload();await page.locator('#start').click();await page.evaluate(async()=>window.readGame=(await import('/src/systems/diagnostics.js')).getGameState);await expect.poll(async()=>(await state(page)).school.active).toBe(true);
 await page.locator('#story-menu').click();await page.getByRole('button',{name:'Inventário',exact:true}).click();for(const m of EXPANSION)await expect(page.locator('#story-content')).toContainText(m.item);
 await page.locator('#story-close').click();await page.locator('#story-menu').click();await page.getByRole('button',{name:'Álbum',exact:true}).click();
 const letter=page.locator('.story-card').filter({has:page.getByRole('heading',{name:'Uma Carta Nunca Entregue',exact:true})});await letter.getByRole('button',{name:'Ler carta fictícia',exact:true}).click();await expect(page.locator('#story-content')).toContainText('Ficção narrativa');await expect(page.locator('#story-content')).toContainText('próximas lembranças');
 await page.locator('#story-close').click();await page.locator('#story-menu').click();await page.getByRole('button',{name:'Álbum',exact:true}).click();
 const before=await state(page);
 await page.locator('.story-card').filter({has:page.getByRole('heading',{name:'O Arquivo Aurora',exact:true})}).getByRole('button',{name:'Rever conclusão',exact:true}).click();await expect(page.locator('#cinematic')).toBeVisible();
 await page.locator('#scene-pause').click();const time=(await state(page)).expansionRuntime.sceneTime;
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));expect((await state(page)).expansionRuntime.sceneTime).toBe(time);
 expect((await state(page)).expansionRuntime.temporaryPages).toBe(12);await page.screenshot({animations:'disabled',path:'docs/captures/narrative-expansion/archive-finale.png'});
 await page.locator('#scene-skip').click();expect((await state(page)).expansionRuntime.temporaryPages).toBe(0);expect((await state(page)).campaign).toEqual(before.campaign);expect((await state(page)).expansion).toEqual(before.expansion);
});

test.describe('touchscreen expansion',()=>{
 test.use({hasTouch:true,isMobile:true});
 test('swap targets, multitouch isolation, controls and stable resources across reopenings',async({page})=>{
  test.setTimeout(90000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await seed(page,{stage:2,collected:['notebook','card','photo'],expansion:{active:'plan',quests:{plan:{step:3}}},schoolVisit:{active:true,floor:0,position:{x:-4.5,z:16.5},yaw:0,pitch:.38}});await start(page);await expect.poll(async()=>(await state(page)).school.active).toBe(true);
  for(const viewport of [{width:915,height:412},{width:390,height:844},{width:640,height:360}]){
   await page.setViewportSize(viewport);await interact(page);await expect(page.locator('.expansion-grid button')).toHaveCount(14);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   const sizes=await page.locator('.expansion-grid button').evaluateAll(ns=>ns.map(n=>({w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height})));expect(sizes.every(s=>s.w>=44&&s.h>=44)).toBe(true);
   const initial=await state(page);await page.keyboard.press('w');
   for(const id of [11,12])await page.locator('#joystick').dispatchEvent('pointerdown',{pointerId:id,pointerType:'touch',clientX:60,clientY:viewport.height-65,bubbles:true});
   await page.locator('#joystick').dispatchEvent('pointermove',{pointerId:11,pointerType:'touch',clientX:110,clientY:viewport.height-65,bubbles:true});
   await page.locator('#game').dispatchEvent('pointerdown',{pointerId:13,pointerType:'touch',clientX:viewport.width-30,clientY:200,bubbles:true});await page.locator('#game').dispatchEvent('pointermove',{pointerId:13,pointerType:'touch',clientX:viewport.width-80,clientY:160,bubbles:true});
   await page.locator('[data-slot="0"]').tap();await page.locator('[data-slot="1"]').tap();const after=await state(page);expect(after.x).toBeCloseTo(initial.x,3);expect(after.z).toBeCloseTo(initial.z,3);expect(after.yaw).toBe(initial.yaw);expect(after.analog.x).toBe(0);
   await page.screenshot({animations:'disabled',path:`docs/captures/narrative-expansion/android-${viewport.width}x${viewport.height}.png`});await page.locator('#story-close').tap();
  }
  const resources=await state(page);
  for(let i=0;i<6;i++){await interact(page);await page.locator('#story-close').tap();}
  const after=await state(page);expect(after.geometries).toBe(resources.geometries);expect(after.textures).toBe(resources.textures);expect(after.expansionRuntime.props).toBe(resources.expansionRuntime.props);
  const z=after.z;await page.keyboard.down('s');await expect.poll(async()=>(await state(page)).z).toBeGreaterThan(z+.1);await page.keyboard.up('s');expect(errors).toEqual([]);
 });
});
