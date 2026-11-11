import {test,expect} from '@playwright/test';
import {seed,state} from './helpers.js';

test('expanded B keeps touch, nearby Low silhouettes, presets and legacy v04 progress',async({browser})=>{
 const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await seed(page,{stage:2,collected:['notebook','card','photo'],position:{x:5,z:6}},{quality:'medium',shadows:false});
 await page.goto('http://localhost:5173/?comic=overdrive-20-d2');await page.locator('#start').tap();await page.evaluate(async()=>window.readGame=(await import('/src/systems/diagnostics.js')).getGameState);
 await expect.poll(async()=>(await state(page)).npcs.every(n=>n.model)).toBe(true);
 expect((await state(page)).overdrive).toMatchObject({id:'comic-overdrive-20-d2',proposal:'b',expanded:true});
 await page.locator('#pause-button').tap();await page.locator('#quality').selectOption('low');await page.locator('#resume').tap();
 await expect.poll(async()=>(await state(page)).outlines).toBeGreaterThanOrEqual(2);
 const p=(await state(page)).worldPosition,r=await page.locator('#joystick').boundingBox(),client=await context.newCDPSession(page);
 await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:r.x+r.width/2,y:r.y+r.height/2-40}]});
 try{await expect.poll(async()=>(await state(page)).worldPosition.z).toBeLessThan(p.z-.1);}finally{await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 await page.locator('#pause-button').tap();await page.locator('#quality').selectOption('high');await page.locator('#resume').tap();await expect.poll(async()=>(await state(page)).quality).toBe('high');
 await page.locator('#pause-button').tap();const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lorenzo-maria-v04')));expect(saved.version).toBe(4);expect(saved.progress.collected).toEqual(['notebook','card','photo']);expect(errors).toEqual([]);await context.close();
});
