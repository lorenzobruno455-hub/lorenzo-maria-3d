import * as THREE from 'three';
import {batchMeshes} from './batching.js';
import {schoolAccessLayout} from './school-access-layout.js';
import {schoolBoundsToWorld} from './world-coordinates.js';

// Extends the existing connection; originals and their cached resources remain owned there.
export function extendThreeGateConnection(base,world,rotation){
 const access=schoolAccessLayout(rotation),r=world.resources,group=new THREE.Group(),owned=[],solids=[],occluders=[];
 group.name='São Jorge three-gate paths';base.group.add(group);
 const part=(color,x,y,z,w,h,d,kind='tile')=>{const m=r.mesh('box',color,[w,h,d],kind);m.position.set(x,y,z);group.add(m);};
 part('#9cae7d',62,-.22,-37,42,.4,4,'plaster');
 const paths=[[44,12.75,3,14.5],[46.5,5.5,5,3],[44,-15.25,3,41.5],[59,-36,30,3],[74,-31.5,3,9],[72.5,-27,5,3]];
 for(const[x,z,w,d]of paths)part('#69717D',x,.01,z,w,.04,d);
 // Same ground/path materials share the base connection's static batches.
 batchMeshes(base.staticRoute,[...base.staticRoute.children.filter(o=>o.isMesh),...group.children],owned);
 // Preserve the old campus' northern limit while allowing the new school district northward.
 solids.push({minX:-38,maxX:38,minZ:-38,maxZ:-27,minY:0,maxY:3,kind:'legacy-campus-limit'});
 const localWall=(minX,maxX,minZ,maxZ,minY=0,maxY=3.3)=>schoolBoundsToWorld({minX,maxX,minZ,maxZ,minY,maxY,kind:'court-wall'},rotation);
 const courtWalls=[localWall(-11.12,-10.88,19,25.5),localWall(-11.12,-10.88,28.5,35),localWall(-11.12,-10.88,25.5,28.5,2.6),localWall(10.88,11.12,19,35),localWall(-11,11,34.88,35.12)];
 solids.push(...courtWalls.filter(b=>b.minY<1.8));occluders.push(...courtWalls,localWall(-11.25,11.25,19,35,4.1,6));
 const receptionSeal=schoolBoundsToWorld({minX:10.85,maxX:11.15,minZ:-6.8,maxZ:-4.2,minY:0,maxY:2.6,kind:'streaming-gate'},rotation);solids.push(receptionSeal);occluders.push(receptionSeal);
 const doors=new Map([['school',base.door]]);
 for(const g of access.gates.filter(g=>g.id!=='school')){
  const door=world.addDoor(g.x,g.name,{z:g.z,width:g.width,height:g.height,rotation:g.basis,openAngle:g.openAngle,gate:true,transient:true});base.group.add(door.root||door.pivot);doors.set(g.id,door);
 }
 world.solids.push(...solids);world.occluders.push(...occluders);
 const oldGround=world.groundHeight;world.groundHeight=(x,z)=>x>=48.8&&x<=71.2&&z>=-35.2&&z<=-18.8?.03:paths.some(([cx,cz,w,d])=>Math.abs(x-cx)<=w/2&&Math.abs(z-cz)<=d/2)?.03:oldGround(x,z);
 const install=base.installFloor.bind(base);base.installFloor=boxes=>{install(boxes);receptionSeal.enabled=false;};
 base.access=access;base.gateDoors=doors;base.schoolDoors=[base.door,doors.get('reception')];base.exteriorOccluders=occluders;
 base.updateGates=(position,ready)=>{for(const g of access.gates){
  const d=doors.get(g.id),near=Math.hypot(position.x-g.x,position.z-g.z)<5&&(g.id==='court'||ready);
  // Pick the free side only from rest; never reverse a leaf while it is moving.
  // This also lets a near-door save reopen without sweeping into its owner.
  if(near&&!d.open&&Math.abs(d.angle)<.03){const side=(position.x-g.x)*Math.sin(g.basis)+(position.z-g.z)*Math.cos(g.basis);d.openAngle=(side>=0?1:-1)*Math.abs(g.openAngle);}
  d.open=near;
 }};
 base.gatesState=()=>access.gates.map(g=>({id:g.id,name:g.name,x:g.x,z:g.z,local:{...g.local},angle:doors.get(g.id).angle,open:doors.get(g.id).open}));
 const dispose=base.dispose.bind(base);let disposed=false;base.dispose=()=>{
  if(disposed)return;disposed=true;world.groundHeight=oldGround;
  for(const list of[world.solids,world.occluders])for(const b of[...solids,...occluders,...[...doors].filter(([id])=>id!=='school').map(([,d])=>d.bounds)]){const i=list.indexOf(b);if(i>=0)list.splice(i,1);}
  for(const[id,d]of doors)if(id!=='school'){const i=world.doors.indexOf(d);if(i>=0)world.doors.splice(i,1);}
  owned.forEach(g=>g.dispose());group.removeFromParent();dispose();
 };
 return base;
}
