import {chromium}from'@playwright/test';
import{mkdir,writeFile}from'node:fs/promises';
const url=process.env.CAPTURE_URL||'http://localhost:5173',dir='docs/captures/09',shots=[
 ['campus',null,0,19,0],['path',null,43,20,-Math.PI/2],['entrance',null,60,22,0],
 ['inside',0,0,16,0],['floor-2',1,0,8,0],['floor-3',2,0,5,.45]
];
await mkdir(dir,{recursive:true});const metrics=[],browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{for(const[name,floor,x,z,yaw]of shots){const context=await browser.newContext({viewport:{width:960,height:600}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(p=>localStorage.setItem('lorenzo-maria-v04',JSON.stringify({version:4,progress:p,settings:{quality:'medium',shadows:true,adaptive:false}})),{stage:2,collected:['notebook','card','photo'],campaign:{memories:Array.from({length:6},(_,i)=>`memory-${i+1}`)},position:floor===null?{x,z}:{x:0,z:19},yaw,pitch:.38,schoolVisit:{active:floor!==null,floor:floor??0,position:{x,z},yaw,pitch:.38}});
 await page.goto(url);await page.locator('#start').click();await page.evaluate(async()=>window.readCapture=(await import('/src/systems/diagnostics.js')).getGameState);
 await page.waitForFunction(floor=>{const s=window.readCapture();return(floor===null||s.school.active)&&s.visual.models.lorenzo&&s.visual.models.maria&&s.npcs.every(n=>n.model);},floor);
 if(['path','entrance'].includes(name))await page.waitForFunction(()=>window.readCapture().school.loaded.includes(0));
 await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(700);await page.screenshot({path:`${dir}/${name}.jpg`,quality:85});const s=await page.evaluate(()=>window.readCapture());metrics.push({name,floor,worldPosition:s.worldPosition,cameraWorld:s.cameraWorld,quality:s.quality,drawCalls:s.drawCalls,triangles:s.triangles,geometries:s.geometries,textures:s.textures,school:s.school.loaded});if(errors.length)throw Error(errors.join('\n'));await context.close();console.log(name);
}}finally{await browser.close();}await writeFile(`${dir}/metrics.json`,JSON.stringify({source:process.env.CAPTURE_SOURCE||'working tree',campaign:'six memories unlocked; prologue complete',method:'960×600, medium, shadows on, adaptive off; headless Chromium SwiftShader, loaded models/fonts. No physical Android FPS measurement.',samples:metrics},null,2));
