import {test,expect} from '@playwright/test';
import {seed,start,state} from './helpers.js';
import {face} from './continuous-helpers.js';
test('camera helper uses captured large drags and leaves ordinary controls active',async({page})=>{
 await seed(page,{stage:2,collected:['notebook','card','photo']});await start(page);
 await page.evaluate(()=>{window.largeDrags=0;document.querySelector('#game').addEventListener('pointerdown',()=>window.largeDrags++);});
 for(const yaw of [Math.PI,-Math.PI/2]){await face(page,yaw);expect(Math.abs(Math.atan2(Math.sin((await state(page)).yaw-yaw),Math.cos((await state(page)).yaw-yaw)))).toBeLessThan(.001);}
 expect(await page.evaluate(()=>window.largeDrags)).toBe(2);
 const p=(await state(page)).worldPosition;await page.keyboard.down('w');try{await expect.poll(async()=>(await state(page)).worldPosition.x).toBeGreaterThan(p.x+.1);}finally{await page.keyboard.up('w');}
});

test('P3/P4 compiles seven original actors, respects presets and mobile panel accessibility',async({browser})=>{
 const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await seed(page,{stage:2,collected:['notebook','card','photo'],position:{x:5,z:6}},{quality:'medium',shadows:false});await start(page);await expect.poll(async()=>(await state(page)).npcs.every(n=>n.model)).toBe(true);
 const s=await state(page);expect(s.overdrive).toMatchObject({id:'comic-overdrive-p3-p4',actorProfiles:true,hatching:1});expect(s.visual.models).toEqual({lorenzo:true,maria:true});
 await page.keyboard.press('e');await page.locator('#dialogue-speed').tap();await expect(page.locator('#dialog')).toHaveCSS('background-color','rgb(255, 243, 215)');
 const contrast=await page.locator('#dialogue-exit').evaluate(el=>{const s=getComputedStyle(el),lum=c=>{const v=c.match(/[\d.]+/g).slice(0,3).map(x=>{x=Number(x)/255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return v[0]*.2126+v[1]*.7152+v[2]*.0722;},a=lum(s.color),b=lum(s.backgroundColor);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05);});expect(contrast).toBeGreaterThanOrEqual(4.5);await page.locator('#dialogue-exit').tap();
 for(const quality of ['low','high','medium']){await page.locator('#pause-button').tap();await page.locator('#quality').selectOption(quality);await page.locator('#resume').tap();await expect.poll(async()=>(await state(page)).overdrive.hatching).toBe(quality==='low'?0:1);}
 await page.locator('#pause-button').tap();for(const id of ['#fullscreen-button','#resume']){const box=await page.locator(id).boundingBox();expect(box.height).toBeGreaterThanOrEqual(44);}await page.locator('#resume').tap();
 await page.locator('#story-menu').tap();for(const label of ['Inventário','Álbum','Conquistas','Minijogos']){await page.getByRole('button',{name:label,exact:true}).tap();await expect(page.locator('.story-window')).toBeVisible();await page.locator('#story-close').tap();await page.locator('#story-menu').tap();}
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);await expect(page.locator('.story-window')).toHaveCSS('animation-name','none');await page.emulateMedia({contrast:'more'});await expect(page.locator('.story-window')).toHaveCSS('border-top-color','rgb(255, 255, 255)');expect(errors).toEqual([]);await context.close();
});
