import{expect}from'@playwright/test';import{state}from'./helpers.js';
// Read-only navigation planning. Every displacement is produced by real keys.
export async function walkTo(page,target,{timeout=120000}={}){
 const path=await page.evaluate(async target=>{const{getNavigationState}=await import('/src/systems/diagnostics.js'),{findPath,clearSegment}=await import('/src/systems/navigation.js'),n=getNavigationState(),raw=findPath(n.position,target,n.solids.map(b=>({...b,minX:b.minX-.25,maxX:b.maxX+.25,minZ:b.minZ-.25,maxZ:b.maxZ+.25}))),simple=[];let from=n.position,i=0;while(i<raw.length){let end=i;while(end+1<raw.length&&clearSegment(from,raw[end+1],n.solids,.57))end++;simple.push({x:raw[end].x+n.origin.x,z:raw[end].z+n.origin.z});from=raw[end];i=end+1;}return simple;},target);
 expect(path.length,`walkable route to ${JSON.stringify(target)}`).toBeGreaterThan(0);
 let last,from=(await state(page)).worldPosition;const held=new Set(),deadline=Date.now()+timeout;let i=0;
 try{while(i<path.length&&Date.now()<deadline){const s=await state(page),p=s.worldPosition||s,goal=path[i],dx=goal.x-p.x,dz=goal.z-p.z,d=Math.hypot(dx,dz);last={p,goal,yaw:s.yaw};if(d<.26){from=goal;i++;continue;}
  const vx=goal.x-from.x,vz=goal.z-from.z,length=Math.hypot(vx,vz),t=Math.min(1,Math.max(0,((p.x-from.x)*vx+(p.z-from.z)*vz)/(length*length))+.4/length),ax=from.x+vx*t-p.x,az=from.z+vz*t-p.z;
  const x=ax*Math.cos(s.yaw)-az*Math.sin(s.yaw),z=ax*Math.sin(s.yaw)+az*Math.cos(s.yaw),keys=new Set();
  if(Math.abs(x)>Math.abs(z)*.5)keys.add(x>0?'d':'a');if(Math.abs(z)>Math.abs(x)*.5)keys.add(z>0?'s':'w');
  for(const k of held)if(!keys.has(k)){await page.keyboard.up(k);held.delete(k);}for(const k of keys)if(!held.has(k)){await page.keyboard.down(k);held.add(k);}
  await page.waitForTimeout(35);
 }}finally{for(const k of held)await page.keyboard.up(k);}
 expect(i,`walk completed to ${JSON.stringify(target)}: ${JSON.stringify(last)}`).toBe(path.length);
}
export async function walkIntoSchool(page){
 if(!(await state(page)).started)await page.locator('#start').click();if((await state(page)).paused)await page.locator('#resume').click();
 await walkTo(page,{x:36,z:20});await walkTo(page,{x:60,z:20});await expect.poll(async()=>(await state(page)).school.doorAngle,{timeout:20000}).toBeGreaterThan(1.4);await walkTo(page,{x:60,z:18.4});await expect.poll(async()=>(await state(page)).school.active).toBe(true);
}
export async function walkOut(page,{returnToCampus=true}={}){
 const layout=(await import('../src/data/sao-jorge.json',{with:{type:'json'}})).default;
 if((await state(page)).school.inspect)await page.locator('#school-inspect').click();
 while((await state(page)).school.floor>0){const f=(await state(page)).school.floor,p=layout.floors[f].stairs.find(s=>s.destination===f-1);await walkTo(page,p);await expect(page.locator('#prompt')).toContainText(`${f}º`);await page.keyboard.press('e');await expect.poll(async()=>(await state(page)).school.floor).toBe(f-1);}
 await walkTo(page,{x:0,z:18.1});await expect.poll(async()=>(await state(page)).school.doorAngle).toBeGreaterThan(1.4);await walkTo(page,{x:0,z:20.3});await expect.poll(async()=>(await state(page)).school.active).toBe(false);
 if(returnToCampus){await walkTo(page,{x:36,z:20});await walkTo(page,{x:0,z:19});}
}
