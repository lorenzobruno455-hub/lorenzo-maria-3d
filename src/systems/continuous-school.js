import {alignStairRooms,refitStairRooms} from './school-stair-layout.js';
import {createPhysicalStairs,cutStairOpening,moveOnSurfaces,splitOpening,walkY,floorAt,stairAt} from './physical-stairs.js';
import * as THREE from'three';
import {SchoolVisit}from'./school-visit.js';
import {createCampusConnection}from'./campus-connection.js';
import {openSchoolEntrance,splitEntranceBox}from'./school-entrance.js';
import {SCHOOL_ORIGIN,ENTRANCE,changeFrame,schoolPointToWorld,schoolPointToLocal,schoolBoundsToWorld,schoolBoundsToLocal}from'./world-coordinates.js';
import {moveWithCollisions,resolveSpawn}from'./physics.js';

// Same scene, actors, controls and internal coordinates. Reparenting changes the
// coordinate frame, never the world pose; worldPosition diagnostics prove it.
export class ContinuousSchool extends SchoolVisit{
 constructor(options){
  super(options);alignStairRooms(this.layout);this.layout.physicalStairs=true;this.layout.floors.forEach(f=>f.physicalStairs=true);this.physicalStairs=createPhysicalStairs(options.world.resources);this.group.add(this.physicalStairs.group);this.stairOpenings=new Map();this.roomRefits=new Map();this.world=options.world;this.frameNodes=options.frameNodes||[];this.origin=SCHOOL_ORIGIN;this.rotation=options.rotation||0;this.threeGates=!!options.threeGates;this.group.position.set(this.origin.x,0,this.origin.z);this.group.rotation.y=this.rotation;this.portals=new Map();
  const f=this.layout.floors[0];f.receptionEntrance=this.threeGates;f.colliders=f.colliders.flatMap(b=>splitEntranceBox(b,{reception:this.threeGates}));
  this.connection=createCampusConnection(this.scene,this.world,options.layout,{rotation:this.rotation,threeGates:this.threeGates});this.localDoor={};this.detailNear=false;this.prefetching=false;this.retryAt=0;this.occluded=false;this.hiddenRoots=new Map();
  const ground=this.world.groundHeight;this.world.groundHeight=(x,z)=>Math.abs(x-this.origin.x)<11.2&&z>-19.2&&z<19.5?.03:ground(x,z);
 }
 prepareDetails(floor,lease){
  if(floor.index===0){try{this.portals.set(0,openSchoolEntrance(lease.model,{reception:this.threeGates}));}catch(e){lease.release();throw e;}}
  this.roomRefits.set(floor.index,refitStairRooms(lease.model,floor));
  this.stairOpenings.set(floor.index,cutStairOpening(lease.model,floor.index));
  super.prepareDetails(floor,lease);
  if(floor.index===0)this.connection.installFloor(floor.colliders.map(c=>schoolBoundsToWorld(c,this.rotation)));
 }
 portalDistance(p=this.player.position){return Math.min(Math.hypot(p.x,p.z-19),this.threeGates?Math.hypot(p.x-11,p.z+5.5):Infinity);}
 outsidePortal(p=this.player.position){return p.z>19.2||(this.threeGates&&p.x>11.2&&p.z>=-6.8&&p.z<=-4.2);}
 cameraCeiling(){return stairAt(this.player.position)===null?this.navigation.floor(this.floor).baseY+3.05:undefined;}
 cameraDistance(){return this.floor===0?THREE.MathUtils.lerp(this.follow.distance,5.4,THREE.MathUtils.clamp(this.portalDistance()/5,0,1)):5.4;}
 cameraObstacles(){
  const slabs=this.layout.floors.flatMap(f=>{const b={kind:'floor',minX:-11.275,maxX:11.275,minZ:-19.275,maxZ:19.275,minY:f.baseY-.42,maxY:f.baseY+.07};return f.index?splitOpening(b):[b];});
  // Ceiling fixtures are visual geometry above walking height, but still occlude the camera.
  const fixtures=[...this.details].flatMap(([i,d])=>(d.architecture?.stats.parts||[]).filter(p=>p.name==='fixture-housing'||p.name==='fixture-diffuser').map(p=>({...p,minY:p.minY+this.layout.floors[i].baseY,maxY:p.maxY+this.layout.floors[i].baseY})));
  return [...this.layout.floors.flatMap(f=>f.colliders),...fixtures,...slabs,...this.physicalStairs.colliders,...(this.connection.schoolDoors||[this.connection.door]).map(d=>schoolBoundsToLocal(d.bounds,this.rotation))];
 }
 bodyObstacles(p){
  const doors=(this.connection.schoolDoors||[this.connection.door]).map(d=>schoolBoundsToLocal(d.bounds,this.rotation));
  return [...this.layout.floors.flatMap(f=>f.colliders),...this.physicalStairs.colliders,...doors].filter(b=>b.enabled!==false&&(b.minY??0)<p.y+1.72&&(b.maxY??3)>p.y+.1);
 }
 moveBodyWorld(position,delta){
  const local=schoolPointToLocal(position,this.rotation),end=schoolPointToLocal({x:position.x+delta.x,z:position.z+delta.z},this.rotation);
  if(Math.abs(local.x)>12||Math.abs(local.z)>20){const d=moveWithCollisions(position,delta,this.world.solids.filter(b=>(b.minY??0)<(position.y||0)+1.72&&(b.maxY??3)>(position.y||0)+.1));position.y=this.world.groundHeight(position.x,position.z);return d;}
  local.y=Number.isFinite(position.y)?position.y:.03;
  const distance=moveOnSurfaces(local,{x:end.x-local.x,z:end.z-local.z},{inside:p=>Math.abs(p.x)<11.28&&Math.abs(p.z)<19.28,move:moveWithCollisions,obstacles:p=>this.bodyObstacles(p),ready:(f,y)=>this.leases.has(f)||y<walkY(f)-1.7});
  const world=schoolPointToWorld(local,this.rotation);Object.assign(position,{x:world.x,y:local.y,z:world.z});return distance;
 }
 waypoint(target){if(!target)return target;
  if(this.active){if(Number.isInteger(target.floor)&&target.floor!==this.floor){const d=target.floor>this.floor?this.floor+1:this.floor-1,s=this.navigation.targets(this.floor).find(s=>s.destination===d);return s?{...s,name:`${s.label} · ${target.name}`}:target;}if(this.floor===0&&(Math.abs(target.x)>11.28||Math.abs(target.z)>19.3))return{x:10.1,z:-5.5,floor:0,name:`Saia pela recepção · ${target.name}`};}
  else{const p=schoolPointToLocal(target,this.rotation);if(Math.abs(p.x)<11.28&&Math.abs(p.z)<19.3)return{...schoolPointToWorld({x:12,z:-5.5},this.rotation),name:`Entre pela recepção · ${target.name}`};}return target;
 }
 walkHeight(){return this.player.position.y;}
 targets(){return[];}
 async useStair(){return false;}
 async enter(){
  // Used only to restore an existing school save at application startup.
  if(this.active||this.loading||this.disposed)return false;const s=this.getState(),token=++this.token;this.loading=true;this.onChange();
  try{const floor=this.navigation.floor(s.floor);await this.ensureFloor(floor.index);if(this.disposed||token!==this.token)return false;
   // Resolve after the current furniture/architecture colliders have arrived.
   const apron=s.floor===0&&((Math.abs(s.position.x)<1&&s.position.z>18.8&&s.position.z<=19.2)||(this.threeGates&&s.position.x>10.8&&s.position.x<=11.4&&s.position.z>=-6.8&&s.position.z<=-4.2));
   const p=apron?{...s.position,floor:0,y:.03}:this.navigation.resolve(floor.index,s.position),world=schoolPointToWorld(p,this.rotation);
   this.player.position.set(world.x,p.y,world.z);
   if(p.floor===0&&this.portalDistance(p)<2){const d=this.threeGates&&p.x>9?this.connection.gateDoors.get('reception'):this.connection.door;d.open=true;d.angle=d.openAngle??Math.PI/2;d.pivot.rotation.y=d.angle;this.world.update(0,0,this.player.position);}
   if(p.floor===0){const safe=resolveSpawn(this.player.position,this.world.solids,schoolPointToWorld(floor.spawn,this.rotation));this.player.position.x=safe.x;this.player.position.z=safe.z;}
   this.follow.yaw=s.yaw+this.rotation;this.follow.pitch=s.pitch;
   this.activate();this.floor=p.floor;this.view=p.floor;this.follow.obstacles=this.cameraObstacles();this.follow.initialized=false;this.showFloors();this.narrative?.updateActors(0,{});this.capture();return true;
  }catch{this.getState().active=false;this.onStatus('São Jorge indisponível. Você pode continuar no campus.');return false;}
  finally{if(token===this.token){this.loading=false;this.onChange();}}
 }
 activate(){
  if(this.active)return;this.legacy={visibility:this.legacyRoots.map(r=>[r,r.visible])};this.active=true;this.floor=0;this.view=0;this.inspecting=false;this.group.visible=true;
  changeFrame(this.player,this.group,this.follow,this.origin);for(const n of this.frameNodes)this.group.attach(n);
  this.narrative?.enter();this.onFrameChange?.();this.follow.obstacles=this.cameraObstacles();this.showFloors();this.capture();this.onChange({preserveInput:true});
 }
 exit({recover=false}={}){
  // Normal travel still requires the physical door. Recovery is an explicit
  // settings action, and also cancels an unfinished saved-position restore.
  if(!recover&&(!this.active||this.floor!==0||!this.outsidePortal()||this.inspecting))return false;
  if(recover){++this.token;this.loading=false;}
  if(this.active){this.capture();this.narrative?.leave();changeFrame(this.player,this.scene,this.follow,{x:-this.origin.x,z:-this.origin.z});for(const n of this.frameNodes)this.scene.attach(n);}
  this.active=false;this.inspecting=false;this.spatial?.present();this.onFrameChange?.();this.getState().active=false;this.follow.obstacles=this.world.occluders;this.follow.focusObject=null;this.follow.interiorDistance=null;this.restoreCampus();this.showFloors();this.onChange({preserveInput:true,deferSave:recover});return true;
 }
 move(delta){
  if(this.inspecting)return 0;const p=schoolPointToWorld(this.player.position,this.rotation);p.y=this.player.position.y;
  const direction=new THREE.Vector3(delta.x,0,delta.z).applyAxisAngle(new THREE.Vector3(0,1,0),this.rotation),distance=this.moveBodyWorld(p,direction),local=schoolPointToLocal(p,this.rotation);
  this.player.position.set(local.x,p.y,local.z);const floor=floorAt(p.y);if(floor!==this.floor){this.floor=floor;this.view=floor;this.onChange({preserveInput:true});}return distance;
 }
 tick(dt,time){
  const p=this.player.getWorldPosition(new THREE.Vector3()),local=schoolPointToLocal(p,this.rotation),entrances=this.threeGates?this.connection.access.gates.filter(g=>g.id!=='court'):[ENTRANCE],near=Math.min(...entrances.map(g=>Math.hypot(p.x-g.x,p.z-g.z)));this.detailNear=near<15;this.entranceDistance=near;
  const actorNear=(this.spatial?.positions||[]).some(a=>entrances.some(g=>Math.hypot(a.x-g.x,a.z-g.z)<18));
  this.spatial?.openDoors();
  if(!this.loading&&(near<18||actorNear)&&!this.leases.has(0)&&!this.prefetching&&time>=this.retryAt){this.prefetching=true;void this.ensureFloor(0).catch(()=>{this.retryAt=time+5;this.onStatus('Não foi possível carregar São Jorge. Aproxime-se novamente para tentar.');}).finally(()=>{this.prefetching=false;this.showFloors();});}
  if(this.threeGates)this.connection.updateGates([p,...(this.spatial?.positions||[])],this.leases.has(0));else this.connection.door.open=near<5&&this.leases.has(0);
  if(!this.active&&this.leases.has(0)&&Math.abs(local.x)<10.7&&local.z<18.88&&local.z>-18.8)this.activate();
  if(this.active&&this.floor===0&&this.outsidePortal())this.exit();
  if(this.active&&local.x< -1.2&&local.z>-.8&&local.z<5.8){const flight=stairAt(this.player.position),floors=flight===null?[this.floor,Math.min(2,this.floor+1)]:[flight,flight+1];for(const i of floors)if(!this.leases.has(i)&&!this.pending.has(i))void this.ensureFloor(i).catch(()=>this.onStatus('Piso ainda indisponível; aguarde no patamar.'));}
  this.world.quality=this.quality;this.world.update(dt,time,p);
  if(this.active&&!this.inspecting)this.follow.obstacles=this.cameraObstacles();this.showFloors();
 }
 showFloors(){
  if(!this.connection)return super.showFloors();super.showFloors();
  this.group.visible=this.active||this.detailNear;
  if(!this.active)for(const[i,l]of this.leases)l.model.visible=i===0&&this.detailNear;
  if(this.active&&!this.inspecting){const flight=stairAt(this.player.position);for(const[i,l]of this.leases)l.model.visible=flight===null?i===this.floor:i===flight||i===flight+1;}
  this.connection.update(this.active,[...this.leases].filter(([,l])=>l.model.visible).map(([i])=>i),this.inspecting,this.active||this.detailNear,this.entranceDistance??Infinity);
 }
 presentWorld(){
  // Interior walls occlude the distant campus. Restore before the doorway can
  // reveal it; keep the connecting path and exterior proxies in the same scene.
  const hidden=this.active&&!this.inspecting&&(this.floor>0||this.portalDistance()>4);
  if(hidden){for(const r of this.legacyRoots)if(r.parent===this.scene){if(!this.hiddenRoots.has(r))this.hiddenRoots.set(r,r.visible);r.visible=false;}}
  else this.restoreCampus();
  this.connection.cull(this.follow.camera);
 }
 restoreCampus(){for(const[r,visible]of this.hiddenRoots)r.visible=visible;this.hiddenRoots.clear();}
 explore(){super.explore();if(this.active)this.follow.obstacles=this.cameraObstacles();}
 state(){return{...super.state(),continuous:true,physicalStairs:true,onStair:stairAt(this.player.position),origin:{...this.origin},rotation:this.rotation,prefetching:this.prefetching,entrance:{...(this.threeGates?this.connection.access.gates.find(g=>g.id==='reception'):ENTRANCE)},gates:this.connection.gatesState?.()||null,doorOpen:this.connection.door.open,doorAngle:this.connection.door.angle};}
 dispose(){
  if(this.disposed)return;if(this.active){this.narrative?.leave();changeFrame(this.player,this.scene,this.follow,{x:-this.origin.x,z:-this.origin.z});for(const n of this.frameNodes)this.scene.attach(n);this.active=false;}
  this.restoreCampus();for(const d of this.details.values())d.surfaces.dispose();for(const h of this.stairOpenings.values())h.dispose();for(const h of this.roomRefits.values())h.dispose();this.physicalStairs.dispose();for(const p of this.portals.values())p.dispose();this.portals.clear();this.connection.dispose();super.dispose();
 }
}
