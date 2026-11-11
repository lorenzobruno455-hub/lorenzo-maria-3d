import{walkIntoSchool,walkOut}from'./continuous-helpers.js';
import {test,expect} from '@playwright/test';import {seed,start,state,move} from './helpers.js';import {mkdir,writeFile} from 'node:fs/promises';
const ready={stage:2,collected:['notebook','card','photo'],position:{x:0,z:19},schoolVisit:{active:true,floor:0,position:{x:0,z:14.5},yaw:0,pitch:.38}};
const frames=page=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function boot(page,progress={}){await seed(page,{...ready,...progress});await start(page);await expect.poll(async()=>(await state(page)).school.active).toBe(true);}
async function noOverlap(page,a,b){const boxes=await Promise.all([page.locator(a).boundingBox(),page.locator(b).boundingBox()]);expect(boxes.every(Boolean)).toBe(true);const[x,y]=boxes;expect(x.x+x.width<=y.x||y.x+y.width<=x.x||x.y+x.height<=y.y||y.y+y.height<=x.y,`${a} overlaps ${b}`).toBe(true);}

test('M4 keyboard collision, elevated camera, mouse orbit and inspection remain functional',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await boot(page);
 await move(page,'w','z',10.5);await move(page,'d','x',1.35,'greater');await page.keyboard.down('d');await page.waitForTimeout(450);await page.keyboard.up('d');const x=(await state(page)).x;expect(x).toBeLessThan(1.65);await move(page,'a','x',0);await move(page,'w','z',2.5);await move(page,'a','x',-5.5);await expect(page.locator('#prompt')).toContainText('2º');await page.keyboard.press('e');await expect.poll(async()=>(await state(page)).school.floor).toBe(1);expect((await state(page)).y).toBeCloseTo(3.63);
 const yaw=(await state(page)).yaw;await page.mouse.move(450,280);await page.mouse.down();await page.mouse.move(570,310,{steps:6});await page.mouse.up();await expect.poll(async()=>(await state(page)).yaw).not.toBe(yaw);expect((await state(page)).camera.distance).toBeGreaterThan(.1);
 await page.locator('#school-inspect').click();await expect(page.locator('#mission')).toBeHidden();await page.locator('#school-floor-view').selectOption('all');await expect.poll(async()=>(await state(page)).school.loaded.length).toBe(3);await page.locator('#school-inspect').click();expect((await state(page)).school.floor).toBe(1);expect(errors).toEqual([]);
});

test('M4 touch HUD stays clear in portrait/landscape and NPC dialogue keeps a finite facing direction',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),page=await context.newPage();await boot(page,{schoolVisit:{active:true,floor:0,position:{x:-3.1,z:-14},yaw:0,pitch:.38}});
 await page.waitForFunction(()=>document.querySelector('#toast').hidden);await expect(page.locator('#prompt')).toContainText('Bia');await noOverlap(page,'header','#school-toolbar');await noOverlap(page,'#school-toolbar','#mission');await noOverlap(page,'#location','#touch-actions');await noOverlap(page,'#location','#prompt');expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
 await page.locator('#interact').tap();await expect(page.locator('#dialog')).toBeVisible();await expect.poll(async()=>{const a=(await state(page)).npcs.find(n=>n.id==='bia');return Number.isFinite(a.rotation)&&Number.isFinite(a.renderRotation)&&Math.abs(a.rotation)>.1&&a.visible;}).toBe(true);await page.locator('#dialogue-exit').tap();
 await page.setViewportSize({width:844,height:390});await frames(page);await noOverlap(page,'#mission','#school-toolbar');await noOverlap(page,'#location','#touch-actions');await noOverlap(page,'#location','#prompt');expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(844);await context.close();
});

test('M4 repeated three-floor visits retain stable GPU resource counts and the same campaign',async({page})=>{
 await boot(page);await page.waitForFunction(()=>{const s=window.readGame();return s.npcs.every(n=>n.model)&&s.visual.models.lorenzo;});const campaign=(await state(page)).campaign,rows=[];
 for(let i=0;i<3;i++){
  if(i){await page.locator('#pause-button').click();await walkIntoSchool(page,{arrival:'reception'});await expect.poll(async()=>(await state(page)).school.active).toBe(true);}
  await page.locator('#school-inspect').click();await page.locator('#school-floor-view').selectOption('all');await expect.poll(async()=>(await state(page)).school.loaded.length).toBe(3);await expect(page.locator('#school-inspect')).toBeEnabled();await page.locator('#school-inspect').click();await walkOut(page,{returnToCampus:false});await frames(page);const s=await state(page);expect(s.campaign).toEqual(campaign);rows.push({cycle:i+1,geometries:s.geometries,textures:s.textures});
 }
 expect(rows[2].geometries).toBe(rows[1].geometries);expect(rows[2].textures).toBe(rows[1].textures);await mkdir('work/aurora08m4',{recursive:true});await writeFile('work/aurora08m4/lifecycle.json',JSON.stringify(rows,null,2));
});

// Walking replaces instant visits; budget includes the actual route.
test.setTimeout(240000);
