import {chromium,expect} from '@playwright/test';
import {seed} from '../tests/helpers.js';
import {writeFileSync} from 'node:fs';
const phase=process.argv[2],port=process.argv[3];
if(!['before','after'].includes(phase)||!/^\d+$/.test(port||''))throw Error('audit-aurora12-ui before|after PORT');
const browser=await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}),page=await browser.newPage({viewport:{width:915,height:412},deviceScaleFactor:1,hasTouch:true,isMobile:true,reducedMotion:'reduce'}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await seed(page,{stage:2,collected:['notebook','card','photo'],position:{x:5,z:6.5},campaign:{memories:Array.from({length:6},(_,i)=>`memory-${i+1}`)},living:{mode:'free',spatialActors:{maria:{x:5,y:0,z:5,index:0}}}},{quality:'low',shadows:false,adaptive:false});
await page.goto(`http://localhost:${port}/?profile`);await page.locator('#welcome-free').click();await page.waitForFunction(()=>auroraPerformance.state().npcs.every(n=>n.model),null,{timeout:60000});
await page.locator('#story-menu').click();await expect(page.locator('#story-content button')).toHaveText(['CONTINUAR','MISSÕES','ÁLBUM','EXPLORAR','CONFIGURAÇÕES']);
await page.screenshot({path:`docs/captures/aurora12/menu-${phase}.png`});
await page.getByRole('button',{name:'ÁLBUM',exact:true}).tap();await expect(page.locator('[data-album-category]')).toHaveCount(3);await page.screenshot({path:`docs/captures/aurora12/album-${phase}.png`});
await page.locator('#story-close').click();await expect(page.locator('#prompt')).toContainText(/Maria/i);await page.locator('#interact').tap();await expect(page.locator('#dialog button:visible')).toHaveCount(3);await page.screenshot({path:`docs/captures/aurora12/maria-${phase}.png`});
await page.getByRole('button',{name:'DESPEDIR-SE',exact:true}).tap();await page.locator('#pause-button').click();
if(phase==='after'){
 await page.locator('#reduced-motion').check();await page.locator('#visual-effects').uncheck();await expect(page.locator('body')).toHaveClass(/reduce-motion/);await expect(page.locator('body')).toHaveClass(/reduce-effects/);
 await page.locator('#reduced-motion').scrollIntoViewIfNeeded();await page.screenshot({path:'docs/captures/aurora12/accessibility-after.png'});
 await page.reload();await page.locator('#welcome-free').click();await page.locator('#pause-button').click();await expect(page.locator('#reduced-motion')).toBeChecked();await expect(page.locator('#visual-effects')).not.toBeChecked();await page.locator('#resume').click();await expect(page.locator('#pause')).toBeHidden();
 await page.setViewportSize({width:412,height:915});await page.locator('#story-menu').click();await page.screenshot({path:'docs/captures/aurora12/menu-portrait-after.png'});
 for(const button of await page.locator('#story-content button').all()){const b=await button.boundingBox();expect(b.width).toBeGreaterThanOrEqual(44);expect(b.height).toBeGreaterThanOrEqual(44);expect(b.x).toBeGreaterThanOrEqual(0);expect(b.x+b.width).toBeLessThanOrEqual(412);}
}
expect(errors).toEqual([]);writeFileSync(`work/aurora12/ui-${phase}.json`,JSON.stringify({checks:['five menu actions','three Maria choices','three album categories',...(phase==='after'?['settings persistence','portrait touch targets']:[])],errors},null,2));console.log(phase,'UI checks passed');await browser.close();
