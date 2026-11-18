import {test,expect} from '@playwright/test';
import {seed,start,state} from './helpers.js';
test.use({viewport:{width:915,height:412},deviceScaleFactor:.5,hasTouch:true,isMobile:true,reducedMotion:'reduce'});
const baseline=!!process.env.AURORA_BASELINE;
test('five main actions and exactly three Maria choices',async({page})=>{
 await seed(page,{stage:2,collected:['notebook','card','photo'],position:{x:5,z:6.5},campaign:{memories:Array.from({length:6},(_,i)=>`memory-${i+1}`)},living:{mode:'free',spatialActors:{maria:{x:5,y:0,z:5,index:0}}}});
 await start(page);await page.locator('#story-menu').click();await page.screenshot({path:`docs/captures/aurora115/menu-${baseline?'before':'after'}.png`});
 if(!baseline){for(const b of await page.locator('#story-content button').all()){const box=await b.boundingBox();expect(box.y+box.height).toBeLessThanOrEqual(412);}await expect(page.locator('#story-content button')).toHaveText(['CONTINUAR','MISSÕES','ÁLBUM','EXPLORAR','CONFIGURAÇÕES']);await expect(page.locator('#story-content')).not.toContainText(/Roteiro definitivo|Expansão narrativa|0\.7B/);}
 await page.locator('#story-close').click();await expect(page.locator('#prompt')).toContainText(/Maria/i);await expect(page.locator('#interact')).toBeEnabled();await page.locator('#interact').tap();await expect(page.locator('.dialogue-choices button').first()).toBeVisible();
 await page.screenshot({path:`docs/captures/aurora115/maria-${baseline?'before':'after'}.png`});
 if(baseline)return;
 await expect(page.locator('#dialog button:visible')).toHaveCount(3);await expect(page.locator('.dialogue-choices button')).toHaveText(['CONVERSAR SOBRE A HISTÓRIA','CONVERSAR NORMALMENTE','DESPEDIR-SE']);await expect(page.locator('#dialog')).not.toContainText(/LIV-MARIA|cotidianas|Prólogo:/i);
 const saved=await state(page);await page.getByRole('button',{name:'DESPEDIR-SE',exact:true}).tap();await expect(page.locator('#dialog')).toBeHidden();expect((await state(page)).campaign).toEqual(saved.campaign);
 await page.locator('#story-menu').click();await page.getByRole('button',{name:'ÁLBUM',exact:true}).tap();await expect(page.locator('[data-album-category]')).toHaveText(['MEMÓRIAS','CARTAS E DOCUMENTOS','EXTRAS']);await page.screenshot({path:'docs/captures/aurora115/album-after.png'});
});

test('explore suspends the campaign, reload keeps it paused and CONTINUAR restores it',async({page})=>{
 await seed(page,{stage:2,collected:['notebook','card','photo'],script:{active:{group:'prologue',index:0}}});await start(page);
 await page.locator('#story-menu').click();await page.getByRole('button',{name:'EXPLORAR',exact:true}).tap();
 await expect.poll(async()=>(await state(page)).script.active).toBe(null);expect((await state(page)).scriptTargets).toHaveLength(0);expect((await state(page)).living.mode).toBe('free');
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('lorenzo-maria-v04')).progress);expect(stored.journey.suspendedScript.prologue.index).toBe(0);
 await page.reload();await page.locator('#welcome-free').click();await page.evaluate(async()=>window.readGame=(await import('/src/systems/diagnostics.js')).getGameState);expect((await state(page)).script.active).toBe(null);
 await page.locator('#story-menu').click();await page.getByRole('button',{name:'CONTINUAR',exact:true}).tap();await expect.poll(async()=>(await state(page)).script.active?.group).toBe('prologue');
 expect((await state(page)).script.active.index).toBe(0);await page.locator('#story-menu').click();await page.getByRole('button',{name:'MISSÕES',exact:true}).click();await page.screenshot({path:'docs/captures/aurora115/missions-after.png'});
});

test('sparse memories and unfinished future quests survive migration without unlocking future entries',async({page})=>{
 await seed(page,{stage:2,collected:['notebook','card','photo'],campaign:{memories:['memory-1','memory-3','memory-6'],achievements:{kept:'2026-01-01T00:00:00Z'}},script:{active:{group:'chapter-5',index:1},collected:{'CAP05-CENA02':['CAP05-CENA02:0']}},adventure:{active:'familiar-music',quests:{'first-encounter':{node:8,status:'completed',choices:{approach:'listen'},rewarded:true},'familiar-music':{node:1,status:'active',choices:{},receipts:['heard']}}},expansion:{active:'frequency',quests:{frequency:{step:2,collected:[],puzzles:{},choices:{}}}},living:{reputation:{bia:3}}});
 await start(page);await expect.poll(async()=>(await state(page)).journey.current).toBe('lost-book');
 const p=await page.evaluate(()=>JSON.parse(localStorage.getItem('lorenzo-maria-v04')).progress);expect(p.campaign.memories).toEqual(['memory-1','memory-3','memory-6']);expect(p.journey.suspendedScript['chapter-5'].index).toBe(1);expect(p.expansion.quests.frequency.step).toBe(2);expect(p.adventure.quests['familiar-music'].status).toBe('paused');expect(p.adventure.quests['familiar-music'].receipts).toEqual(['heard']);expect(p.living.reputation.bia).toBe(3);
 await page.locator('#story-menu').click();await page.getByRole('button',{name:'MISSÕES',exact:true}).click();await expect(page.locator('#story-content')).not.toContainText('Uma Carta Nunca Entregue');await page.keyboard.press('Alt+Shift+D');await expect(page.locator('#story-title')).toHaveText('Missões');
 await page.reload();await page.locator('#start').click();await page.evaluate(async()=>window.readGame=(await import('/src/systems/diagnostics.js')).getGameState);expect((await state(page)).campaign.memories).toEqual(p.campaign.memories);expect((await state(page)).expansion.quests.frequency.step).toBe(2);
});

test('reading the album on the welcome screen cannot silently start the next mission',async({page})=>{
 await seed(page,{campaign:{memories:['memory-1']},living:{mode:'free'}});await page.goto('http://localhost:5173');await page.evaluate(async()=>window.readGame=(await import('/src/systems/diagnostics.js')).getGameState);
 const before=await state(page);expect(before.started).toBe(false);await page.getByRole('button',{name:'ÁLBUM',exact:true}).click();await page.getByRole('button',{name:'LER LEMBRANÇA',exact:true}).first().click();await expect(page.locator('#dialog')).toBeVisible();await page.locator('#dialogue-exit').click();const after=await state(page);expect(after.started).toBe(false);expect(after.adventure.active).toBe(null);expect(after.campaign).toEqual(before.campaign);expect(after.script).toEqual(before.script);
});
