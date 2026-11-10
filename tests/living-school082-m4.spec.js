import{test,expect}from'@playwright/test';import{seed,start,state}from'./helpers.js';
test('new hall chairs block movement while leaving inspection and campaign return available',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await seed(page,{stage:2,collected:['notebook','card','photo'],schoolVisit:{active:true,floor:2,position:{x:7.15,z:15.4},yaw:0,pitch:.38}});await start(page);
 await expect.poll(async()=>(await state(page)).school.details?.living.props??0).toBeGreaterThan(0);
 expect((await state(page)).school.floor).toBe(2);
 await page.keyboard.down('w');try{await expect.poll(async()=>(await state(page)).z).toBeLessThan(14.72);await page.waitForTimeout(700);expect((await state(page)).z).toBeGreaterThan(14.6);}finally{await page.keyboard.up('w');}
 await page.locator('#school-inspect').click();await expect.poll(async()=>(await state(page)).school.inspect).toBe(true);await page.locator('#school-inspect').click();await page.locator('#school-exit').click();expect((await state(page)).school.active).toBe(false);expect(errors).toEqual([]);
});
