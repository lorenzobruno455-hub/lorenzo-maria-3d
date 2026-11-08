import {test,expect} from '@playwright/test';
import {seed,start,state} from './helpers.js';
const completed={stage:2,collected:['notebook','card','photo'],doors:[true,true],position:{x:10.1,z:-14.4},yaw:Math.PI,campaign:{memories:['memory-1','memory-2','memory-3','memory-4','memory-5','memory-6']}};
test('comic menus use licensed local fonts and keyboard focus stays readable',async({page})=>{
 await seed(page);await page.goto('http://localhost:5173');
 const loaded=await page.evaluate(async()=>{await document.fonts.load('italic 800 32px "Barlow Condensed"');return [...document.fonts].filter(f=>f.family.includes('Barlow Condensed')&&f.status==='loaded').length;});expect(loaded).toBeGreaterThan(0);
 await expect(page.locator('header')).toHaveCSS('visibility','hidden');
 await expect(page.locator('.welcome-content h2')).toHaveCSS('font-family',/Barlow Condensed/);
 await page.keyboard.press('Tab');await page.keyboard.press('Tab');
 const focus=await page.evaluate(()=>{const e=document.activeElement,s=getComputedStyle(e);return {outline:s.outlineStyle,color:s.color,background:s.backgroundColor};});expect(focus.outline).not.toBe('none');
 await page.screenshot({path:'test-results/comic/main-menu.png'});
});
test('toon school remains inside the low quality drawing budget',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await seed(page);await start(page);
 const s=await state(page);expect(s.visual.toon).toBe(true);expect(s.visual.outlineVertices).toBeGreaterThan(0);expect(s.drawCalls).toBeLessThan(160);expect(s.geometries).toBeLessThan(110);
 await page.screenshot({path:'test-results/comic/exploration.png'});expect(errors).toEqual([]);
});
test('Android landscape memory uses ink panels and leaves the book visible',async({browser})=>{
 const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true});const page=await context.newPage();await seed(page,completed);await start(page);await page.locator('#interact').tap();await page.locator('#dialogue-speed').tap();
 await expect(page.locator('#dialog')).toHaveClass(/comic-panel/);await expect(page.locator('#speech')).toContainText('19/08/2024');await expect(page.locator('#speech')).toHaveCSS('font-family',/Atkinson/);
 const box=await page.locator('#dialog').boundingBox();expect(box.width).toBeLessThan(844*.5);expect(box.x+box.width).toBeLessThanOrEqual(844);
 await page.screenshot({path:'test-results/comic/android-memory.png'});await context.close();
});
test('portrait panels scroll without horizontal overflow and reduced motion suppresses decoration',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const page=await context.newPage();await seed(page);await start(page);await page.locator('#story-menu').tap();await expect(page.locator('.story-window')).toHaveCSS('animation-name','none');
 const widths=await page.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:innerWidth,panel:document.querySelector('.story-window').getBoundingClientRect().width,right:document.querySelector('.story-window').getBoundingClientRect().right}));expect(widths.page).toBe(widths.viewport);expect(widths.panel).toBeLessThanOrEqual(390);expect(widths.right).toBeLessThanOrEqual(390);
 await page.getByRole('button',{name:'Álbum',exact:true}).tap();await expect(page.locator('.album-grid article')).toHaveCount(6);await page.screenshot({path:'test-results/comic/portrait-album.png'});await context.close();
});
test('settings navigation jumps to actual controls and keeps preferences editable',async({page})=>{
 await seed(page);await start(page);await page.locator('#pause-button').click();await page.getByRole('button',{name:'Controles',exact:true}).click();await expect(page.locator('#controls-size')).toBeFocused();await page.locator('#controls-size').fill('1.2');await page.getByRole('button',{name:'Gráficos',exact:true}).click();await expect(page.locator('#quality')).toBeFocused();await page.locator('#quality').selectOption('medium');await expect(page.locator('#quality')).toHaveValue('medium');
});
test('dialogue hover preserves minimum reading contrast',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await seed(page,{position:{x:5,z:6}});await start(page);await page.keyboard.press('e');await page.locator('#dialogue-speed').hover();
 const contrast=await page.locator('#dialogue-speed').evaluate(el=>{const s=getComputedStyle(el),lum=value=>{const c=value.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};const a=lum(s.color),b=lum(s.backgroundColor);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05);});expect(contrast).toBeGreaterThanOrEqual(4.5);
});
