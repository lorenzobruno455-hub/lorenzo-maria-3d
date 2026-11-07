import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {placeOn,surface,colliderFor,groundHeight} from '../../src/systems/prop-placement.js';
import {validatePlacement} from '../../src/systems/environment-validator.js';
import {InteractionRegistry} from '../../src/systems/interaction-registry.js';
test('placement grounds arbitrary GLB origins, rotated scaled objects and raycast surfaces',()=>{
 const model=new THREE.Group(),m=new THREE.Mesh(new THREE.BoxGeometry(2,3,1));m.position.set(2,5,-1);model.add(m);
 const table=new THREE.Mesh(new THREE.BoxGeometry(8,.2,8));table.position.y=1.1;
 placeOn(model,surface('table',0,0,8,8,1.2,table),{x:1,z:1,yaw:.7,scale:.5});
 assert(validatePlacement(model).ok);assert(Math.abs(colliderFor(model).minY-1.2)<1e-6);
 model.position.y+=.1;assert(!validatePlacement(model).ok);
 assert.throws(()=>placeOn(model,surface('small',0,0,1,1,0),{x:3}));
 assert.equal(groundHeight(-17,-10),.12);assert.equal(groundHeight(20,20),-.02);
});
test('central interactions reject walls, distance, unmet requirements and invisible objects',()=>{
 const wall={minX:-1,maxX:1,minY:0,maxY:4,minZ:1,maxZ:1.2};const world={occluders:[wall]};let called=0;
 const r=new InteractionRegistry(world);r.register({id:'book',object:{id:'book',kind:'read',x:0,z:2},height:.8,distance:3,action:()=>called++});
 assert.equal(r.nearest({x:0,z:0}),null);assert.equal(r.activate('book',{x:0,z:0}),false);
 wall.enabled=false;assert.equal(r.activate('book',{x:0,z:0}),true);assert.equal(called,1);
 assert.equal(r.activate('book',{x:0,z:-5}),false);r.entries.get('book').requirements=()=>false;assert.equal(r.nearest({x:0,z:0}),null);
 assert.throws(()=>r.register({id:'book'}));
});
