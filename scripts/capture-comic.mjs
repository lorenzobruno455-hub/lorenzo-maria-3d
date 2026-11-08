// Run with the development server already listening on 5173.
// Screenshot fixtures set saved starting positions; production has no teleport API.
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const quality=process.argv[2]||'medium';
if(!['low','medium','high'].includes(quality))throw new Error('Use low, medium or high');
await mkdir('docs/captures/comic',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
 for(const [name,x,z,yaw,pitch] of [['classroom',-20,-11,-1.1,.38],['library',14,-12,1.1,.38],['garden',0,22,0,.35],['courtyard',5,12,0,.35]]) {
  const context=await browser.newContext({viewport:{width:960,height:600}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/Shader Error|VALIDATE_STATUS/.test(m.text()))errors.push(m.text());});
  await page.addInitScript(({x,z,yaw,pitch,quality})=>localStorage.setItem('lorenzo-maria-v04',JSON.stringify({progress:{stage:2,collected:['notebook','card','photo'],position:{x,z},yaw,pitch,doors:[true,true]},settings:{quality,shadows:quality!=='low',adaptive:false}})),{x,z,yaw,pitch,quality});
  await page.goto('http://localhost:5173');await page.locator('#start').click();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(800);
  await page.locator('#pause-button').click();await page.addStyleTag({content:'header,footer,#mission,#pause,#toast,#prompt,#objective-marker,#location{visibility:hidden!important}'});
  await page.screenshot({path:`docs/captures/comic/${name}-${quality}.png`,timeout:60000});
  if(errors.length)throw new Error(errors.join('\n'));console.log(`${name}: ${quality}, captured without runtime/shader errors`);await context.close();
 }
} finally {await browser.close();}
