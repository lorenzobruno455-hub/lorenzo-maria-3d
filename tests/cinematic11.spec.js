import {test,expect} from '@playwright/test';
import {seed,start,state} from './helpers.js';
import {sceneStops} from '../src/data/script-staging.js';
import {groupScenes} from '../src/systems/script-progress.js';
const baseline=!!process.env.AURORA_BASELINE;
test.use({viewport:{width:915,height:412},deviceScaleFactor:.5,hasTouch:true,isMobile:true,reducedMotion:'reduce'});
for(const [label,id,group] of [['A','CAP01-CENA02','chapter-1'],['B','CAP01-CENA05','chapter-1'],['C','CAP01-CENA09','chapter-1'],['D','CAP05-CENA01','chapter-5'],['E','CAP06-CENA01','chapter-6'],['F','EP-CENA01','epilogue']])test(`cinematic ${label}: original text, pause, skip and resume`,async({page})=>{
 const p=sceneStops(id)[0],pos=p.approach||p,errors=[];page.on('pageerror',e=>errors.push(e.message));
 await seed(page,{stage:2,collected:['notebook','card','photo'],campaign:{memories:Array.from({length:6},(_,i)=>`memory-${i+1}`)},script:{active:{group,index:groupScenes(group).findIndex(s=>s.id===id),replay:true}},...(p.outside?{position:{x:pos.x,z:pos.z}}:{schoolVisit:{active:true,floor:p.floor,position:{x:pos.x,z:pos.z},yaw:0,pitch:.38}})});
 await start(page);await expect.poll(async()=>(await state(page)).scriptScene).toBe(id);await expect(page.locator('#interact')).toBeEnabled();await page.keyboard.press('e');
 await expect(page.locator('#dialog')).toBeVisible();await page.locator('#dialogue-speed').click();
 await page.screenshot({path:`docs/captures/aurora11/${label}-${baseline?'before':'after'}.png`});
 if(baseline)return;
 expect((await state(page)).cinematic.active).toBe(true);
 await page.locator('#scene-pause').tap();expect((await state(page)).cinematic.paused).toBe(true);
 const before=await state(page);await page.keyboard.press('w');expect((await state(page)).x).toBe(before.x);
 await page.locator('#scene-pause').tap();
 if(label==='C'){
  await page.evaluate(()=>{for(let i=0;i<20&&document.getElementById('speech').textContent!=='Pode ser.';i++){document.getElementById('dialogue-speed').click();document.getElementById('next').click();}});
  await expect(page.locator('#speech')).toHaveText('Pode ser.');await page.screenshot({path:'docs/captures/aurora11/C-acceptance.png'});
 }
 // User exit is an interruption, not successful narrative completion.
 await page.locator('#dialogue-exit').click();await expect.poll(async()=>(await state(page)).cinematic.active).toBe(false);
 expect((await state(page)).scriptScene).toBe(id);
 await page.keyboard.press('e');await expect(page.locator('#cinematic')).toBeVisible();await page.locator('#scene-skip').tap();
 if(['A','B','F'].includes(label)){
  await expect(page.locator('.dialogue-choices button').first()).toBeVisible();await page.locator('.dialogue-choices button').first().click();
  await page.evaluate(()=>{for(let i=0;i<12&&!document.getElementById('dialog').hidden;i++){document.getElementById('dialogue-speed').click();document.getElementById('next').click();}});
 }
 await expect.poll(async()=>(await state(page)).scriptScene).not.toBe(id);
 const saved=await state(page);await page.reload();await page.locator('#start').click();await page.evaluate(async()=>window.readGame=(await import('/src/systems/diagnostics.js')).getGameState);
 expect((await state(page)).scriptScene).toBe(saved.scriptScene);expect((await state(page)).campaign.memories).toEqual(saved.campaign.memories);expect(errors).toEqual([]);
});
