import {test,expect} from '@playwright/test';
import {seed,start,state} from './helpers.js';
const memories=['memory-1','memory-2','memory-3','memory-4','memory-5','memory-6'];
test('memory library books open original text, animate and return camera without changing rewards',async({page})=>{
 await seed(page,{stage:2,collected:['notebook','card','photo'],doors:[true,true],position:{x:10.1,z:-14.4},yaw:Math.PI,campaign:{memories}});await start(page);
 await expect(page.locator('#prompt')).toContainText('Quando a gente começou');const before=await state(page);await page.keyboard.press('e');
 await expect(page.locator('#dialog')).toBeVisible();await page.locator('#dialogue-speed').click();await expect(page.locator('#speech')).toContainText('19/08/2024');
 await expect.poll(async()=>(await state(page)).memoryBooks[0].angle).toBeGreaterThan(.5);
 await page.locator('#next').click();await page.locator('#dialogue-speed').click();await expect(page.locator('#speech')).toContainText('Aula de história.');
 await page.screenshot({path:'docs/captures/v05/narrative-book.png'});await page.locator('#next').click();await expect(page.locator('#dialog')).toBeHidden();
 await expect.poll(async()=>(await state(page)).memoryBooks[0].angle).toBeLessThan(.05);expect((await state(page)).campaign.vouchers).toEqual(before.campaign.vouchers);
 expect((await state(page)).memoryBooks).toHaveLength(6);expect((await state(page)).spatial.every(p=>p.ok)).toBe(true);
});
test('locked book gives chapter hint and cannot unlock or grant a reward',async({page})=>{
 await seed(page,{doors:[true,true],position:{x:10.1,z:-14.4},yaw:Math.PI});await start(page);await expect(page.locator('#prompt')).toContainText('Quando a gente começou');await page.keyboard.press('e');await page.locator('#dialogue-speed').click();await expect(page.locator('#speech')).toContainText('Livro bloqueado');expect((await state(page)).campaign.memories).toEqual([]);expect((await state(page)).campaign.vouchers).toEqual([]);
});
test('F3 diagnostic displays and releases helpers without changing progress',async({page})=>{
 await seed(page);await page.goto('http://localhost:5173/?debug');await page.locator('#start').click();await page.evaluate(async()=>window.readGame=(await import('/src/systems/diagnostics.js')).getGameState);const before=await state(page);await page.keyboard.press('F3');await page.keyboard.press('F3');expect((await state(page)).campaign).toEqual(before.campaign);expect((await state(page)).spatial.every(p=>p.ok)).toBe(true);
});
test('garden bench seats the player and movement returns to a safe standing position',async({page})=>{
 await seed(page,{position:{x:-25,z:18.9}});await start(page);await expect(page.locator('#prompt')).toContainText('Banco de reflexão');await page.keyboard.press('e');await expect.poll(async()=>(await state(page)).animation).toBe('sit');await page.keyboard.down('w');await expect.poll(async()=>(await state(page)).z).toBeLessThan(18.9);await page.keyboard.up('w');expect((await state(page)).animation).not.toBe('sit');
});
test('school notebook starts original creative dialogue and persists its examined state',async({page})=>{
 await seed(page,{position:{x:-23,z:-10.2},doors:[true,true]});await start(page);await expect(page.locator('#prompt')).toContainText('Caderno de estudos');await page.keyboard.press('e');await expect(page.locator('#dialog')).toBeVisible();await page.locator('#dialogue-speed').click();await expect(page.locator('.dialogue-source')).toContainText('não é transcrição');await page.locator('#dialogue-exit').click();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('lorenzo-maria-v04')).progress.interactions['study-notebook'])).toBe(true);
});
