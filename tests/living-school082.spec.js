import{test,expect}from'@playwright/test';import{seed,start,state}from'./helpers.js';
test('Living School keeps classroom dressing, corridor signs and narrative books through save/reload',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/Shader Error|VALIDATE_STATUS/.test(m.text()))errors.push(m.text());});
 await seed(page,{stage:2,collected:['notebook','card','photo'],schoolVisit:{active:true,floor:0,position:{x:-6.5,z:15.5},yaw:3.14,pitch:.3}});await start(page);
 await expect.poll(async()=>(await state(page)).school.details?.furniture.details??0).toBeGreaterThan(200);
 const before=await state(page);expect(before.school.details.architecture.signs).toBeGreaterThan(30);
 await page.keyboard.press('ArrowLeft');await page.keyboard.press('ArrowRight');
 await page.locator('#pause-button').click();await page.locator('#resume').click();
 await page.reload();await page.locator('#start').click();await page.evaluate(async()=>window.readGame=(await import('/src/systems/diagnostics.js')).getGameState);
 await expect.poll(async()=>(await state(page)).school.active).toBe(true);
 expect((await state(page)).campaign).toEqual(before.campaign);
 await page.locator('#school-inspect').click();await page.locator('#school-floor-view').selectOption('all');await expect.poll(async()=>(await state(page)).school.loaded.length).toBe(3);
 await page.locator('#school-inspect').click();await page.locator('#school-exit').click();expect((await state(page)).school.active).toBe(false);expect((await state(page)).campaign).toEqual(before.campaign);expect(errors).toEqual([]);
});
