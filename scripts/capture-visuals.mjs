import { chromium } from '@playwright/test';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const [name,x,z,yaw,pitch] of [['classroom',-20,-11,-1.1,.38],['library',14,-11,1.1,.38],['garden',0,22,0,.35],['courtyard',5,12,Math.PI,.35],['memory-books',11.5,-14.2,0,.5],['walking',5,10,Math.PI,.3]]) {
 const context=await browser.newContext({viewport:{width:960,height:600}});const page=await context.newPage();
 await page.addInitScript(({x,z,yaw,pitch})=>localStorage.setItem('lorenzo-maria-v04',JSON.stringify({version:4,progress:{stage:2,collected:['notebook','card','photo'],position:{x,z},yaw,pitch,doors:[true,true]},settings:{quality:'low',shadows:false,adaptive:false}})),{x,z,yaw,pitch});
 await page.goto('http://localhost:5173');await page.locator('#start').click();await page.waitForTimeout(700);if(name==='walking'){await page.keyboard.down('w');await page.waitForTimeout(350);await page.keyboard.up('w');}await page.locator('#pause-button').click();await page.addStyleTag({content:'header,footer,#mission,#pause,#toast,#prompt,#objective-marker,#location{visibility:hidden!important}'});await page.screenshot({timeout:90000,path:`docs/captures/v05/${process.argv[2]||'before'}-${name}.png`});await context.close();
} await browser.close();
