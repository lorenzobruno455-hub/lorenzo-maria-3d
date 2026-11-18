import {test,expect} from '@playwright/test';
import {seed,start,state} from './helpers.js';
test.use({viewport:{width:915,height:412},deviceScaleFactor:.5,hasTouch:true,isMobile:true});
test('visual accessibility survives reload without changing campaign and restores touch/keyboard exploration',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await seed(page,{stage:2,collected:['notebook','card','photo'],position:{x:0,z:18},living:{mode:'free'},campaign:{memories:['memory-1','memory-3']}});
 await page.goto('http://localhost:5173');await page.locator('#welcome-free').tap();await page.evaluate(async()=>window.readGame=(await import('/src/systems/diagnostics.js')).getGameState);const original=(await state(page)).campaign;
 await page.locator('#pause-button').tap();await page.locator('#reduced-motion').check();await page.locator('#visual-effects').uncheck();await expect(page.locator('body')).toHaveClass(/reduce-motion/);
 await page.locator('#resume').tap();await expect(page.locator('#pause')).toBeHidden();await page.keyboard.down('s');await page.waitForTimeout(1000);await page.keyboard.up('s');const moved=await state(page);expect(moved.z).not.toBe(18);expect(moved.campaign).toEqual(original);
 await page.reload();await page.locator('#welcome-free').tap();await page.evaluate(async()=>window.readGame=(await import('/src/systems/diagnostics.js')).getGameState);await page.locator('#pause-button').tap();await expect(page.locator('#reduced-motion')).toBeChecked();await expect(page.locator('#visual-effects')).not.toBeChecked();
 await page.locator('#reduced-motion').uncheck();await page.locator('#visual-effects').check();await expect(page.locator('body')).not.toHaveClass(/reduce-motion|reduce-effects/);for(const q of ['medium','high','low']){await page.locator('#quality').selectOption(q);await expect.poll(async()=>(await state(page)).quality).toBe(q);}
 await page.locator('#resume').tap();
 await expect.poll(async()=>(await state(page)).npcs.every(n=>n.model),{timeout:60000}).toBe(true);
 await page.locator('#story-menu').click();const resources=await state(page);
 for(let i=0;i<6;i++){await page.getByRole('button',{name:'ÁLBUM',exact:true}).click();await page.locator('#story-close').click();await page.locator('#story-menu').click();}
 const after=await state(page);expect(after.geometries).toBe(resources.geometries);expect(after.textures).toBe(resources.textures);expect(after.campaign).toEqual(original);await page.locator('#story-close').click();
 const stick=await page.locator('#joystick').boundingBox();await page.touchscreen.tap(stick.x+stick.width/2,stick.y+stick.height/2);await expect(page.locator('#pause')).toBeHidden();expect(errors).toEqual([]);
});
