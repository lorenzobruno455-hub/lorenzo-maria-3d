import {test,expect} from '@playwright/test';
import {seed,state} from './helpers.js';

for(const variant of ['a','b'])test(`D1 ${variant}: real shaders, mobile controls, Low ink and v04 reload`,async({browser})=>{
 const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await seed(page,{stage:2,collected:['notebook','card','photo'],position:{x:-4,z:20}},{quality:'medium',shadows:false,adaptive:false});
 await page.goto(`http://localhost:5173/?comic=overdrive-20-${variant}`);await page.locator('#start').tap();
 await page.evaluate(async()=>window.readGame=(await import('/src/systems/diagnostics.js')).getGameState);
 await expect.poll(async()=>(await state(page)).visual.models.lorenzo).toBe(true);
 await expect.poll(async()=>(await state(page)).overdrive.edgeBatches).toBe(3);
 const before=(await state(page)).worldPosition,stick=await page.locator('#joystick').boundingBox();
 const cx=stick.x+stick.width/2,cy=stick.y+stick.height/2;
 const client=await context.newCDPSession(page);
 await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:9,x:cx,y:cy-45}]});
 try{await expect.poll(async()=>(await state(page)).worldPosition.z).toBeLessThan(before.z-.12);}finally{await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 await page.locator('#pause-button').tap();await page.locator('#quality').selectOption('low');await page.locator('#resume').tap();
 await expect.poll(async()=>(await state(page)).quality).toBe('low');expect((await state(page)).overdrive.inkPixels).toBeGreaterThanOrEqual(2);
 await page.locator('#pause-button').tap();const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lorenzo-maria-v04')));expect(saved.version).toBe(4);expect(saved.progress.collected).toEqual(['notebook','card','photo']);
 await page.reload();await page.locator('#start').tap();await page.evaluate(async()=>window.readGame=(await import('/src/systems/diagnostics.js')).getGameState);await expect.poll(async()=>(await state(page)).overdrive.id).toBe(`comic-overdrive-20-${variant}`);
 expect((await state(page)).worldPosition.z).toBeCloseTo(saved.progress.position.z,1);expect(errors).toEqual([]);await context.close();
});
