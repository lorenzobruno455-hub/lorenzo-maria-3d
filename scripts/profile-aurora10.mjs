// Reproducible 60-second software-browser windows; never physical Android FPS.
import{chromium}from'@playwright/test';import{seed}from'../tests/helpers.js';import{mkdirSync,writeFileSync,existsSync}from'node:fs';
const phase=process.argv[2],port=process.argv[3];mkdirSync(`work/aurora10/${phase}`,{recursive:true});mkdirSync('docs/captures/aurora10',{recursive:true});
const cases=[
 ['campus',{position:{x:0,z:19}}, {position:{x:-20,y:13,z:32},focus:{x:0,y:1.5,z:9}}],
 ['school',{schoolVisit:{active:true,floor:0,position:{x:0,z:-5},yaw:0,pitch:.38}}, {position:{x:60,y:2.6,z:0},focus:{x:60,y:1.4,z:8}}],
 ['stairs',{schoolVisit:{active:true,floor:0,position:{x:-5,z:1.3,y:1.1},yaw:Math.PI/2,pitch:.42}}, {position:{x:61,y:4,z:-2},focus:{x:65,y:2,z:-2}}],
 ['court-radio',{position:{x:66,z:-27}}, {position:{x:80,y:10,z:-37},focus:{x:62,y:1,z:-27}}],
 ['dialogue',{campaign:{memories:['memory-1']},script:{active:{group:'chapter-2',index:0}},schoolVisit:{active:true,floor:0,position:{x:-6.5,z:-15.3},yaw:0,pitch:.38}}, {position:{x:64,y:2.6,z:15},focus:{x:66,y:1.4,z:15}}],
 ['puzzle',{expansion:{active:'plan',quests:{plan:{step:3}}},schoolVisit:{active:true,floor:0,position:{x:-4.5,z:16.5},yaw:0,pitch:.38}}, {position:{x:62,y:2.6,z:-16},focus:{x:65,y:1.4,z:-16}}],
];
cases.push(['stairs-midflight',{schoolVisit:{active:true,floor:0,position:{x:-5,z:1.3,y:.57},yaw:Math.PI/2,pitch:.42}},{position:{x:61,y:4,z:-2},focus:{x:65,y:2,z:-2}}]);
const browser=await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const[name,progress,view]of cases){
 if(process.argv[4]&&name!==process.argv[4])continue;
 if(existsSync(`work/aurora10/${phase}/${name}.json`))continue;
 const page=await browser.newPage({viewport:{width:915,height:412},deviceScaleFactor:.5,hasTouch:true,isMobile:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await seed(page,{stage:2,collected:['notebook','card','photo'],campaign:{memories:Array.from({length:6},(_,i)=>`memory-${i+1}`)},living:{mode:'free'},...progress},{quality:'low',shadows:false,adaptive:false});
 await page.goto(`http://localhost:${port}/?profile`);await page.locator('#start').click();await page.waitForFunction(()=>window.auroraPerformance?.state().npcs.every(n=>n.model),null,{timeout:60000});await page.evaluate(view=>auroraPerformance.view=view,view);
 if(name==='court-radio')await page.locator('[data-radio-action="toggle"]').tap();
 if(['dialogue','puzzle'].includes(name)){await page.waitForFunction(()=>!document.getElementById('interact').disabled);await page.keyboard.press('e');await page.waitForFunction(name=>name==='dialogue'?!document.getElementById('dialog').hidden:document.querySelector('.expansion-grid'),name);}
 await page.waitForTimeout(3000);const cdp=await page.context().newCDPSession(page);await cdp.send('Performance.enable');
 await page.evaluate(()=>auroraPerformance.reset());const initial=await page.evaluate(()=>auroraPerformance.state()),memoryBefore=await cdp.send('Performance.getMetrics');console.log(phase,name,'60 seconds');
 await page.waitForTimeout(50000);await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:1000});await cdp.send('Profiler.start');await page.waitForTimeout(10000);const cpu=await cdp.send('Profiler.stop');
 const result=await page.evaluate(()=>({profile:auroraPerformance.snapshot(),state:auroraPerformance.state(),memory:performance.memory?{used:performance.memory.usedJSHeapSize,total:performance.memory.totalJSHeapSize}:null})),memoryAfter=await cdp.send('Performance.getMetrics');
 writeFileSync(`work/aurora10/${phase}/${name}.json`,JSON.stringify({view,initial,...result,memoryBefore,memoryAfter,errors},null,2));writeFileSync(`work/aurora10/${phase}/${name}.cpuprofile`,JSON.stringify(cpu.profile));await page.screenshot({path:`docs/captures/aurora10/${name}-${phase}.png`});console.log(name,'complete');await page.close();
}
await browser.close();
