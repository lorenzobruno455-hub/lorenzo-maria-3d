// Controlled captures and native profiling; never physical-device FPS.
import {chromium} from '@playwright/test';
import {seed} from '../tests/helpers.js';
import {EXPANSION} from '../src/data/expansion.js';
import {mkdirSync,writeFileSync,existsSync} from 'node:fs';
const phase=process.argv[2],port=process.argv[3],filter=process.argv[4];
if(!['before','after'].includes(phase)||!/^\d+$/.test(port||''))throw Error('audit-aurora12 before|after PORT [case]');
mkdirSync(`work/aurora12/${phase}`,{recursive:true});mkdirSync('docs/captures/aurora12',{recursive:true});
const school=(floor,x,z,y)=>({schoolVisit:{active:true,floor,position:{x,z,...(y===undefined?{}:{y})},yaw:0,pitch:.38}});
const cases=[
 ['campus',{position:{x:0,z:18}},{position:{x:18,y:11,z:27},focus:{x:0,y:1.6,z:5}}],
 ['exterior',{position:{x:43,z:6}},{position:{x:35,y:9,z:15},focus:{x:59,y:4,z:0}}],
 ['court',{position:{x:62,z:-28}},{position:{x:77,y:9,z:-37},focus:{x:60,y:2.8,z:-25}}],
 ['court-interior',{position:{x:62,z:-28}},{position:{x:67,y:2.6,z:-30},focus:{x:56,y:1.2,z:-25}}],
 ['corridor1',school(1,0,0),{position:{x:60,y:5.7,z:-12},focus:{x:60,y:5.1,z:7}}],
 ['reception',school(0,4.8,-5.4),{position:{x:51.3,y:2.1,z:7},focus:{x:55.5,y:1.2,z:5.5}}],
 ['corridor0',school(0,0,0),{position:{x:60,y:2.1,z:-12},focus:{x:60,y:1.5,z:7}}],
 ['classroom0',school(0,-5,16),{position:{x:62.7,y:2.2,z:-17.5},focus:{x:67,y:1.1,z:-15}}],
 ['classroom1',school(1,6.5,15),{position:{x:57,y:5.7,z:-18},focus:{x:53,y:4.8,z:-14}}],
 ['stairs',school(0,-5,1.3,.57),{position:{x:68,y:2.7,z:-4},focus:{x:65,y:1.6,z:-1}}],
 ['library',school(0,-6,-14),{position:{x:62.7,y:2.3,z:11},focus:{x:67,y:1.1,z:16}}],
 ['lab',school(1,6.8,-7),{position:{x:57,y:5.85,z:3.8},focus:{x:52.5,y:4.7,z:8.5}}],
 ['teachers',school(0,-6,-5),{position:{x:63,y:2.2,z:1.5},focus:{x:67,y:1.1,z:7}}],
 ['hall',school(2,5,0),{position:{x:52,y:9.7,z:-10},focus:{x:60,y:8.3,z:7}}],
 ['garden',{position:{x:12,z:22}},{position:{x:7,y:3.7,z:27},focus:{x:14,y:1.1,z:20}}],
];
const complete={stage:2,collected:['notebook','card','photo'],campaign:{memories:Array.from({length:6},(_,i)=>`memory-${i+1}`),letter:true},script:{completed:['PRO-CENA01','EP-CENA01','EP-CENA02']},living:{mode:'free',events:{'lost-book':'done','familiar-music':'done'}},expansion:{quests:Object.fromEntries(EXPANSION.map(m=>[m.id,{step:m.tasks.length,completed:true,rewarded:true}]))}};
const browser=await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
async function open(progress,view,ratio){
 const page=await browser.newPage({viewport:{width:915,height:412},deviceScaleFactor:ratio,hasTouch:true,isMobile:true,reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await seed(page,{...complete,...progress},{quality:'low',shadows:false,adaptive:false});await page.goto(`http://localhost:${port}/?profile`);await page.locator('#start').click();
 await page.waitForFunction(()=>window.auroraPerformance?.state().npcs.every(n=>n.model),null,{timeout:60000});
 await page.evaluate(view=>window.auroraPerformance.view=view,view);await page.waitForTimeout(1500);return{page,errors};
}
for(const [name,progress,view]of cases){
 if(filter&&name!==filter||existsSync(`work/aurora12/${phase}/${name}.json`))continue;
 const {page,errors}=await open(progress,view,1);await page.screenshot({path:`docs/captures/aurora12/${name}-${phase}.png`});
 const state=await page.evaluate(()=>auroraPerformance.state());writeFileSync(`work/aurora12/${phase}/${name}.json`,JSON.stringify({view,viewport:{width:915,height:412},ratio:1,state,errors},null,2));console.log(phase,name,state.drawCalls,state.triangles,errors.length?'ERRORS:'+errors.join('|'):'ok');await page.close();
}
for(const [name,progress,view]of cases.filter(c=>['campus','court','classroom0','library'].includes(c[0]))){
 if(filter&&name!==filter||existsSync(`work/aurora12/${phase}/${name}-60s.json`))continue;
 const {page,errors}=await open(progress,view,.5);await page.waitForTimeout(3000);await page.evaluate(()=>auroraPerformance.reset());const initial=await page.evaluate(()=>auroraPerformance.state());console.log(phase,name,'60-second window');
 await page.waitForTimeout(60000);const result=await page.evaluate(()=>({profile:auroraPerformance.snapshot(),state:auroraPerformance.state(),heap:performance.memory?performance.memory.usedJSHeapSize:null}));
 writeFileSync(`work/aurora12/${phase}/${name}-60s.json`,JSON.stringify({view,ratio:.5,initial,...result,errors},null,2));console.log(phase,name,'window complete');await page.close();
}
await browser.close();
