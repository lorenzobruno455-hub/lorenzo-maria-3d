// Isolates the existing casual-conversation timing test against frozen builds.
import {chromium,expect} from '@playwright/test';
import {seed} from '../tests/helpers.js';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results=[];
for(const [phase,port]of [['before',5192],['after',5193]]){
 const page=await browser.newPage({viewport:{width:915,height:412},deviceScaleFactor:.5,hasTouch:true,isMobile:true,reducedMotion:'reduce'}),result={phase,steps:[]};
 await seed(page,{stage:2,collected:['notebook','card','photo'],position:{x:5,z:6.5},campaign:{memories:Array.from({length:6},(_,i)=>`memory-${i+1}`)},living:{spatialActors:{maria:{x:5,y:0,z:5,index:0}}}});
 try{await page.goto(`http://localhost:${port}/?profile`);await page.locator('#start').click();await expect.poll(async()=>(await page.evaluate(()=>auroraPerformance.state())).adventure.active).toBe('lost-book');
 for(let i=0;i<2;i++){
  await expect(page.locator('#prompt')).toContainText(/Maria/i);const s=await page.evaluate(()=>auroraPerformance.state());result.steps.push({i,event:'before tap',player:s.worldPosition,maria:s.npcs.find(n=>n.id==='maria')});
  await page.locator('#interact').tap();await expect(page.locator('#dialog button:visible')).toHaveCount(3);await page.getByRole('button',{name:'CONVERSAR NORMALMENTE',exact:true}).tap();
  await page.evaluate(()=>{for(let i=0;i<300&&!document.getElementById('dialog').hidden;i++){const c=document.querySelector('.dialogue-choices button');if(c){c.click();continue;}document.getElementById('dialogue-speed').click();document.getElementById('next').click();}});
  const after=await page.evaluate(()=>auroraPerformance.state());result.steps.push({i,event:'after dialogue',maria:after.npcs.find(n=>n.id==='maria'),selection:after.campaign.lastDialogue['casual:maria']});
 }result.passed=true;
 }catch(e){result.passed=false;result.error=e.message;result.state=await page.evaluate(()=>auroraPerformance.state());}
 results.push(result);console.log(phase,result.passed?'passed':'failed',result.error?.split('\n')[0]||'');await page.close();
}
writeFileSync('work/aurora12/maria-timing.json',JSON.stringify(results,null,2));await browser.close();
