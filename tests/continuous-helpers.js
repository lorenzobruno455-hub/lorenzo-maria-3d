import{expect}from'@playwright/test';import{state}from'./helpers.js';
// Read-only planning. Travel uses ordinary mouse camera drags and keyboard events.
async function face(page,yaw){
 const sensitivity=Number(await page.locator('#sensitivity').inputValue());
 const attempts=Math.ceil(Math.PI/(.0008*sensitivity*(page.viewportSize()?.width||800)))+2;
 for(let i=0;i<attempts;i++){
  const current=(await state(page)).yaw,angle=Math.atan2(Math.sin(yaw-current),Math.cos(yaw-current));if(Math.abs(angle)<.001)return;
  const p=await page.evaluate(()=>{const c=document.querySelector('#game');for(const fy of [.7,.6,.8,.5])for(const fx of [.5,.4,.6]){const x=innerWidth*fx,y=innerHeight*fy;if(document.elementFromPoint(x,y)===c)return{x,y,width:innerWidth};}throw Error('camera drag surface unavailable');});
  const dx=Math.max(-p.width*.2,Math.min(p.width*.2,-angle/(.004*sensitivity))),expected=current-dx*.004*sensitivity;
  await page.mouse.move(p.x,p.y);await page.mouse.down({button:'right'});await page.mouse.move(p.x+dx,p.y);await page.mouse.up({button:'right'});
  await expect.poll(async()=>Math.abs(Math.atan2(Math.sin((await state(page)).yaw-expected),Math.cos((await state(page)).yaw-expected)))).toBeLessThan(.001);
 }
 throw Error('camera heading did not settle');
}
export async function walkTo(page,target,{timeout=120000}={}){
 const path=await page.evaluate(async target=>{
  const{getNavigationState}=await import('/src/systems/diagnostics.js'),{findPath,clearSegment}=await import('/src/systems/navigation.js'),{blocked}=await import('/src/systems/physics.js'),n=getNavigationState();let raw=[],margin=.25;
  for(const pad of [.25,.12,.03,.01]){
   const solids=n.solids.map(b=>({...b,minX:b.minX-pad,maxX:b.maxX+pad,minZ:b.minZ-pad,maxZ:b.maxZ+pad}));raw=findPath(n.position,target,solids);
   // A collision check may leave the avatar touching a chair. Walk away from it
   // before asking a route with extra clearance to cover the remaining distance.
   if(!raw.length)for(let radius=.5;radius<=2&&!raw.length;radius+=.5)for(let i=0;i<16;i++){
    const p={x:n.position.x+Math.cos(i*Math.PI/8)*radius,z:n.position.z+Math.sin(i*Math.PI/8)*radius};
    if(blocked(p.x,p.z,solids)||!clearSegment(n.position,p,n.solids,.32))continue;const next=findPath(p,target,solids);if(next.length){raw=[p,...next];break;}
   }
   if(raw.length){margin=pad;break;}
  }
  const simple=[];let from=n.position,i=0;while(i<raw.length){let end=i;while(end+1<raw.length&&clearSegment(from,raw[end+1],n.solids,.32+margin))end++;simple.push({x:raw[end].x+n.origin.x,z:raw[end].z+n.origin.z});from=raw[end];i=end+1;}return simple;
 },target);
 expect(path.length,`walkable route to ${JSON.stringify(target)}`).toBeGreaterThan(0);
 const yaw=(await state(page)).yaw,deadline=Date.now()+timeout;
 try{for(const goal of path){
  const p=(await state(page)).worldPosition,dx=goal.x-p.x,dz=goal.z-p.z,length=Math.hypot(dx,dz);if(length<.2)continue;
  await face(page,Math.atan2(-dx,-dz));if(length>5)await page.keyboard.down('Shift');await page.keyboard.down('w');
  const result=await page.evaluate(({goal,dx,dz,length,remaining})=>new Promise(resolve=>{
   let done=false;const finish=ok=>{if(done)return;done=true;clearTimeout(timer);for(const[key,code]of[['w','KeyW'],['Shift','ShiftLeft']])dispatchEvent(new KeyboardEvent('keyup',{key,code,bubbles:true}));resolve({ok,position:window.readGame().worldPosition});};
   const timer=setTimeout(()=>finish(false),remaining),step=()=>{if(done)return;const p=window.readGame().worldPosition,d=((goal.x-p.x)*dx+(goal.z-p.z)*dz)/length;if(d<1.5)dispatchEvent(new KeyboardEvent('keyup',{key:'Shift',code:'ShiftLeft',bubbles:true}));if(d<=.15)finish(true);else requestAnimationFrame(step);};requestAnimationFrame(step);
  }),{goal,dx,dz,length,remaining:Math.max(1,deadline-Date.now())});
  await page.keyboard.up('w');await page.keyboard.up('Shift');expect(result.ok,`walk to ${JSON.stringify(goal)} from ${JSON.stringify(result.position)}`).toBe(true);
 }}finally{await page.keyboard.up('w');await page.keyboard.up('Shift');await face(page,yaw);}
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
