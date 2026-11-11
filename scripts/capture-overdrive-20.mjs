import {chromium} from '@playwright/test';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';

// Real game renders, restored through the existing v04 save path. No camera or physics overrides.
const variant=process.argv[2]||'baseline',dir='docs/captures/comic-overdrive-20';
export const scenes=[
 ['facade',null,25,24,-.90,.08],['campus',null,4,20,-.55,.16],
 ['sky-tree',null,10,18,0,.08],['classroom-a',0,-6.5,15.5,Math.PI,.30],
 ['classroom-c',1,6.5,15.5,Math.PI,.30],['corridor',0,0,8,.12,.22],
 ['library',0,-6.5,-13.5,Math.PI,.28],['laboratory',1,6.5,-7,Math.PI,.28],
 ['hall',2,0,5,.45,.45],['entrance-court',null,58,24,-.65,.16],
];
await mkdir(dir,{recursive:true});const metrics=[];
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{for(const[name,floor,x,z,yaw,pitch]of scenes.filter(s=>(variant==='baseline'||['facade','classroom-a'].includes(s[0]))&&(!process.env.CAPTURE_CASES||process.env.CAPTURE_CASES.split(',').includes(s[0])))){
 const context=await browser.newContext({viewport:{width:960,height:600},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.addInitScript(p=>localStorage.setItem('lorenzo-maria-v04',JSON.stringify(p)),{version:4,progress:{stage:2,collected:['notebook','card','photo'],campaign:{memories:Array.from({length:6},(_,i)=>`memory-${i+1}`)},position:floor===null?{x,z}:{x:0,z:19},yaw,pitch,schoolVisit:{active:floor!==null,floor:floor??0,position:{x,z},yaw,pitch}},settings:{quality:'medium',shadows:true,adaptive:false}});
 const mode=variant==='baseline'?'':`?comic=overdrive-20-${variant.toLowerCase()}`;
 await page.goto((process.env.CAPTURE_URL||'http://localhost:5173')+mode);await page.locator('#start').click();
 await page.evaluate(async()=>window.readCapture=(await import('/src/systems/diagnostics.js')).getGameState);
 await page.waitForFunction(f=>{const s=readCapture();return(f===null||s.school.active&&!s.school.loading)&&s.visual.models.lorenzo&&s.visual.models.maria&&s.npcs.every(n=>n.model);},floor);
 await page.evaluate(()=>document.fonts.ready);
 const timing=await page.evaluate(async()=>{for(let i=0;i<6;i++)await new Promise(requestAnimationFrame);const values=[];let last=await new Promise(requestAnimationFrame);for(let i=0;i<8;i++){const now=await new Promise(requestAnimationFrame);values.push(now-last);last=now;}return{samplesMs:values,meanMs:values.reduce((a,b)=>a+b)/values.length};});
 const s=await page.evaluate(()=>readCapture());await page.locator('#pause-button').click();await page.addStyleTag({content:'#pause{visibility:hidden!important}'});
 await page.screenshot({path:`${dir}/${name}-${variant}.jpg`,quality:90});
 if(errors.length)throw Error(errors.join('\n'));
 metrics.push({name,worldPosition:s.worldPosition,camera:s.cameraWorld,yaw:s.yaw,pitch:s.pitch,exposure:s.colorbeat.exposure,clock:(await page.locator('#location').textContent()).match(/\d{2}:\d{2}/)?.[0],quality:s.quality,drawCalls:s.drawCalls,triangles:s.triangles,geometries:s.geometries,textures:s.textures,programs:s.colorbeat.programs,overdrive:s.overdrive,timing});
 await context.close();console.log(`${variant}: ${name}`);
}}finally{await browser.close();}
if(process.env.CAPTURE_CASES){const old=JSON.parse(await readFile(`${dir}/${variant}-metrics.json`,'utf8').catch(()=>'{}'));for(const s of old.samples||[])if(!metrics.some(m=>m.name===s.name))metrics.push(s);}
await writeFile(`${dir}/${variant}-metrics.json`,JSON.stringify({source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),variant,viewport:{width:960,height:600},method:'Chromium/SwiftShader, Medium, shadows on, adaptive off, reduced motion, v04 restoration, unchanged camera/physics, six settling frames + eight timing samples. Browser timing is not physical Android FPS.',samples:metrics},null,2));
