import{SharedPathfinder}from'./shared-pathfinder.js';
import * as THREE from'three';import{SpatialRoutePlanner}from'./spatial-routing.js';import{schoolPointToWorld,schoolPointToLocal}from'./world-coordinates.js';import{walkY,stairAt}from'./physical-stairs.js';import{ACTOR_ROUTES}from'./school-narrative-map.js';import{nextStep}from'./quests.js';import{currentExpansion}from'./expansion-progress.js';
const room=(f,x,z,duration=8)=>({f,x,z,duration});
const ROUTES={maria:[room(0,-4.7,16),room(0,-4,-14),room(null,5,5)],bia:[room(0,-4,-14),room(0,0,-12),room(null,10,22)],caio:[room(null,66,-27),room(null,0,12),room(0,0,10)],helena:[room(1,-6,-13.5),room(1,-5,15),room(0,0,10)],davi:[room(2,6,0),room(1,0,9),room(null,5,5)],lia:[room(0,5.5,-5.5),room(0,0,-12),room(null,0,-20)]};
export class ContinuousActors{
 constructor({school,living,world,scene,getProgress,adventure,player}){
  Object.assign(this,{school,living,world,scene,getProgress,adventure,player});this.planner=new SpatialRoutePlanner(school,world);this.pathfinder=new SharedPathfinder();this.planning=false;this.disposed=false;this.planClock=0;this.time=0;this.reservations=new Map();this.actors=living.actors;
  for(const actor of this.actors){const id=actor.definition.id,persisted=getProgress().living.spatialActors?.[id],old=getProgress().schoolVisit.actors?.[id],start=getProgress().schoolVisit.active?(old||ACTOR_ROUTES[id].start):actor.definition.start;const p=persisted?{...persisted}:getProgress().schoolVisit.active?schoolPointToWorld({...start,y:walkY(start.floor??ACTOR_ROUTES[id].floor)},school.rotation):{...start,y:world.groundHeight(start.x,start.z)};
   actor.spatial={position:{x:p.x,y:p.y,z:p.z},index:persisted?.index||0,timer:persisted?.timer||0,path:[],wait:0,speed:0,heading:persisted?.rotation||0,blocked:0};scene.attach(actor.character.root);
  }
  school.spatial=this;living.spatial=this;school.narrative.spatial=this;school.legacyRoots=school.legacyRoots.filter(r=>!this.actors.some(a=>a.character.root===r));adventure.cutscenes.preserveActorPositions=true;this.present();
 }
 route(actor){return ROUTES[actor.definition.id].map(p=>p.f===null?{x:p.x,z:p.z,y:this.world.groundHeight(p.x,p.z),duration:p.duration}:({...schoolPointToWorld({x:p.x,z:p.z,y:walkY(p.f)},this.school.rotation),duration:p.duration}));}
 get positions(){return this.actors.map(a=>a.spatial.position);}
 required(id){const p=this.getProgress(),step=currentExpansion(p.expansion)?.task;return this.adventure.current?.step?.target===id||step?.target===id||id==='maria'&&(p.stage<2||!this.living.free&&nextStep(p.campaign)?.type==='talk');}
 openDoors(){for(const d of this.world.doors)if(!d.transient&&this.positions.some(p=>p.y<2.7&&Math.hypot(p.x-d.x,p.z-d.z)<2.8))d.open=true;}
 update(dt,{dialogueOpen=false,speaker='',active=false,playerSpeed=0}={}){
  this.time+=dt;this.planClock=Math.max(0,this.planClock-dt);this.getProgress().living.actorClock=(this.getProgress().living.actorClock+dt)%86400;
  const player=this.player.getWorldPosition(new THREE.Vector3());
  for(const actor of this.actors){const s=actor.spatial,id=actor.definition.id,local=schoolPointToLocal(s.position,this.school.rotation),onStair=stairAt(local),speaking=dialogueOpen&&this.living.speakingId===id;actor.reaction=Math.max(0,(actor.reaction||0)-dt);s.speed=0;s.wait=Math.max(0,s.wait-dt);
   if(speaking||this.required(id)&&onStair===null){s.state=speaking&&speaker===actor.definition.name.toUpperCase()?'talk':'observe';if(speaking)s.heading=Math.atan2(player.x-s.position.x,player.z-s.position.z);continue;}
   const route=this.route(actor),goal=route[s.index%route.length];
   if(Math.hypot(goal.x-s.position.x,goal.z-s.position.z,goal.y-s.position.y)<.2){s.timer+=dt;s.state='observe';if(s.timer>=goal.duration){s.index=(s.index+1)%route.length;s.timer=0;s.path=[];actor.agent.transitions++;}continue;}
   if(!s.path.length&&s.wait<=0&&this.planClock<=0&&!this.planning&&dt>0){if(this.pathfinder.worker){this.planning=true;const index=s.index;void this.planner.planAsync({...s.position},goal,this.pathfinder).then(path=>{if(!this.disposed&&s.index===index)s.path=path;}).finally(()=>{this.planning=false;});}else if(typeof Worker!=='function')s.path=this.planner.plan(s.position,goal);s.wait=1.2;this.planClock=.18;}
   while(s.path.length&&Math.hypot(s.path[0].x-s.position.x,s.path[0].z-s.position.z,s.path[0].y-s.position.y)<.13)s.path.shift();
   const point=s.path[0];if(!point){s.state='observe';continue;}
   const ramp=point.ramp;
   if(ramp!==undefined){const owner=this.reservations.get(ramp),playerLocal=schoolPointToLocal(player,this.school.rotation);if(owner&&owner!==id||!owner&&stairAt(playerLocal)===ramp){s.state='observe';continue;}this.reservations.set(ramp,id);if(!this.school.leases.has(ramp+1)){void this.school.ensureFloor(ramp+1).catch(()=>{});s.state='observe';continue;}}
   for(const[r,owner]of this.reservations)if(owner===id&&r!==ramp&&onStair!==r)this.reservations.delete(r);
   const dx=point.x-s.position.x,dz=point.z-s.position.z,length=Math.hypot(dx,dz);if(length<1e-5)continue;const amount=Math.min(length,1.45*dt),delta={x:dx/length*amount,z:dz/length*amount},test={x:s.position.x+delta.x,z:s.position.z+delta.z};
   const crowd=this.actors.some(a=>a!==actor&&Math.abs(a.spatial.position.y-s.position.y)<1.3&&Math.hypot(test.x-a.spatial.position.x,test.z-a.spatial.position.z)<.7)||Math.abs(player.y-s.position.y)<1.3&&Math.hypot(test.x-player.x,test.z-player.z)<.7;
   let distance=0;if(!crowd)distance=this.school.moveBodyWorld(s.position,delta);s.speed=distance/Math.max(.001,dt);s.state=distance>.001?'walk':'observe';if(distance){s.heading=Math.atan2(dx,dz);actor.agent.distanceWalked+=distance;s.blocked=0;}else{s.blocked+=dt;if(s.blocked>2&&onStair===null){s.path=[];s.wait=.4;s.blocked=0;}}
  }
  this.present(dt,dialogueOpen);if(!this.school.active)this.living.campus.update(dt,this.time,this.getProgress().living,this.living.settings.quality);
  if(active&&playerSpeed>.15){this.living.lastStepSound+=dt*playerSpeed;if(this.living.lastStepSound>1.4){this.living.lastStepSound=0;this.living.audio.play('step');}}
 }
 present(dt=0,dialogueOpen=false){const player=this.player.getWorldPosition(new THREE.Vector3());for(const actor of this.actors){const s=actor.spatial,p=s.position,local=schoolPointToLocal(p,this.school.rotation),frame=this.school.active?local:p;actor.agent.position={...frame,floor:Math.max(0,Math.min(2,Math.round((p.y-.03)/3.6)))};actor.agent.speed=s.speed;actor.agent.state=s.state||'idle';actor.agent.rotation=s.heading-(this.school.active?this.school.rotation:0);const root=actor.character.root;root.position.set(p.x,p.y,p.z);root.visible=!this.school.inspecting&&Math.hypot(player.x-p.x,player.z-p.z)<(this.living.settings.quality==='low'?25:55)&&Math.abs(player.y-p.y)<5;actor.character.update(dt,s.speed,dialogueOpen&&this.living.speakingId===actor.definition.id,false,{state:actor.reaction>0?'react':s.state||'idle',heading:s.heading});}}
 targets(){const player=this.player.getWorldPosition(new THREE.Vector3());return this.actors.filter(a=>Math.abs(player.y-a.spatial.position.y)<1.3).map(a=>({id:a.definition.id,name:a.definition.name,kind:a.definition.id==='maria'?'maria':'npc',...a.agent.position,height:a.spatial.position.y+1.5}));}
 capture(){this.getProgress().living.spatialActors=Object.fromEntries(this.actors.map(a=>[a.definition.id,{...a.spatial.position,index:a.spatial.index,timer:a.spatial.timer,rotation:a.spatial.heading}]));}
 describe(){return{searches:this.planner.searches,pathfinding:{worker:!!this.pathfinder.worker,pending:this.pathfinder.pending.size,workerMS:[...this.pathfinder.samples]},instances:this.actors.map(a=>({id:a.definition.id,uuid:a.character.root.uuid,world:{...a.spatial.position},routeIndex:a.spatial.index,state:a.spatial.state,path:a.spatial.path.length})),reservations:[...this.reservations]};}
 dispose(){this.disposed=true;this.pathfinder.dispose();this.capture();this.reservations.clear();this.school.spatial=null;this.living.spatial=null;}
}
