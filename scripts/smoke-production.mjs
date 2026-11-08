// Run npm run build && npm run preview -- --port 4173 before this script.
import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
 const page=await browser.newPage({viewport:{width:800,height:450}}),errors=[],models=new Map();
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'||m.type()==='warning'&&m.text().startsWith('Modelo '))errors.push(m.text());});
 page.on('response',r=>{if(/models\/aurora\/.*\.glb$/.test(r.url()))models.set(r.url(),r.status());});
 await page.goto('http://localhost:4173');await page.locator('#start').click();await expect(page.locator('#welcome')).toBeHidden();await expect.poll(()=>models.size).toBe(2);expect([...models.values()]).toEqual([200,200]);
 await page.waitForTimeout(700);
 const alpha=await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>{const canvas=document.querySelector('#game'),gl=canvas.getContext('webgl2'),pixel=new Uint8Array(4);gl.readPixels(1,1,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);resolve(pixel[3]);})));
 expect(alpha).toBe(255);expect(errors).toEqual([]);console.log('Production smoke PASS: two GLBs served, game starts and canvas renders without errors.');
}finally{await browser.close();}
