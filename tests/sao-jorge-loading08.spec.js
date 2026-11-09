import{test,expect}from'@playwright/test';import{seed,state}from'./helpers.js';
test('loading a floor locks legacy menus and restart while retaining a cancel path',async({page})=>{
 let release,began;const pending=new Promise(r=>release=r),requested=new Promise(r=>began=r);await page.route('**/models/sao-jorge/*.glb',async r=>{began();await pending;await r.continue();});await seed(page);await page.goto('http://localhost:5173');await page.evaluate(async()=>window.readGame=(await import('/src/systems/diagnostics.js')).getGameState);await page.locator('#visit-school').click();await requested;
 try{await expect(page.locator('#story-menu')).toBeDisabled();await expect(page.locator('#restart')).toBeDisabled();await expect(page.locator('header')).toHaveJSProperty('inert',true);await expect(page.locator('#school-exit')).toBeEnabled();await page.locator('#school-exit').click();expect((await state(page)).school.active).toBe(false);expect((await state(page)).school.loading).toBe(false);}finally{release();}
 await expect(page.locator('#story-menu')).toBeEnabled();await expect(page.locator('#school-toolbar')).toBeHidden();
});
