import {test,expect} from '@playwright/test';
import {seed,start,state} from './helpers.js';
test('both actual GLBs load, animate and render inside the mobile geometry budget',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/Shader Error|VALIDATE_STATUS/.test(m.text()))errors.push(m.text());});
 await seed(page);await start(page);await expect.poll(async()=>(await state(page)).visual.models).toEqual({lorenzo:true,maria:true});
 const s=await state(page);expect(s.visual.heroInk).toBeGreaterThan(0);expect(s.visual.fallbackInk).toBe(0);for(const name of ['lorenzo','maria'])expect(s.visual.clips[name]).toEqual(expect.arrayContaining(['idle','walk','run','talk','interact','sit','wave']));
 await page.keyboard.down('w');try{await expect.poll(async()=>(await state(page)).z).toBeLessThan(s.z);}finally{await page.keyboard.up('w');}expect(errors).toEqual([]);expect((await state(page)).geometries).toBeLessThan(110);
});
test('failed model requests leave exploration and interaction playable',async({page})=>{
 await page.route('**/models/aurora/*.glb',route=>route.abort());await seed(page,{position:{x:5,z:6}});await start(page);expect((await state(page)).visual.models).toEqual({lorenzo:false,maria:false});await page.keyboard.press('e');await expect(page.locator('#dialog')).toBeVisible();
});
