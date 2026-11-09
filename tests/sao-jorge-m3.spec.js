import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';
import {seed,start,state} from './helpers.js';
import {NARRATIVE_POINTS as points} from '../src/systems/school-narrative-map.js';
mkdirSync('docs/captures/08-m3',{recursive:true});
const ready={stage:2,collected:['notebook','card','photo'],schoolVisit:{active:true,floor:0,position:{x:-4.7,z:16},yaw:0,pitch:.38}};
const firstComplete={version:1,active:null,quests:{'first-encounter':{status:'completed',node:8,choices:{approach:'listen'},receipts:[],rewarded:true}}};
async function boot(page,extra={}){await seed(page,{...ready,...extra});await start(page);await expect.poll(async()=>(await state(page)).school.narrative).toBe(true);}
async function relocate(page,p){
 await page.addInitScript(()=>{const text=sessionStorage.getItem('m3-return');if(!text)return;sessionStorage.removeItem('m3-return');const point=JSON.parse(text),key='lorenzo-maria-v04',s=JSON.parse(localStorage.getItem(key));s.progress.schoolVisit={...s.progress.schoolVisit,active:true,floor:point.floor,position:{x:point.x,z:point.z},yaw:0,pitch:.38};localStorage.setItem(key,JSON.stringify(s));});
 await page.evaluate(p=>sessionStorage.setItem('m3-return',JSON.stringify(p)),{...p,...p.approach});await page.reload();await page.locator('#start').click();await page.evaluate(async()=>window.readGame=(await import('/src/systems/diagnostics.js')).getGameState);await expect.poll(async()=>(await state(page)).school.active).toBe(true);
}
async function nodeAt(page,id,n){await expect.poll(async()=>(await state(page)).adventure.quests[id].node).toBe(n);}
async function finishDialog(page){await expect(page.locator('#dialog')).toBeVisible();for(let i=0;i<8&&await page.locator('#dialog').isVisible();i++){if(await page.locator('.dialogue-choices button').count())break;await page.locator('#dialogue-speed').click();if(await page.locator('#next').isVisible())await page.locator('#next').click();else break;}}
async function interact(page,text){await expect(page.locator('#prompt')).toContainText(text);await page.keyboard.press('e');}
async function begin(page,title){await page.locator('#story-menu').click();await page.getByRole('button',{name:'Aventuras 0.7B',exact:true}).click();await page.getByRole('button',{name:`Iniciar: ${title}`,exact:true}).click();}
async function actorApproach(page,id){const a=(await state(page)).npcs.find(a=>a.id===id);await relocate(page,{floor:a.floor,x:a.x+.9,z:a.z});}

test('M3 Primeiro Encontro completes in the school with cutscene, physical props, choice and reload',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await boot(page);await begin(page,'Primeiro Encontro');await expect(page.locator('#cinematic')).toBeVisible();await page.locator('#scene-pause').click();expect((await state(page)).cinematic.paused).toBe(true);await page.locator('#scene-pause').click();await page.locator('#scene-skip').click();await nodeAt(page,'first-encounter',2);
 await relocate(page,points['study-notebook']);await interact(page,'Caderno');await finishDialog(page);await nodeAt(page,'first-encounter',3);
 await relocate(page,points['classroom-photo']);await interact(page,'Fotografia');await finishDialog(page);await nodeAt(page,'first-encounter',4);
 await actorApproach(page,'maria');await interact(page,'Maria');await finishDialog(page);await page.getByRole('button',{name:'Ouvir com atenção',exact:true}).click();await nodeAt(page,'first-encounter',6);
 await relocate(page,points['school-exercise']);await interact(page,'Atividade');await page.getByRole('button',{name:'O relato original',exact:false}).click();await expect(page.locator('#cinematic')).toBeVisible();await page.locator('#scene-skip').click();await nodeAt(page,'first-encounter',8);
 await page.screenshot({path:'docs/captures/08-m3/first-complete.png'});await relocate(page,points.classroom);expect((await state(page)).campaign.memories).toContain('memory-1');expect((await state(page)).campaign.vouchers.filter(v=>v==='vale-1')).toHaveLength(1);await page.locator('#school-exit').click();expect((await state(page)).school.active).toBe(false);expect((await state(page)).campaign.memories).toContain('memory-1');expect(errors).toEqual([]);
});

