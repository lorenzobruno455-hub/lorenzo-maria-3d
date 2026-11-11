import {chromium} from '@playwright/test';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';

// Real game renders, restored through the existing v04 save path. No camera or physics overrides.
const variant=process.argv[2]||'baseline',dir=process.env.CAPTURE_DIR||'docs/captures/comic-overdrive-20';
export const scenes=[
 ['facade',null,25,24,-.90,.08],['campus',null,4,20,-.55,.16],
 ['sky-tree',null,10,18,0,.08],['classroom-a',0,-6.5,15.5,Math.PI,.30],
 ['classroom-c',1,6.5,15.5,Math.PI,.30],['corridor',0,0,8,.12,.22],
 ['library',0,-6.5,-13.5,Math.PI,.28],['laboratory',1,6.5,-7,Math.PI,.28],
 ['hall',2,0,5,.45,.45],['entrance-court',null,58,24,-.65,.16],
 ['court',null,-33,10,0,.18],['corridor-2',1,0,8,.12,.22],
 ['trees',null,2,20,-.55,.08],
];
await mkdir(dir,{recursive:true});const metrics=[];
const viewport=process.env.CAPTURE_MOBILE==='1'?{width:844,height:390}:{width:960,height:600},captureQuality=process.env.CAPTURE_QUALITY||'medium';
const layout=JSON.parse(await readFile('src/data/sao-jorge.json','utf8'));
const shots=process.env.CAPTURE_ROOMS==='1'?layout.floors.flatMap(f=>f.rooms.map(r=>[r.id,f.index,r.x,r.z,Math.PI,.28,r.name])):scenes;
const audit=process.env.CAPTURE_AUDIT==='1',settle=audit?3:6,samples=audit?2:8,source=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const previous=(process.env.CAPTURE_CASES||process.env.CAPTURE_RESUME==='1')?JSON.parse(await readFile(`${dir}/${variant}-metrics.json`,'utf8').catch(()=>'{}')).samples||[]:[];
async function persist(){const rows=new Map(previous.map(s=>[s.name,s]));for(const s of metrics)rows.set(s.name,s);await writeFile(`${dir}/${variant}-metrics.json`,JSON.stringify({source,variant,viewport,method:`Chromium/SwiftShader, ${captureQuality}, shadows when preset supports them, adaptive off, reduced motion, v04 restoration, unchanged camera/physics; ${settle} settling frames + ${samples} timing samples in this invocation. Audit samples are not performance benchmarks or physical Android FPS.`,samples:[...rows.values()]},null,2));}
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{for(const[name,floor,x,z,yaw,pitch,expectedRoom]of shots.filter(s=>(process.env.CAPTURE_ROOMS==='1'||process.env.CAPTURE_ALL==='1'||variant==='baseline'||['facade','classroom-a'].includes(s[0]))&&(!process.env.CAPTURE_CASES||process.env.CAPTURE_CASES.split(',').includes(s[0])))){
 if(process.env.CAPTURE_RESUME==='1'&&previous.some(s=>s.name===name))continue;
 const context=await browser.newContext({viewport,reducedMotion:'reduce',...(process.env.CAPTURE_MOBILE==='1'?{isMobile:true,hasTouch:true}:{})}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.addInitScript(p=>localStorage.setItem('lorenzo-maria-v04',JSON.stringify(p)),{version:4,progress:{stage:2,collected:['notebook','card','photo'],campaign:{memories:Array.from({length:6},(_,i)=>`memory-${i+1}`)},position:floor===null?{x,z}:{x:0,z:19},yaw,pitch,schoolVisit:{active:floor!==null,floor:floor??0,position:{x,z},yaw,pitch}},settings:{quality:captureQuality,shadows:true,adaptive:false}});
 const mode=process.env.CAPTURE_MODE!==undefined?process.env.CAPTURE_MODE:variant==='baseline'?'?comic=overdrive-p3-p4':`?comic=overdrive-20-${variant.toLowerCase()}`;
 await page.goto((process.env.CAPTURE_URL||'http://localhost:5173')+mode);await page.locator('#start').click();
 await page.evaluate(async()=>window.readCapture=(await import('/src/systems/diagnostics.js')).getGameState);
 await page.waitForFunction(f=>{const s=readCapture();return s.visual&&(f===null||s.school.active&&!s.school.loading)&&s.visual.models.lorenzo&&s.visual.models.maria&&s.npcs.every(n=>n.model);},floor);
 await page.evaluate(()=>document.fonts.ready);
 const timing=await page.evaluate(async({settle,samples})=>{for(let i=0;i<settle;i++)await new Promise(requestAnimationFrame);const values=[];let last=await new Promise(requestAnimationFrame);for(let i=0;i<samples;i++){const now=await new Promise(requestAnimationFrame);values.push(now-last);last=now;}return{samplesMs:values,meanMs:values.reduce((a,b)=>a+b)/values.length};},{settle,samples});
 const s=await page.evaluate(()=>readCapture());await page.locator('#pause-button').click();await page.addStyleTag({content:'#pause{visibility:hidden!important}'});
 await page.screenshot({path:`${dir}/${name}-${variant}.jpg`,quality:90});
 if(errors.length)throw Error(errors.join('\n'));
 metrics.push({name,room:s.school.room,expectedRoom,worldPosition:s.worldPosition,camera:s.cameraWorld,yaw:s.yaw,pitch:s.pitch,exposure:s.colorbeat.exposure,clock:(await page.locator('#location').textContent()).match(/\d{2}:\d{2}/)?.[0],quality:s.quality,drawCalls:s.drawCalls,triangles:s.triangles,geometries:s.geometries,textures:s.textures,programs:s.colorbeat.programs,overdrive:s.overdrive,timing});
 await persist();await context.close();console.log(`${variant}: ${name}`);
}}finally{await browser.close();}
await persist();
