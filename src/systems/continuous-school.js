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
  super(options);this.world=options.world;this.frameNodes=options.frameNodes||[];this.origin=SCHOOL_ORIGIN;this.rotation=options.rotation||0;this.threeGates=!!options.threeGates;this.group.position.set(this.origin.x,0,this.origin.z);this.group.rotation.y=this.rotation;this.portals=new Map();
  const f=this.layout.floors[0];f.receptionEntrance=this.threeGates;f.colliders=f.colliders.flatMap(b=>splitEntranceBox(b,{reception:this.threeGates}));
  this.connection=createCampusConnection(this.scene,this.world,options.layout,{rotation:this.rotation,threeGates:this.threeGates});this.localDoor={};this.detailNear=false;this.prefetching=false;this.retryAt=0;this.occluded=false;this.hiddenRoots=new Map();
  const ground=this.world.groundHeight;this.world.groundHeight=(x,z)=>Math.abs(x-this.origin.x)<11.2&&z>-19.2&&z<19.5?.03:ground(x,z);
 }
 prepareDetails(floor,lease){
  if(floor.index===0){try{this.portals.set(0,openSchoolEntrance(lease.model,{reception:this.threeGates}));}catch(e){lease.release();throw e;}}
  super.prepareDetails(floor,lease);
  if(floor.index===0)this.connection.installFloor(floor.colliders.map(c=>schoolBoundsToWorld(c,this.rotation)));
 }
 portalDistance(p=this.player.position){return Math.min(Math.hypot(p.x,p.z-19),this.threeGates?Math.hypot(p.x-11,p.z+5.5):Infinity);}
 outsidePortal(p=this.player.position){return p.z>19.2||(this.threeGates&&p.x>11.2&&p.z>=-6.8&&p.z<=-4.2);}
 cameraDistance(){return this.floor===0?THREE.MathUtils.lerp(this.follow.distance,4.2,THREE.MathUtils.clamp(this.portalDistance()/5,0,1)):4.2;}
 cameraObstacles(){
  if(this.floor!==0)return this.navigation.obstacles(this.floor);
  const doors=(this.connection.schoolDoors||[this.connection.door]).map(d=>schoolBoundsToLocal(d.bounds,this.rotation));
  const outside=this.threeGates&&this.portalDistance()<5?(this.connection.exteriorOccluders||[]).map(b=>schoolBoundsToLocal(b,this.rotation)):[];
  return [...this.navigation.floor(0).colliders,...doors,...outside,...this.navigation.obstacles(0).filter(c=>c.kind==='floor'||c.kind==='ceiling')];
 }
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
  this.narrative?.enter();this.follow.obstacles=this.cameraObstacles();this.showFloors();this.capture();this.onChange({preserveInput:true});
 }
 exit({recover=false}={}){
  // Normal travel still requires the physical door. Recovery is an explicit
  // settings action, and also cancels an unfinished saved-position restore.
  if(!recover&&(!this.active||this.floor!==0||!this.outsidePortal()||this.inspecting))return false;
  if(recover){++this.token;this.loading=false;}
  if(this.active){this.capture();this.narrative?.leave();changeFrame(this.player,this.scene,this.follow,{x:-this.origin.x,z:-this.origin.z});for(const n of this.frameNodes)this.scene.attach(n);}
  this.active=false;this.inspecting=false;this.getState().active=false;this.follow.obstacles=this.world.occluders;this.follow.focusObject=null;this.follow.interiorDistance=null;this.restoreCampus();this.showFloors();this.onChange({preserveInput:true,deferSave:recover});return true;
 }
 move(delta){
  if(this.inspecting)return 0;if(this.floor!==0)return super.move(delta);
  const world=schoolPointToWorld(this.player.position,this.rotation),p=new THREE.Vector3(world.x,this.player.position.y,world.z),direction=new THREE.Vector3(delta.x,0,delta.z).applyAxisAngle(new THREE.Vector3(0,1,0),this.rotation);
  const distance=moveWithCollisions(p,direction,this.world.solids),local=schoolPointToLocal(p,this.rotation);this.player.position.x=local.x;this.player.position.z=local.z;return distance;
 }
 tick(dt,time){
  const p=this.player.getWorldPosition(new THREE.Vector3()),local=schoolPointToLocal(p,this.rotation),entrances=this.threeGates?this.connection.access.gates.filter(g=>g.id!=='court'):[ENTRANCE],near=Math.min(...entrances.map(g=>Math.hypot(p.x-g.x,p.z-g.z)));this.detailNear=near<15;this.entranceDistance=near;
  if(!this.active&&!this.loading&&near<18&&!this.leases.has(0)&&!this.prefetching&&time>=this.retryAt){this.prefetching=true;void this.ensureFloor(0).catch(()=>{this.retryAt=time+5;this.onStatus('Não foi possível carregar São Jorge. Aproxime-se novamente para tentar.');}).finally(()=>{this.prefetching=false;this.showFloors();});}
  if(this.threeGates)this.connection.updateGates(p,this.leases.has(0));else this.connection.door.open=near<5&&this.leases.has(0);
  if(!this.active&&this.leases.has(0)&&Math.abs(local.x)<10.7&&local.z<18.88&&local.z>-18.8)this.activate();
  if(this.active&&this.floor===0&&this.outsidePortal())this.exit();
  this.world.quality=this.quality;this.world.update(dt,time,p);
  if(this.active&&!this.inspecting)this.follow.obstacles=this.cameraObstacles();this.showFloors();
 }
 showFloors(){
  if(!this.connection)return super.showFloors();super.showFloors();
  this.group.visible=this.active||this.detailNear;
  if(!this.active)for(const[i,l]of this.leases)l.model.visible=i===0&&this.detailNear;
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
 state(){return{...super.state(),continuous:true,origin:{...this.origin},rotation:this.rotation,prefetching:this.prefetching,entrance:{...(this.threeGates?this.connection.access.gates.find(g=>g.id==='reception'):ENTRANCE)},gates:this.connection.gatesState?.()||null,doorOpen:this.connection.door.open,doorAngle:this.connection.door.angle};}
 dispose(){
  if(this.disposed)return;if(this.active){this.narrative?.leave();changeFrame(this.player,this.scene,this.follow,{x:-this.origin.x,z:-this.origin.z});for(const n of this.frameNodes)this.scene.attach(n);this.active=false;}
  this.restoreCampus();for(const d of this.details.values())d.surfaces.dispose();for(const p of this.portals.values())p.dispose();this.portals.clear();this.connection.dispose();super.dispose();
 }
}
