import * as THREE from 'three';
import {NARRATIVE_POINTS as points,ACTOR_ROUTES,bookPoint,sameFloor,narrativeWaypoint} from './school-narrative-map.js';
import {nextStep,currentChapter,memories} from './quests.js';
import {eventObjective} from './events.js';

// Borrows the existing actors/props and quest engines; no second campaign or rig.
export class SchoolNarrative {
 constructor({school,world,story,living,adventure,getProgress}){
  Object.assign(this,{school,world,story,living,adventure,getProgress});
  this.group=new THREE.Group();this.group.name='São Jorge · história';school.group.add(this.group);this.group.visible=false;
  this.borrowed=[];this.actorSnapshots=[];this.active=false;
 }
 get floor(){return this.school.floor;}
 get base(){return this.school.navigation.floor(this.floor).baseY;}
 bookObjects(){return this.story.world.objects.filter(o=>o.kind==='memory-book');}
 point(id){return points[id]||null;}
 actorPoint(id){const actor=this.living.actors.find(a=>a.definition.id===id);return actor?{...actor.agent.position,floor:ACTOR_ROUTES[id].floor,name:actor.definition.name,height:this.school.navigation.floor(ACTOR_ROUTES[id].floor).walkY+1.5}:null;}
 remember(o){
  const values=Object.fromEntries(['x','z','floor','height','ignoreCollider','displayScale','vx','vz'].map(k=>[k,{had:Object.hasOwn(o,k),value:o[k]}]));
  const mesh=o.mesh,snapshot=mesh?{parent:mesh.parent,position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),scale:mesh.scale.clone(),visible:mesh.visible}:null;
  this.borrowed.push({object:o,values,mesh,snapshot});
 }
 moveObject(o,p,scale=.7){
  if(!p)return;this.remember(o);Object.assign(o,{x:p.x,z:p.z,floor:p.floor,height:this.school.navigation.floor(p.floor).baseY+(p.top??1)+.16,ignoreCollider:null});
  if(!o.mesh)return;const mesh=o.mesh;this.group.add(mesh);mesh.scale.multiplyScalar(scale);if(o.kind==='memory-book')o.displayScale=scale;mesh.position.set(p.x,0,p.z);mesh.updateWorldMatrix(true,true);
  const bounds=new THREE.Box3().setFromObject(mesh),center=bounds.getCenter(new THREE.Vector3());
  mesh.position.x+=p.x-center.x;mesh.position.z+=p.z-center.z;mesh.position.y+=this.school.navigation.floor(p.floor).baseY+(p.top??0)-bounds.min.y;
 }
 enter(){
  if(this.active)return;this.active=true;this.group.visible=true;this.borrowed=[];this.actorSnapshots=[];
  this.oldTracked=this.story.tracked;this.story.tracked=null;this.story.location=this;this.living.location=this;this.adventure.location=this;
  try{
   for(const o of this.story.world.objects){const p=o.kind==='memory-book'?bookPoint(this.bookObjects().indexOf(o)):points[o.id];if(p)this.moveObject(o,p,o.kind==='memory-book'?.54:.6);}
   for(const o of this.world.collectibles)this.moveObject(o,points[o.id],.6);
   for(const o of this.living.campus.objects)this.moveObject(o,points[o.id==='familiar-music'?'score':o.id],o.id==='ball'?1:.5);
   if(this.adventure.photo)this.moveObject(this.adventure.photo,points['classroom-photo'],.7);
   for(const actor of this.living.actors){
    const rig=actor.character.root,route=ACTOR_ROUTES[actor.definition.id];if(!route)continue;
    const saved={actor,agent:structuredClone({...actor.agent}),parent:rig.parent,position:rig.position.clone(),quaternion:rig.quaternion.clone(),visible:this.school.legacy?.visibility.find(([r])=>r===rig)?.[1]??rig.visible};this.actorSnapshots.push(saved);
    actor.agent.definition={...actor.definition,route:structuredClone(route.route)};
    const persisted=this.school.getState().actors?.[actor.definition.id];const position=this.school.navigation.resolve(route.floor,persisted?.floor===route.floor?persisted:route.start);
    Object.assign(actor.agent,{position:{x:position.x,z:position.z,floor:route.floor},index:persisted?.index%route.route.length||0,timer:0,path:[],rotation:persisted?.rotation||0,replan:0,forcedKey:'',state:'idle',speed:0});this.group.add(rig);rig.visible=true;
   }
   this.makeInstrument();this.updateObjects();this.updateActors(0,{});
  }catch(error){this.leave();throw error;}
 }
 makeInstrument(){
  if(this.instrument)return;const p=points.instrument,group=new THREE.Group(),r=this.world.resources;
  const part=(color,size,x,y,z)=>{const mesh=r.mesh('box',color,size);mesh.position.set(x,y,z);group.add(mesh);};
  part('#25344b',[.7,.07,.34],0,.035,0);for(let i=0;i<10;i++){part(i%3?'#eee9dd':'#141824',[.058,.025,.2],-.3+i*.065,.082,.02);}
  group.position.set(p.x,this.school.navigation.floor(p.floor).baseY+p.top,p.z);this.group.add(group);this.instrument={...p,mesh:group};
 }
 capture(){if(!this.active)return;this.school.getState().actors=Object.fromEntries(this.living.actors.filter(a=>ACTOR_ROUTES[a.definition.id]).map(a=>[a.definition.id,{...a.agent.position,index:a.agent.index,rotation:a.agent.rotation}]));}
 leave(){
  if(!this.active)return;this.capture();this.active=false;this.story.focus=null;this.story.seat=null;this.story.tracked=this.oldTracked;this.story.location=null;this.living.location=null;this.adventure.location=null;this.living.speakingId=null;
  for(const s of this.actorSnapshots){Object.assign(s.actor.agent,s.agent);const root=s.actor.character.root;s.parent?.add(root);root.position.copy(s.position);root.quaternion.copy(s.quaternion);root.visible=s.visible;}
  for(const {object,values,mesh,snapshot} of this.borrowed){for(const[k,s]of Object.entries(values)){if(s.had)object[k]=s.value;else delete object[k];}if(mesh){snapshot.parent?.add(mesh);mesh.position.copy(snapshot.position);mesh.quaternion.copy(snapshot.quaternion);mesh.scale.copy(snapshot.scale);mesh.visible=snapshot.visible;}}
  this.instrument?.mesh.removeFromParent();this.instrument=null;this.group.visible=false;this.borrowed=[];this.actorSnapshots=[];
 }
 updateObjects(){
  if(!this.active)return;const p=this.getProgress(),c=p.campaign;
  for(const {object:o} of this.borrowed){if(!o.mesh)continue;let visible=sameFloor(o,this.floor)&&!this.school.inspecting;
   if(this.world.collectibles.includes(o)){o.taken=p.collected.includes(o.id);visible&&=p.stage===1&&!o.taken;}
   if(o.kind==='memory')visible&&=p.stage===2&&memories.findIndex(m=>m.id===o.id)<=c.memories.length;
   if(this.living.campus.objects.includes(o)&&['lost-book','familiar-music'].includes(o.id)){
    const quest=o.id==='lost-book'?'lost-book':'familiar-music',node=o.id==='lost-book'?5:3;
    visible&&=this.adventure.current?.id===quest?this.adventure.current.node<node:p.living.events[o.id]==='active';
   }
   o.mesh.visible=visible;
  }
  if(this.instrument)this.instrument.mesh.visible=this.floor===2&&!this.school.inspecting;
 }
 updateActors(dt,{dialogueOpen=false,speaker='',active=false,playerSpeed=0}={}){
  if(!this.active)return;const p=this.getProgress(),player=this.school.player||this.living.player;
  for(const {actor} of this.actorSnapshots){const id=actor.definition.id,floor=ACTOR_ROUTES[id].floor,shown=floor===this.floor&&!this.school.inspecting,agent=actor.agent,root=actor.character.root;
   root.visible=shown;if(!shown)continue;
   const required=id==='maria'&&(p.stage<2||nextStep(p.campaign)?.type==='talk');
   const hold=required||this.adventure.current?.step?.target===id||!!Object.entries(p.living.events).find(([key,state])=>state!=='done'&&({ 'lost-book':'bia','familiar-music':'davi','physics-question':'helena'}[key]===id));
   if(dt>0)agent.update(dt,{obstacles:this.school.navigation.movementObstacles(floor),player,others:this.living.actors.filter(a=>ACTOR_ROUTES[a.definition.id]?.floor===floor).map(a=>a.agent),speaking:dialogueOpen&&this.living.speakingId===id,hold});
   if(!this.adventure.cutscenes?.active){root.position.set(agent.position.x,this.school.navigation.floor(floor).walkY,agent.position.z);root.rotation.y=agent.rotation;}
   if(!this.adventure.cutscenes?.active){let pose=dialogueOpen&&this.living.speakingId===id?(speaker===actor.definition.name.toUpperCase()?'talk':'observe'):agent.state;if(actor.reaction>0){actor.reaction-=dt;pose='react';}actor.character.update(dt,agent.speed,pose==='talk',false,{state:pose});}
  }
  if(active&&playerSpeed>.15){this.living.lastStepSound+=dt*playerSpeed;if(this.living.lastStepSound>1.4){this.living.lastStepSound=0;this.living.audio.play('step');}}
 }
 targets(){
  if(!this.active||this.school.inspecting)return[];
  return [...this.living.targets(),...this.world.collectibles.filter(o=>this.getProgress().stage===1&&!o.taken).map(o=>({...o,kind:'item',original:o})),...this.story.world.objects,...this.adventure.targets()].filter(o=>sameFloor(o,this.floor)&&(!o.mesh||o.mesh.visible));
 }
 adventureTarget(step){
  if(!step)return null;const id=step.target;if(ACTOR_ROUTES[id])return{id,...this.actorPoint(id),kind:'adventure'};
  const p=points[id];if(!p)return null;
  const object=id==='study-notebook'?this.adventure.notebook():id==='classroom-photo'?this.adventure.photo:id==='lost-book'||id==='score'?this.living.campus.objects.find(o=>o.id===(id==='score'?'familiar-music':id)):id==='instrument'||id==='music-rhythm'?this.instrument:null;
  return{...object,...p,id,kind:'adventure',height:this.school.navigation.floor(p.floor).baseY+(p.top??.03)+.18};
 }
 memoryOrigin(id){const p=points[id];if(p&&p.floor!==this.floor)return {...this.school.player.position,height:this.school.navigation.floor(this.floor).walkY+.6};return p?{...p,height:this.school.navigation.floor(p.floor).baseY+(p.top??.03)}:null;}
 gamePosition(id){return points[id];}
 scenePoint(id){return id?.startsWith('first')?points.classroom:this.actorPoint(id==='book-finale'?'bia':'davi');}
 eventGoal(){const event=eventObjective(this.getProgress().living);return !event?null:event.returnToNPC||event.id==='physics-question'?{...this.actorPoint(event.npc),name:event.label}:{...points[event.id==='familiar-music'?'score':event.id],name:event.label};}
 kick(){const ball=this.living.campus.objects.find(o=>o.id==='ball');if(!ball)return;ball.vx=2;ball.vz=-3;this.living.audio.play('ball');}
 updateBall(dt){const ball=this.living.campus.objects.find(o=>o.id==='ball');if(!ball)return;ball.x=THREE.MathUtils.clamp(ball.x+(ball.vx||0)*dt,-7,7);ball.z=THREE.MathUtils.clamp(ball.z+(ball.vz||0)*dt,9,15);ball.vx=(ball.vx||0)*Math.exp(-dt*1.6);ball.vz=(ball.vz||0)*Math.exp(-dt*1.6);ball.mesh.position.set(ball.x,this.school.navigation.floor(2).walkY+.24,ball.z);}

 visitPoint(){const chapter=currentChapter(this.getProgress().campaign);return chapter?points[`memory-${memories.findIndex(m=>m.quest===chapter.id)+1}`]:null;}
 storyGoal(){
  if(this.story.tracked)return this.story.tracked;
  const event=this.eventGoal();if(event)return event;
  if(this.living.free)return null;const step=nextStep(this.getProgress().campaign);return step?{...(step.type==='talk'?this.actorPoint('maria'):this.visitPoint()),name:step.type==='talk'?'Converse com Maria · sala de história':step.type==='visit'?this.visitPoint().name:step.label}:null;
 }
 goal(){
  if(!this.active)return null;
  let target=this.adventure.goal();const p=this.getProgress();
  if(!target)target=p.stage<2?(p.stage!==1||p.collected.length===3?this.actorPoint('maria'):this.world.collectibles.filter(o=>!o.taken).sort((a,b)=>Math.abs(a.floor-this.floor)-Math.abs(b.floor-this.floor))[0]):this.storyGoal();
  return narrativeWaypoint(this.school.navigation,this.floor,target);
 }
 sit(){const p=points['reflection-seat'];this.story.seat={height:this.school.navigation.floor(p.floor).baseY+p.top,exit:{x:this.school.player.position.x,z:this.school.player.position.z}};this.school.player.position.set(p.x,this.story.seat.height,p.z);this.school.player.rotation.y=0;}
 scene(id){
  const first=id.startsWith('first'),p=first?{floor:0,x:-5.1,z:16}:this.actorPoint(id==='book-finale'?'bia':'davi'),y=this.school.navigation.floor(p.floor).walkY;
  // Mandatory scenes begin only on the correct floor; staging stays in a clear aisle.
  if(p.floor!==this.floor)return null;const actor=first?'maria':id==='book-finale'?'bia':'davi',side=id==='book-finale'?-1:1;
  const shots=[{duration:1.3,camera:{lookFrom:[p.x-.15,y+1.1,p.z+.3],from:[p.x+side*2.2,y+1.8,p.z+1.6],to:[p.x+side*1.9,y+1.75,p.z+1.6],lookAt:[p.x-.15,y+1.1,p.z+.3]},actors:[{id:'lorenzo',state:'observe',position:[p.x-.1,y,p.z+.75]},{id:actor,state:'talk'}]},{duration:1.4,camera:{lookFrom:[p.x-.15,y+1.1,p.z+.3],to:[p.x+side*1.5,y+1.7,p.z+1.6],lookAt:[p.x-.15,y+1.1,p.z+.3]},actors:[{id:actor,state:'wave'},{id:'lorenzo',state:first?'point':'react'}],effect:'AURORA'}];
  if(id==='first-finale')shots.push({duration:.5,dialogue:{speaker:'MEMÓRIA ORIGINAL',text:'19/08/2024 · Aula de história. Eu estava extremamente envergonhado, mas pedi para ficar com você.',provenance:'author-reported-memory'}});
  return{id,shots};
 }
 describe(){return {objects:this.borrowed.length,actors:this.actorSnapshots.length,books:this.bookObjects().map(o=>({id:o.id,floor:o.floor,visible:o.mesh.visible,unlocked:o.unlocked,bounds:new THREE.Box3().setFromObject(o.mesh)}))};}
 dispose(){this.leave();this.group.removeFromParent();}
}
