import {test,expect} from '@playwright/test';
import {seed} from './helpers.js';
test('legacy planar interior wall has no repeated self-shadow lighting bands',async({page})=>{
 await page.setViewportSize({width:960,height:600});
 await seed(page,{stage:2,collected:['notebook','card','photo'],doors:[true,true],position:{x:14,z:-12},yaw:1.1,pitch:.38},{quality:'medium',shadows:true,adaptive:false});
 // Comic Overdrive deliberately adds hatching; retain this flat-wall acne guard
 // for the unchanged legacy renderer rather than loosening its pixel threshold.
 await page.goto('http://localhost:5173/?comic=legacy');await page.locator('#start').click();
 const stats=await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>{
  const canvas=document.querySelector('#game'),gl=canvas.getContext('webgl2'),w=220,h=140,pixels=new Uint8Array(w*h*4);gl.readPixels(80,canvas.height-180,w,h,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
  let sum=0,sumSq=0;for(let i=0;i<pixels.length;i+=4){sum+=pixels[i];sumSq+=pixels[i]*pixels[i];}const n=w*h,mean=sum/n;resolve({mean,std:Math.sqrt(sumSq/n-mean*mean),alpha:pixels[3]});
 })));
 expect(stats.alpha).toBe(255);expect(stats.mean).toBeGreaterThan(20);expect(stats.std).toBeLessThan(3);
});
