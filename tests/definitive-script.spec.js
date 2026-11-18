import {test,expect} from '@playwright/test';
import {seed,start,state} from './helpers.js';
import {sceneStops} from '../src/data/script-staging.js';
import {mkdirSync} from 'node:fs';
test.use({viewport:{width:915,height:412},deviceScaleFactor:.5,hasTouch:true,isMobile:true,reducedMotion:'reduce'});
mkdirSync('docs/captures/definitive-script',{recursive:true});
const initialized=new WeakSet();
async function reloadAt(page,p){
 if(!initialized.has(page)){initialized.add(page);await page.addInitScript(()=>{
  const raw=sessionStorage.getItem('definitive-return');if(!raw)return;sessionStorage.removeItem('definitive-return');
  const p=JSON.parse(raw),k='lorenzo-maria-v04',s=JSON.parse(localStorage.getItem(k));
  if(p.outside){s.progress.schoolVisit.active=false;s.progress.position={x:p.x,z:p.z};}
  else s.progress.schoolVisit={...s.progress.schoolVisit,active:true,floor:p.floor,position:{x:(p.approach||p).x,z:(p.approach||p).z},yaw:0,pitch:.38};
  localStorage.setItem(k,JSON.stringify(s));
 });}
 await page.evaluate(p=>sessionStorage.setItem('definitive-return',JSON.stringify(p)),p);
 await page.reload();await page.locator('#start').click();await page.evaluate(async()=>window.readGame=(await import('/src/systems/diagnostics.js')).getGameState);await expect.poll(async()=>(await state(page)).school.active).toBe(!p.outside);
}
async function drain(page){
 // Dialogue button handlers are exercised in the DOM; touch targets have a separate test.
 await page.evaluate(()=>{for(let i=0;i<250;i++){
  const choices=document.querySelector('.dialogue-choices button');if(choices){choices.click();continue;}
  const dialog=document.getElementById('dialog');if(!dialog.hidden){document.getElementById('dialogue-speed').click();document.getElementById('next').click();continue;}
  if(!document.getElementById('cinematic').hidden){document.getElementById('scene-skip').click();continue;}
  break;
 }});
}
async function interact(page){await expect(page.locator('#interact')).toBeEnabled();await page.keyboard.press('e');}
async function finishScene(page,id){
 for(const p of sceneStops(id)){
  await reloadAt(page,p);expect((await state(page)).scriptScene).toBe(id);await expect.poll(async()=>(await state(page)).scriptTargets.length).toBe(1);await expect(page.locator('#prompt')).toContainText((await state(page)).scriptTargets[0].name);await interact(page);if(id==='CAP01-CENA09'){await page.evaluate(()=>{for(let i=0;i<20&&document.getElementById('speech').textContent!=='Pode ser.';i++){document.getElementById('dialogue-speed').click();document.getElementById('next').click();}});await page.screenshot({path:'docs/captures/definitive-script/acceptance.png'});}await drain(page);
  if(id==='CAP03-CENA01'&&await page.locator('[data-script-card]').count()){
   await page.getByRole('button',{name:'Conferir sequência',exact:true}).click();await expect(page.locator('#story-content')).toContainText('tente novamente');
   for(const [i,text]of ['Observar','Perguntar','Escutar','Refletir'].entries()){
    const order=await page.locator('[data-script-card]').evaluateAll(ns=>ns.map(n=>n.dataset.scriptCard));if(order[i]!==text){await page.locator('[data-script-card]').nth(i).tap();await page.locator(`[data-script-card="${text}"]`).tap();}
   }
   await page.getByRole('button',{name:'Conferir sequência',exact:true}).click();
  }
  if(id==='CAP04-CENA02'&&await page.locator('#adventure-note').count()){
   for(let n=0;n<4;n++){await page.waitForFunction(()=>{const el=document.querySelector('#adventure-note');const x=parseFloat(el?.style.left||0);return x>40&&x<53;});await page.getByRole('button',{name:'Tocar nota',exact:true}).click();if(n<3)await page.waitForFunction(()=>parseFloat(document.querySelector('#adventure-note')?.style.left||0)<20);}
  }
 }
}
for(let chapter=1;chapter<=6;chapter++)test(`chapter ${chapter}: complete scripted flow resumes and awards its original memory`,async({page})=>{
 test.setTimeout(360000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await seed(page,{stage:2,collected:['notebook','card','photo'],campaign:{memories:Array.from({length:chapter-1},(_,i)=>`memory-${i+1}`)},adventure:chapter===1?{active:'first-encounter',quests:{'first-encounter':{status:'active',node:7,choices:{approach:'listen'}}}}:{active:null,quests:{'first-encounter':{status:'completed',node:8,choices:{approach:'listen'},rewarded:true}}},script:{active:{group:`chapter-${chapter}`,index:0}},schoolVisit:{active:true,floor:0,position:{x:-4,z:16.5}}});await start(page);
 while((await state(page)).script.active){const id=(await state(page)).scriptScene;console.log('scene',id);await finishScene(page,id);expect((await state(page)).scriptScene).not.toBe(id);}
 const done=await state(page);expect(done.campaign.memories).toHaveLength(chapter);expect(done.campaign.vouchers.filter(id=>id===`vale-${chapter}`)).toHaveLength(1);expect(errors).toEqual([]);
 await page.screenshot({path:`docs/captures/definitive-script/chapter-${chapter}.png`});
});
test('chapter dialogue cancels and resumes; touchscreen controls lock, old saves and names remain intact',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await seed(page,{stage:2,collected:['notebook','card','photo'],campaign:{memories:['memory-1']},script:{active:{group:'chapter-2',index:0}},schoolVisit:{active:true,floor:0,position:{x:-6.5,z:-15.3}}});await start(page);await interact(page);await expect(page.locator('#speaker')).toHaveText('HELÔ');await expect(page.locator('.dialogue-source')).toContainText('pendente');await page.screenshot({path:'docs/captures/definitive-script/android-dialogue.png'});
 const before=await state(page);await page.keyboard.down('w');await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));expect((await state(page)).x).toBeCloseTo(before.x,3);expect((await state(page)).z).toBeCloseTo(before.z,3);await page.keyboard.up('w');await page.locator('#dialogue-exit').tap();expect((await state(page)).script.active.index).toBe(0);await interact(page);await drain(page);expect((await state(page)).script.active.index).toBe(1);
 expect(errors).toEqual([]);
});
test('archive epilogue is accessible from old completed save and persists the blank page title',async({page})=>{
 test.setTimeout(120000);await seed(page,{stage:2,collected:['notebook','card','photo'],campaign:{memories:Array.from({length:6},(_,i)=>`memory-${i+1}`)},expansion:{active:null,quests:{archive:{step:7,completed:true,rewarded:true}}},script:{active:{group:'epilogue',index:0}},schoolVisit:{active:true,floor:0,position:{x:-6.5,z:-15.3}}});await start(page);
 await finishScene(page,'EP-CENA01');expect((await state(page)).script.endingTitle).toBe('Amanhã');await finishScene(page,'EP-CENA02');expect((await state(page)).living.mode).toBe('free');expect((await state(page)).campaign.memories).toHaveLength(6);
 await page.reload();await page.locator('#start').click();await page.evaluate(async()=>window.readGame=(await import('/src/systems/diagnostics.js')).getGameState);expect((await state(page)).script.endingTitle).toBe('Amanhã');
});
test('script desk approach keeps the chapter target interactable above legacy props',async({page})=>{
 await seed(page,{stage:2,collected:['notebook','card','photo'],script:{active:{group:'chapter-1',index:2}},schoolVisit:{active:true,floor:0,position:{x:-5.5,z:12.8},yaw:0,pitch:.38}});await start(page);await expect.poll(async()=>(await state(page)).school.active).toBe(true);
 await expect(page.locator('#prompt')).toContainText('Conversas de aula');await interact(page);await drain(page);expect((await state(page)).script.active.index).toBe(3);
});
test('legacy first encounter finale starts the full chapter instead of granting a second memory',async({page})=>{
 await seed(page,{stage:2,collected:['notebook','card','photo'],adventure:{active:'first-encounter',quests:{'first-encounter':{status:'active',node:7,choices:{approach:'listen'}}}},schoolVisit:{active:true,floor:0,position:{x:-4.7,z:16}}});await start(page);
 await expect.poll(async()=>(await state(page)).scriptScene).toBe('CAP01-CENA01');expect((await state(page)).campaign.memories).toHaveLength(0);expect((await state(page)).adventure.quests['first-encounter'].status).toBe('active');
});
test('garden chapter marker remains accessible beside the original photo spot',async({page})=>{
 await seed(page,{stage:2,collected:['notebook','card','photo'],campaign:{memories:['memory-1']},script:{active:{group:'chapter-2',index:1},collected:{'CAP02-CENA02':['CAP02-CENA02:0']}},position:{x:12,z:22}});await start(page);
 const s=await state(page);await expect(page.locator('#prompt')).toContainText('Marcador · distância');
});
test('rewritten library book preserves its opening animation and reading camera',async({page})=>{
 await seed(page,{stage:2,collected:['notebook','card','photo'],campaign:{memories:Array.from({length:6},(_,i)=>`memory-${i+1}`)},schoolVisit:{active:true,floor:0,position:{x:-7.3,z:-12.7}}});await start(page);await expect(page.locator('#prompt')).toContainText('Quando a gente começou');await interact(page);
 await expect(page.locator('#dialog')).toBeVisible();await expect(page.locator('#speech')).toContainText('19/08/2024');await expect.poll(async()=>(await state(page)).memoryBooks[0].angle).toBeGreaterThan(.1);expect((await state(page)).cameraFocusWorld).not.toBeNull();
 await page.screenshot({path:'docs/captures/definitive-script/book-reading.png'});await page.locator('#dialogue-exit').tap();expect((await state(page)).campaign.memories).toHaveLength(6);await expect(page.locator('#dialog')).toBeHidden();
});
