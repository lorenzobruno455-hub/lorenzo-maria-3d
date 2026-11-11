import {test,expect} from '@playwright/test';
import {seed,state} from './helpers.js';

test('exterior approval preview preserves campus collision/save and confines review camera to its query',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await seed(page,{stage:2,collected:['notebook','card','photo'],position:{x:22,z:27}},{quality:'low',shadows:false});
 const start=async url=>{await page.goto(url);await page.locator('#start').click();await page.evaluate(async()=>window.readGame=(await import('/src/systems/diagnostics.js')).getGameState);};
 await start('http://localhost:5173');const before=await state(page),nav=await page.evaluate(async()=>(await import('/src/systems/diagnostics.js')).getNavigationState().solids);
 expect(before.schoolExterior).toBe(null);await page.locator('#pause-button').click();
 await start('http://localhost:5173/?comic=overdrive-20-d3-preview&exterior-view=overview');
 await expect.poll(async()=>(await state(page)).schoolExterior?.windows).toBe(27);
 const preview=await state(page);expect(preview.schoolExterior.proposal.approved).toBe(false);expect(preview.cameraFocusWorld).toEqual({x:60,y:3.5,z:12});expect(preview.campaign).toEqual(before.campaign);
 expect(preview.worldPosition).toEqual(before.worldPosition);expect(await page.evaluate(async()=>(await import('/src/systems/diagnostics.js')).getNavigationState().solids)).toEqual(nav);
 await page.locator('#pause-button').click();await start('http://localhost:5173');expect((await state(page)).schoolExterior).toBe(null);expect((await state(page)).cameraFocusWorld.x).toBeCloseTo(22,4);expect(errors).toEqual([]);
});
