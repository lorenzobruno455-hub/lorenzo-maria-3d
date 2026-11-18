import {test,expect} from '@playwright/test';
import {seed,start,state} from './helpers.js';
test.use({viewport:{width:915,height:412},deviceScaleFactor:.5,hasTouch:true,isMobile:true,reducedMotion:'reduce'});
const baseline=!!process.env.AURORA_BASELINE;
test('five main actions and exactly three Maria choices',async({page})=>{
 await seed(page,{stage:2,collected:['notebook','card','photo'],position:{x:5,z:6.5},campaign:{memories:Array.from({length:6},(_,i)=>`memory-${i+1}`)},living:{mode:'free',spatialActors:{maria:{x:5,y:0,z:5,index:0}}}});
 await start(page);await page.locator('#story-menu').click();await page.screenshot({path:`docs/captures/aurora115/menu-${baseline?'before':'after'}.png`});
 if(!baseline){await expect(page.locator('#story-content button')).toHaveText(['CONTINUAR','MISSÕES','ÁLBUM','EXPLORAR','CONFIGURAÇÕES']);await expect(page.locator('#story-content')).not.toContainText(/Roteiro definitivo|Expansão narrativa|0\.7B/);}
 await page.locator('#story-close').click();await expect(page.locator('#prompt')).toContainText(/Maria/i);await expect(page.locator('#interact')).toBeEnabled();await page.locator('#interact').tap();await expect(page.locator('.dialogue-choices button').first()).toBeVisible();
 await page.screenshot({path:`docs/captures/aurora115/maria-${baseline?'before':'after'}.png`});
 if(baseline)return;
 await expect(page.locator('.dialogue-choices button')).toHaveText(['CONVERSAR SOBRE A HISTÓRIA','CONVERSAR NORMALMENTE','DESPEDIR-SE']);await expect(page.locator('#dialog')).not.toContainText(/LIV-MARIA|cotidianas|Prólogo:/i);
 const saved=await state(page);await page.getByRole('button',{name:'DESPEDIR-SE',exact:true}).tap();await expect(page.locator('#dialog')).toBeHidden();expect((await state(page)).campaign).toEqual(saved.campaign);
 await page.locator('#story-menu').click();await page.getByRole('button',{name:'ÁLBUM',exact:true}).tap();await expect(page.locator('[data-album-category]')).toHaveText(['MEMÓRIAS','CARTAS E DOCUMENTOS','EXTRAS']);await page.screenshot({path:'docs/captures/aurora115/album-after.png'});
});
