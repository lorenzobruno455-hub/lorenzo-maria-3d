import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {contactPatches,createSchoolComicDepth} from '../../src/systems/school-comic-depth.js';

const box=(kind,minY,maxY,x=0)=>({kind,minX:x,maxX:x+.5,minZ:0,maxZ:.5,minY,maxY});
test('contacts follow the active floor walkY, exclude suspended props/walls, and do not mutate collision',()=>{
 const floor={index:1,baseY:3.6,walkY:3.63,colliders:[box('furniture',3.6,4.3),box('living-furniture',3.63,4.1,1),box('wall',3.6,6.65),box('furniture',4.2,4.4),box('furniture-detail',3.64,4,2)]};
 const before=JSON.stringify(floor),patches=contactPatches(floor);assert.equal(patches.length,3);assert.ok(patches.every(p=>Math.abs(p.y-3.634)<1e-6));assert.equal(JSON.stringify(floor),before);
});
test('contact batches stream once per floor, inherit visibility and dispose no borrowed model buffers',()=>{
 const floor={index:0,baseY:0,walkY:.03,colliders:[box('furniture',0,.8)]},model=new THREE.Group(),geometry=new THREE.BoxGeometry();model.add(new THREE.Mesh(geometry,new THREE.MeshBasicMaterial()));let disposed=0;geometry.addEventListener('dispose',()=>disposed++);
 const school={leases:new Map([[0,{model}]]),navigation:{floor:()=>floor}},depth=createSchoolComicDepth({school});
 depth.update();depth.update();assert.equal(depth.state().contactPatches,1);assert.equal(model.children.length,2);const batch=model.children.at(-1);assert.equal(batch.castShadow,false);assert.equal(batch.material.depthWrite,false);assert.equal(batch.position.y,0);
 model.visible=false;assert.equal(batch.parent.visible,false);depth.dispose();depth.dispose();assert.equal(model.children.length,1);assert.equal(disposed,0);geometry.dispose();model.children[0].material.dispose();
});
