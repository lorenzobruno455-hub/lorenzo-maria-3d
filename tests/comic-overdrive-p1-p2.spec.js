import {test,expect} from '@playwright/test';
import {seed,start,state} from './helpers.js';
import {walkIntoSchool,walkOut} from './continuous-helpers.js';
const done={stage:2,collected:['notebook','card','photo'],campaign:{memories:Array.from({length:6},(_,i)=>`memory-${i+1}`)}};
test('global exterior uses the new profile by default and preserves physical route and legacy save',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await seed(page,{...done,position:{x:34,z:20},yaw:0});await start(page);
 expect((await state(page)).overdrive).toMatchObject({id:'comic-overdrive-20-d2-d3',trees:11,cloudCards:13});
 const campaign=(await state(page)).campaign;await walkIntoSchool(page,{arrival:'reception'});await walkOut(page,{returnToCampus:false});
 await page.locator('#pause-button').click();await page.reload();await page.locator('#start').click();await page.evaluate(async()=>window.readGame=(await import('/src/systems/diagnostics.js')).getGameState);
 expect((await state(page)).campaign).toEqual(campaign);expect((await state(page)).worldPosition.x).toBeCloseTo(48,0);expect(errors).toEqual([]);
});

for(const [floor,x,z]of [[0,-5,-14],[1,6.5,-7],[2,0,5]])test(`global school floor ${floor+1} preserves colliders, memory markers and shader visibility`,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await seed(page,{...done,schoolVisit:{active:true,floor,position:{x,z},yaw:0,pitch:.38}},{quality:'medium',shadows:true});await start(page);await expect.poll(async()=>(await state(page)).school.loading).toBe(false);await expect.poll(async()=>(await state(page)).school.details?.living.props??0).toBeGreaterThan(0);
 const before=await state(page),nav=await page.evaluate(async()=>(await import('/src/systems/diagnostics.js')).getNavigationState().solids);
 expect(before.overdrive.id).toBe('comic-overdrive-20-d2-d3');expect(before.school.floor).toBe(floor);
 await page.goto('http://localhost:5173/?comic=legacy');await page.locator('#start').click();await page.evaluate(async()=>window.readGame=(await import('/src/systems/diagnostics.js')).getGameState);await expect.poll(async()=>(await state(page)).school.loading).toBe(false);
 expect((await state(page)).overdrive).toBe(null);expect((await state(page)).campaign).toEqual(before.campaign);expect((await state(page)).school.narrativeDetails).toEqual(before.school.narrativeDetails);
 if(floor>0)expect(await page.evaluate(async()=>(await import('/src/systems/diagnostics.js')).getNavigationState().solids)).toEqual(nav);else expect((await state(page)).school.room).toBe(before.school.room);expect(errors).toEqual([]);
});