test('M3 Livro Perdido completes with clue, puzzle retry, pickup, Bia and persistent reward',async({page})=>{
 await boot(page,{adventure:firstComplete});await begin(page,'O Livro Perdido');await actorApproach(page,'bia');await interact(page,'Bia');await finishDialog(page);await page.getByRole('button',{name:'Seguir as pistas',exact:true}).click();await nodeAt(page,'lost-book',2);
 await relocate(page,points['shelf-clue']);await interact(page,'Pista');await finishDialog(page);await nodeAt(page,'lost-book',3);await interact(page,'lombadas');for(const title of ['Memória','Jardim','Aurora'])await page.getByRole('button',{name:title,exact:true}).click();await nodeAt(page,'lost-book',3);for(const title of ['Aurora','Jardim','Memória'])await page.getByRole('button',{name:title,exact:true}).click();await nodeAt(page,'lost-book',4);
 await relocate(page,points['lost-book']);await interact(page,'Livro');await nodeAt(page,'lost-book',5);await actorApproach(page,'bia');await interact(page,'Bia');await finishDialog(page);await expect(page.locator('#cinematic')).toBeVisible();await page.locator('#scene-skip').click();await nodeAt(page,'lost-book',7);const reputation=(await state(page)).living.reputation.bia;await relocate(page,points['lost-book']);expect((await state(page)).living.events['lost-book']).toBe('done');expect((await state(page)).living.reputation.bia).toBe(reputation);await page.screenshot({path:'docs/captures/08-m3/library.png'});
});

test('M3 Música uses the third-floor instrument, four real rhythm hits, animated finale and save',async({page})=>{
 await boot(page,{adventure:firstComplete});await begin(page,'Uma Música Conhecida');await expect(page.locator('#objective')).toContainText('2º');await actorApproach(page,'davi');await interact(page,'Davi');await finishDialog(page);await page.getByRole('button',{name:'Ensaiar com calma',exact:true}).click();await nodeAt(page,'familiar-music',2);
 await relocate(page,points.score);await interact(page,'Partitura');await nodeAt(page,'familiar-music',3);await relocate(page,points.instrument);await interact(page,'Teclado');await finishDialog(page);await nodeAt(page,'familiar-music',4);await interact(page,'Ensaio');
 for(let i=0;i<4;i++){await page.waitForFunction(()=>{const p=window.readGame().adventureRhythm;return p>.45&&p<.55;});await page.getByRole('button',{name:'Tocar nota',exact:true}).click();if(i<3)await page.waitForFunction(()=>window.readGame().adventureRhythm<.2);}await nodeAt(page,'familiar-music',5);
 await actorApproach(page,'davi');await interact(page,'Davi');await finishDialog(page);await expect(page.locator('#cinematic')).toBeVisible();expect((await state(page)).camera.y).toBeGreaterThan(8);await page.screenshot({path:'docs/captures/08-m3/music-finale.png'});await page.locator('#scene-skip').click();await nodeAt(page,'familiar-music',7);await relocate(page,points.instrument);expect((await state(page)).living.events['familiar-music']).toBe('done');
});

test('M3 six original chapters unlock in order, then all six library books replay without duplicating rewards',async({page})=>{
 test.setTimeout(240000);await boot(page);
 for(let i=1;i<=6;i++){
  const p=points[`memory-${i}`];await relocate(page,p);await expect.poll(async()=>(await state(page)).campaign.steps[`chapter-${i}`]||[]).toContain('visit');
  if([1,2,6].includes(i)){await actorApproach(page,'maria');await interact(page,'Maria');await page.getByRole('button',{name:'Escola',exact:true}).click();await finishDialog(page);await expect.poll(async()=>(await state(page)).campaign.steps[`chapter-${i}`]).toContain('talk');await relocate(page,p);}
  await interact(page,'Descobrir');await finishDialog(page);await expect.poll(async()=>(await state(page)).campaign.memories.length).toBe(i);
 }
 const original=(await state(page)).campaign;expect(original.letter).toBe(true);
 for(let i=0;i<6;i++){
  await relocate(page,{floor:0,x:-7.3+i*.32,z:-12.7});await interact(page,'Ler');await expect(page.locator('#speech')).toContainText(['19/08/2024','19/05/2025','17/08/2025','31/03/2026','05/09/2026','21/09/2026'][i]);await finishDialog(page);
 }
 expect((await state(page)).campaign.memories).toEqual(original.memories);expect((await state(page)).campaign.vouchers).toEqual(original.vouchers);await page.locator('#school-exit').click();expect((await state(page)).campaign.letter).toBe(true);
});

