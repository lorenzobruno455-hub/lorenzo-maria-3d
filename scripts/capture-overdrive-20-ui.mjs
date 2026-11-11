import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {seed,start,state} from '../tests/helpers.js';
const dir='docs/captures/comic-overdrive-20-d5';await mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const rows=[];
try{
 if(process.env.CAPTURE_CINEMATIC_ONLY==='1'){
  const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),page=await context.newPage();await seed(page,{stage:2,collected:['notebook','card','photo'],doors:[true,true]},{quality:'low',shadows:false,adaptive:false});await start(page);await expect.poll(async()=>(await state(page)).npcs.every(n=>n.model)).toBe(true);
  await page.locator('#story-menu').tap();await page.getByRole('button',{name:'Aventuras 0.7B',exact:true}).tap();await page.getByRole('button',{name:'Iniciar: Primeiro Encontro',exact:true}).tap();await expect(page.locator('#cinematic')).toBeVisible();await page.locator('#scene-pause').tap();await page.screenshot({path:`${dir}/mobile-cinematic.jpg`,quality:88});expect((await state(page)).cinematic.paused).toBe(true);await context.close();
 }else{
 const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await seed(page,{stage:2,collected:['notebook','card','photo'],position:{x:5,z:6}},{quality:'low',adaptive:false});await start(page);await expect.poll(async()=>(await state(page)).npcs.every(n=>n.model)).toBe(true);
 for(const quality of ['low','medium','high']){
  await page.locator('#pause-button').tap();await page.locator('#quality').selectOption(quality);await page.locator('#shadows').setChecked(quality!=='low');await page.locator('#resume').tap();
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));const s=await state(page);
  rows.push({quality,viewport:{width:844,height:390},drawCalls:s.drawCalls,triangles:s.triangles,geometries:s.geometries,textures:s.textures,models:s.visual.models,npcs:s.npcs.filter(n=>n.model).length});
  await page.screenshot({path:`${dir}/mobile-${quality}.jpg`,quality:88});
 }
 await page.locator('#pause-button').tap();await page.locator('#quality').selectOption('low');await page.screenshot({path:`${dir}/mobile-settings.jpg`,quality:88});await page.locator('#resume').tap();
 await page.keyboard.press('e');await expect(page.locator('#dialog')).toBeVisible();await page.locator('#dialogue-speed').tap();await page.screenshot({path:`${dir}/mobile-dialog.jpg`,quality:88});await page.locator('#dialogue-exit').tap();
 await page.locator('#story-menu').tap();await page.getByRole('button',{name:'Inventário',exact:true}).tap();await page.screenshot({path:`${dir}/mobile-inventory.jpg`,quality:88});
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({contrast:'more'});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);await expect(page.locator('.story-window')).toHaveCSS('animation-name','none');await page.screenshot({path:`${dir}/portrait-contrast.jpg`,quality:88});
 if(errors.length)throw Error(errors.join('\n'));await context.close();
 await writeFile(`${dir}/ui-metrics.json`,JSON.stringify({method:'Chromium/SwiftShader, browser emulation; not physical Android FPS. Reused live settings, no game-state mutation.',rows,errors},null,2));
 }
}finally{await browser.close();}
