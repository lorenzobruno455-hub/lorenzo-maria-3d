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
