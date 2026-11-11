import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as THREE from 'three';
import {schoolPointToWorld,schoolPointToLocal,schoolBoundsToWorld,schoolBoundsToLocal,changeFrame} from '../../src/systems/world-coordinates.js';
import {schoolAccessLayout} from '../../src/systems/school-access-layout.js';
import {splitEntranceBox} from '../../src/systems/school-entrance.js';
import {validateProgress} from '../../src/systems/progress.js';
const layout=JSON.parse(fs.readFileSync('src/data/sao-jorge.json'));
test('rigid half-turn faces reception toward campus without mirroring or changing local rooms',()=>{
 const p={x:6.5,y:.03,z:-5.5},world=schoolPointToWorld(p,Math.PI);assert.deepEqual(world,{x:53.5,y:.03,z:5.5});assert.deepEqual(schoolPointToLocal(world,Math.PI),p);
 const b={minX:10.88,maxX:11.12,minY:0,maxY:3,minZ:-9,maxZ:-2,kind:'wall'},w=schoolBoundsToWorld(b,Math.PI);assert.equal(w.minX,48.88);assert.equal(w.maxZ,9);const round=schoolBoundsToLocal(w,Math.PI);for(const k of ['minX','maxX','minZ','maxZ'])assert.ok(Math.abs(round[k]-b[k])<1e-9);
 const access=schoolAccessLayout(Math.PI);assert.equal(access.gates.length,3);assert.deepEqual(access.gates.map(g=>[g.id,g.x,g.z]),[['court',71,-27],['school',60,-19],['reception',49,5.5]]);assert.equal(access.court.maxZ,-19);assert.equal(access.court.minZ,-35);
});
test('world pose and world camera heading survive rotated reparenting in both directions',()=>{
 const scene=new THREE.Scene(),group=new THREE.Group();group.position.x=60;group.rotation.y=Math.PI;scene.add(group);const player=new THREE.Object3D(),camera=new THREE.PerspectiveCamera();scene.add(player,camera);player.position.set(49.5,.03,5.5);camera.position.set(45,2,5.5);
 const follow={camera,yaw:-Math.PI/2,renderYaw:-Math.PI/2,focus:new THREE.Vector3(49.5,1.45,5.5),desired:camera.position.clone(),position:camera.position.clone(),probe:camera.position.clone()},p=player.position.clone(),c=camera.position.clone(),yaw=follow.yaw;
 changeFrame(player,group,follow,{x:60,z:0});assert.ok(player.getWorldPosition(new THREE.Vector3()).distanceTo(p)<1e-9);assert.ok(camera.getWorldPosition(new THREE.Vector3()).distanceTo(c)<1e-9);assert.ok(Math.abs(Math.sin(follow.yaw+Math.PI-yaw))<1e-9);
 changeFrame(player,scene,follow,{x:-60,z:0});assert.ok(player.position.distanceTo(p)<1e-9);assert.ok(camera.position.distanceTo(c)<1e-9);assert.ok(Math.abs(Math.atan2(Math.sin(follow.yaw-yaw),Math.cos(follow.yaw-yaw)))<1e-9);
});
test('new wall opening enters reception directly and keeps existing courtyard portal and lintels',()=>{
 const f=layout.floors[0],walls=f.colliders.flatMap(b=>splitEntranceBox(b,{reception:true})),at=(x,y,z)=>walls.some(b=>b.kind==='wall'&&x>b.minX&&x<b.maxX&&y>b.minY&&y<b.maxY&&z>b.minZ&&z<b.maxZ);
 assert.equal(at(11,1,-5.5),false);assert.equal(at(11,2.8,-5.5),true);assert.equal(at(11,1,-3),true);assert.equal(at(0,1,19),false);
 const reception=f.rooms.find(r=>r.type==='reception');assert.ok(10.5>reception.x1&&10.5<reception.x2&&-5.5>reception.z1&&-5.5<reception.z2);
});
test('v04 keeps old local school progress and admits only the new reception apron, plus courtyard exterior',()=>{
 const old=validateProgress({schoolVisit:{active:true,floor:2,position:{x:6.9,z:0}}});assert.deepEqual(old.schoolVisit.position,{x:6.9,z:0});
 assert.deepEqual(validateProgress({schoolVisit:{active:true,floor:0,position:{x:11.1,z:-5.5}}}).schoolVisit.position,{x:11.1,z:-5.5});
 assert.notEqual(validateProgress({schoolVisit:{active:true,floor:0,position:{x:11.1,z:0}}}).schoolVisit.position.x,11.1);
 assert.deepEqual(validateProgress({position:{x:60,z:-30}}).position,{x:60,z:-30});
});
import {Resources} from '../../src/systems/resources.js';
import {createCampusConnection} from '../../src/systems/campus-connection.js';
import {blocked} from '../../src/systems/physics.js';
test('three-gate streaming seals open only after collision arrives; court boundaries and disposal retain campus ownership',()=>{
 const scene=new THREE.Scene(),resources=new Resources(),original={minX:-30,maxX:-29,minZ:0,maxZ:1},ground=()=>.7;
 const world={resources,solids:[original],occluders:[original],doors:[],groundHeight:ground,addDoor(x,name,o){const d={name,pivot:new THREE.Group(),bounds:{enabled:false,minX:x-1,maxX:x+1,minZ:o.z-.1,maxZ:o.z+.1},openAngle:o.openAngle??Math.PI/2,angle:0};this.doors.push(d);this.solids.push(d.bounds);this.occluders.push(d.bounds);return d;}};
 const c=createCampusConnection(scene,world,layout,{rotation:Math.PI,threeGates:true});assert.equal(world.doors.length,3);assert.equal(blocked(49,5.5,world.solids),true);assert.equal(blocked(60,-19,world.solids),true);
 c.updateGates({x:49,z:5.5},false);assert.equal(c.gateDoors.get('reception').open,false);
 c.installFloor(layout.floors[0].colliders.flatMap(b=>splitEntranceBox(b,{reception:true})).map(b=>schoolBoundsToWorld(b,Math.PI)));
 assert.equal(blocked(49,5.5,world.solids),false);assert.equal(blocked(60,-19,world.solids),false);assert.equal(blocked(71,-27,world.solids),false);assert.equal(blocked(71,-23,world.solids),true);assert.equal(blocked(60,-35,world.solids),true);
 c.updateGates({x:49,z:5.5},true);assert.equal(c.gateDoors.get('reception').open,true);c.updateGates({x:71,z:-27},false);assert.equal(c.gateDoors.get('court').open,true);
 c.dispose();c.dispose();assert.deepEqual(world.solids,[original]);assert.deepEqual(world.occluders,[original]);assert.equal(world.doors.length,0);assert.equal(world.groundHeight,ground);resources.dispose();
});
import {resolveSchoolExteriorSave} from '../../src/systems/school-save-placement.js';
test('inactive old doorway save repairs nearby outside the rotated footprint, while clear path/court saves stay exact',()=>{
 const walls=layout.floors[0].colliders.flatMap(b=>splitEntranceBox(b,{reception:true})).map(b=>schoolBoundsToWorld(b,Math.PI)),old={x:60,z:19.1},p=resolveSchoolExteriorSave(old,walls,Math.PI);
 assert.ok(Math.hypot(p.x-old.x,p.z-old.z)<=2.5);assert.ok(p.z>19.44);assert.equal(blocked(p.x,p.z,walls),false);
 for(const point of[{x:47,z:5.5},{x:60,z:-27},{x:0,z:19}])assert.deepEqual(resolveSchoolExteriorSave(point,walls,Math.PI),point);
});
