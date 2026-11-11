import{test,expect}from'@playwright/test';import{seed,start,state,move}from'./helpers.js';import{walkTo}from'./continuous-helpers.js';
test('legacy 0.9 walk from campus through the physical door and back without a world-pose jump',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await seed(page,{stage:2,collected:['notebook','card','photo'],position:{x:34,z:20},yaw:0});await start(page,'http://localhost:5173/?comic=overdrive-p3-p4');
 await expect(page.locator('#visit-school')).toHaveCount(0);await expect(page.locator('#visit-school-paused')).toHaveCount(0);
 const campaign=(await state(page)).campaign;await move(page,'d','x',59.9,'greater');expect((await state(page)).school.active).toBe(false);
 await expect.poll(async()=>(await state(page)).school.loaded.includes(0)).toBe(true);
 await page.evaluate(()=>{window.crossing=[];window.tracking=true;const read=()=>{if(!window.tracking)return;window.crossing.push(window.readGame().worldPosition);requestAnimationFrame(read);};requestAnimationFrame(read);});
 await page.keyboard.down('w');await expect.poll(async()=>(await state(page)).school.active).toBe(true);await page.keyboard.up('w');
 const inside=await state(page);expect(inside.worldPosition.x).toBeGreaterThan(59);expect(inside.worldPosition.z).toBeLessThan(18.9);
 await page.locator('#school-exit').click();expect((await state(page)).school.active).toBe(true);
 await page.keyboard.down('s');await expect.poll(async()=>(await state(page)).school.active).toBe(false);await page.keyboard.up('s');
 const outside=await state(page);expect(outside.worldPosition.x).toBeGreaterThan(59);expect(outside.worldPosition.z).toBeGreaterThan(19.2);expect(outside.campaign).toEqual(campaign);
 const trace=await page.evaluate(()=>{window.tracking=false;return window.crossing;});for(let i=1;i<trace.length;i++)expect(Math.hypot(trace[i].x-trace[i-1].x,trace[i].y-trace[i-1].y,trace[i].z-trace[i-1].z)).toBeLessThan(.6);
 await walkTo(page,{x:60,z:20});await walkTo(page,{x:34,z:20});expect((await state(page)).school.active).toBe(false);expect(errors).toEqual([]);
});

 test('legacy 0.9 path save reloads in world coordinates and Android touch crosses the door with held input',async({browser})=>{
 const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true}),page=await context.newPage();await seed(page,{stage:2,collected:['notebook','card','photo'],position:{x:60,z:20},yaw:0});await start(page,'http://localhost:5173/?comic=overdrive-p3-p4');
 await expect.poll(async()=>(await state(page)).school.loaded.includes(0)).toBe(true);expect((await state(page)).worldPosition.x).toBeCloseTo(60,1);
 await page.locator('#pause-button').tap();await page.reload();await page.locator('#start').tap();await page.evaluate(async()=>window.readGame=(await import('/src/systems/diagnostics.js')).getGameState);expect((await state(page)).worldPosition.x).toBeCloseTo(60,1);expect((await state(page)).school.active).toBe(false);
 await expect.poll(async()=>(await state(page)).school.doorAngle).toBeGreaterThan(1.4);
 const c=await context.newCDPSession(page),r=await page.locator('#joystick').boundingBox(),x=r.x+r.width/2,y=r.y+r.height/2,touch=(type,points)=>c.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(([id,x,y])=>({id,x,y,radiusX:3,radiusY:3,force:1}))});
 await touch('touchStart',[[1,x,y]]);await touch('touchMove',[[1,x,y-45]]);await expect.poll(async()=>(await state(page)).school.active).toBe(true);expect((await state(page)).analog.z).toBeLessThan(-.5);await touch('touchEnd',[]);
 await touch('touchStart',[[2,x,y]]);await touch('touchMove',[[2,x,y+45]]);await expect.poll(async()=>(await state(page)).school.active).toBe(false);expect((await state(page)).analog.z).toBeGreaterThan(.5);await touch('touchEnd',[]);expect((await state(page)).analog.z).toBe(0);await context.close();
 });