test('M3 Android reads a locked book, follows a quiz across floors and uses touch interactions',async({browser})=>{
 const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true});const page=await context.newPage();await boot(page,{schoolVisit:{active:true,floor:0,position:{x:-7.3,z:-12.7},yaw:0,pitch:.38}});
 await expect(page.locator('#prompt')).toContainText('Ler');await page.locator('#interact').tap();await expect(page.locator('#dialog')).toBeVisible();await page.locator('#dialogue-speed').tap();await expect(page.locator('#speech')).toContainText('bloqueado');await page.locator('#next').tap();
 await page.locator('#story-menu').tap();await page.getByRole('button',{name:'Minijogos',exact:true}).tap();await page.locator('.story-card').filter({has:page.getByRole('heading',{name:'QUIZ: QUEM CONHECE MAIS',exact:true})}).getByRole('button',{name:'Localizar na escola'}).tap();await expect(page.locator('#objective')).toContainText('2º');
 // A real landing interaction, not a floor mutation hook.
 await relocate(page,{floor:0,x:-6.5,z:2.5});await expect(page.locator('#prompt')).toContainText('2º');await page.locator('#interact').tap();await expect.poll(async()=>(await state(page)).school.floor).toBe(1);
 await relocate(page,points.quiz);await expect(page.locator('#prompt')).toContainText('Jogar');await page.locator('#interact').tap();await page.getByRole('button',{name:'Iniciar atividade',exact:true}).tap();await expect(page.locator('#story-content')).toContainText('Pergunta 1/6');await page.screenshot({path:'docs/captures/08-m3/android-quiz.png'});await page.locator('#story-close').tap();await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);await page.locator('#school-exit').tap();await context.close();
});

test('M3 prologue collects all three objects across floors and returns to Maria without changing legacy spawn',async({page})=>{
 await boot(page,{stage:0,collected:[],position:{x:0,z:19},schoolVisit:{active:true,floor:0,position:{x:-3.8,z:16},yaw:0,pitch:.38}});await interact(page,'Maria');await finishDialog(page);await expect.poll(async()=>(await state(page)).stage).toBe(1);
 for(const id of ['notebook','card','photo']){await relocate(page,points[id]);await interact(page,'Recolher');await expect.poll(async()=>(await state(page)).items).toContain(id);}
 await actorApproach(page,'maria');await interact(page,'Maria');await finishDialog(page);await expect.poll(async()=>(await state(page)).stage).toBe(2);await page.locator('#school-exit').click();expect((await state(page)).z).toBe(19);expect((await state(page)).collected).toBe(3);
});

test('M3 matching and rhythm activities launch from their relocated props',async({page})=>{
 await boot(page);for(const id of ['mem','rit']){await relocate(page,points[id]);await interact(page,'Jogar');await page.getByRole('button',{name:'Iniciar atividade',exact:true}).click();await expect(page.locator('#story-content')).toContainText(id==='mem'?'Encontre os seis pares':'Dez notas');await page.locator('#story-close').click();}
});

test('M3 upper-floor cinematic frames visible actors immediately and skips safely',async({page})=>{
 await boot(page,{schoolVisit:{active:true,floor:2,position:{x:6.9,z:0},yaw:0,pitch:.38},adventure:{...firstComplete,active:'familiar-music',quests:{...firstComplete.quests,'familiar-music':{status:'active',node:6,choices:{music:'practice'},receipts:[],rewarded:false}}}});
 await expect(page.locator('#cinematic')).toBeVisible();await page.locator('#scene-pause').click();expect((await state(page)).camera.y).toBeGreaterThan(8);await page.screenshot({path:'docs/captures/08-m3/music-finale.png'});await page.locator('#scene-skip').click();await nodeAt(page,'familiar-music',7);
});
