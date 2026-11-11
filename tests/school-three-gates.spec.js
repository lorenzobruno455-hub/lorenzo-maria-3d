import {test,expect} from '@playwright/test';
import {seed,start,state} from './helpers.js';
import {walkTo,walkIntoSchool,walkOut} from './continuous-helpers.js';

test('three physical gates connect campus, reception and attached court without teleporting',async({page})=>{
 test.setTimeout(240000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await seed(page,{stage:2,collected:['notebook','card','photo'],position:{x:36,z:20},yaw:0});await start(page);
 expect((await state(page)).school.gates).toHaveLength(3);
 await page.evaluate(()=>{window.crossings=[];let previous=window.readGame();function sample(){const next=window.readGame();if(next.school.active!==previous.school.active)window.crossings.push({before:previous.worldPosition,after:next.worldPosition});previous=next;requestAnimationFrame(sample);}requestAnimationFrame(sample);});
 await walkIntoSchool(page,{arrival:'reception'});expect((await state(page)).school.room).toBe('Recepção');
 await walkTo(page,{x:0,z:18});await expect.poll(async()=>(await state(page)).school.doorAngle).toBeGreaterThan(1.4);
 await walkTo(page,{x:0,z:21});await expect.poll(async()=>(await state(page)).school.active).toBe(false);
 await walkTo(page,{x:69,z:-27});await expect.poll(async()=>(await state(page)).school.gates.find(g=>g.id==='court').angle).toBeGreaterThan(1.4);
 await walkTo(page,{x:73,z:-27});
 const crossings=await page.evaluate(()=>window.crossings);expect(crossings.length).toBeGreaterThanOrEqual(2);for(const p of crossings)expect(Math.hypot(p.before.x-p.after.x,p.before.y-p.after.y,p.before.z-p.after.z)).toBeLessThan(.6);
 await page.locator('#pause-button').click();const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lorenzo-maria-v04')));expect(saved.progress.schoolVisit.active).toBe(false);expect(saved.progress.doors).toHaveLength(2);await page.reload();await page.locator('#start').click();await page.evaluate(async()=>window.readGame=(await import('/src/systems/diagnostics.js')).getGameState);expect((await state(page)).worldPosition.x).toBeCloseTo(saved.progress.position.x,2);
 expect((await state(page)).collected).toBe(3);expect(errors).toEqual([]);
});

test('an old inactive save at the previous doorway recovers nearby outside the new solid wall',async({page})=>{
 await seed(page,{position:{x:60,z:19.1},schoolVisit:{active:false}});await start(page);
 const placement=await page.evaluate(async()=>{const n=(await import('/src/systems/diagnostics.js')).getNavigationState(),{blocked}=await import('/src/systems/physics.js');return{position:n.position,blocked:blocked(n.position.x,n.position.z,n.solids)};});
 expect(placement.blocked).toBe(false);expect(placement.position.z).toBeGreaterThan(19.44);expect(Math.hypot(placement.position.x-60,placement.position.z-19.1)).toBeLessThanOrEqual(2.5);expect((await state(page)).school.active).toBe(false);
});


test('court world save returns through the inner gate and reception to the original campus',async({page})=>{
 test.setTimeout(240000);await seed(page,{stage:2,collected:['notebook','card','photo'],position:{x:73,z:-27}});await start(page);
 await expect.poll(async()=>(await state(page)).school.gates.find(g=>g.id==='court').angle).toBeGreaterThan(1.4);await walkTo(page,{x:69,z:-27});await walkTo(page,{x:60,z:-21});await expect.poll(async()=>(await state(page)).school.doorAngle).toBeGreaterThan(1.4);await walkTo(page,{x:60,z:-18.4});await expect.poll(async()=>(await state(page)).school.active).toBe(true);await walkOut(page);expect((await state(page)).worldPosition.z).toBeCloseTo(19,0);expect((await state(page)).items).toEqual(['notebook','card','photo']);
});
