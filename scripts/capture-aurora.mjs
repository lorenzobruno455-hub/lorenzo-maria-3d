// npm run dev first. Captures actual gameplay plus the real asset preview.
// Fixtures use isolated saved starting positions, never production teleport hooks.
import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
await mkdir('docs/captures/07a',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
  for(const [name,x,z,yaw] of [['classroom-after',-20,-11,-1.1],['classroom-teaching-wall',-20,-11,1.1],['library-after',14,-12,1.1]]) {
    const context=await browser.newContext({viewport:{width:960,height:600}}),page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/Shader Error|VALIDATE_STATUS/.test(m.text()))errors.push(m.text());});
    await page.addInitScript(({x,z,yaw})=>localStorage.setItem('lorenzo-maria-v04',JSON.stringify({progress:{stage:2,collected:['notebook','card','photo'],doors:[true,true],position:{x,z},yaw,pitch:.38},settings:{quality:'medium',shadows:true,adaptive:false}})),{x,z,yaw});
    await page.goto('http://localhost:5173');await page.locator('#start').click();
    await page.waitForFunction(async()=>{const s=(await import('/src/systems/diagnostics.js')).getGameState();return s.visual.models.lorenzo&&s.visual.models.maria;});
    await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(800);await page.locator('#pause-button').click();
    await page.addStyleTag({content:'header,footer,#mission,#pause,#toast,#prompt,#objective-marker,#location{visibility:hidden!important}'});
    await page.screenshot({path:`docs/captures/07a/${name}.png`,timeout:60000});if(errors.length)throw Error(errors.join('\n'));await context.close();console.log(`${name}: gameplay captured without runtime/shader errors`);
  }
  for(const before of [true,false]) {
    const page=await browser.newPage({viewport:{width:1100,height:800}});
    await page.goto(`http://localhost:5173/scripts/preview-avatars.html${before?'?before':''}`);await page.waitForFunction(()=>window.ready);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(200);
    if(before)await page.locator('aside small').evaluate(el=>el.textContent='Antes · manequins procedurais originais, sem GLB');
    await page.screenshot({path:`docs/captures/07a/avatars-${before?'before':'after'}.png`});await page.close();
  }
}finally{await browser.close();}
