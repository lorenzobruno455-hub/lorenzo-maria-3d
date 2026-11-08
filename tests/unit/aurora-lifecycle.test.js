import {test} from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {Character} from '../../src/systems/character.js';import {Resources} from '../../src/systems/resources.js';
test('model replacement keeps newest load and releases stale and disposed leases',async()=>{
 const r=new Resources(),a=new Character(r),pending=new Map(),released=[];
 const pipeline={acquire:url=>new Promise(resolve=>pending.set(url,()=>resolve({model:new THREE.Group(),animations:[],release:()=>released.push(url)})))};
 const first=a.loadGLB('old',{},pipeline),second=a.loadGLB('new',{},pipeline);pending.get('new')();await second;const newest=a.custom;pending.get('old')();await first;assert.equal(a.custom,newest);assert.deepEqual(released,['old']);
 const third=a.loadGLB('late',{},pipeline);a.dispose();pending.get('late')();await third;assert.deepEqual(released,['old','new','late']);r.dispose();
});
test('load failure retains playable fallback and pose transitions',async()=>{
 const r=new Resources(),a=new Character(r);await assert.rejects(a.loadGLB('missing',{}, {acquire:async()=>{throw new Error('offline');}}),/offline/);
 assert.equal(a.body.visible,true);assert.equal(a.custom,null);a.update(.1,3);assert.equal(a.state,'walk');a.dispose();r.dispose();
});
test('selective ink registers loaded skinned actors and releases fallback shells',async()=>{
 const {InkOutlines}=await import('../../src/systems/ink-outlines.js');const r=new Resources(),scene=new THREE.Scene(),a=new Character(r);a.player=true;scene.add(a.root);
 const ink=new InkOutlines(scene,r,[a]);assert(ink.actorInk.length>1);
 const g=new THREE.BoxGeometry(.3,1,.3),count=g.attributes.position.count;g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(new Uint16Array(count*4),4));const weights=new Float32Array(count*4);for(let i=0;i<count;i++)weights[i*4]=1;g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));
 const m=new THREE.SkinnedMesh(g,r.material('#ffffff')),bone=new THREE.Bone();m.add(bone);m.bind(new THREE.Skeleton([bone]));const model=new THREE.Group();model.add(m);a.body.visible=false;a.custom=model;a.root.add(model);
 assert.equal(typeof ink.registerActor,'function');ink.registerActor(a);assert.equal(ink.actorInk.length,1);assert.equal(ink.actorInk[0].mesh.isSkinnedMesh,true);assert.equal(ink.actorInk[0].mesh.skeleton,m.skeleton);ink.update('low',new THREE.Vector3());assert(ink.actorInk[0].mesh.visible);ink.dispose();g.dispose();a.dispose();r.dispose();
});
test('re-registering the same root through a Character preserves player role and removes old records',async()=>{
 const {InkOutlines}=await import('../../src/systems/ink-outlines.js');const r=new Resources(),a=new Character(r),scene=new THREE.Scene();scene.add(a.root);const ink=new InkOutlines(scene,r,[{root:a.root,player:true}]);const old=ink.actorInk.map(i=>i.mesh);ink.registerActor(a);assert.equal(a.player,true);assert.equal(ink.actorInk.length,old.length);assert(old.every(m=>m.parent===null));ink.update('low',new THREE.Vector3());assert(ink.actorInk.some(i=>i.mesh.visible));ink.dispose();a.dispose();r.dispose();
});
test('saved positions displaced by new furniture recover nearby without losing the room',async()=>{
 const physics=await import('../../src/systems/physics.js');assert.equal(typeof physics.resolveSpawn,'function');const table={minX:-23.6,maxX:-22.4,minZ:-10.25,maxZ:-7.75};const p=physics.resolveSpawn({x:-23,z:-10.2},[table]);assert(!physics.blocked(p.x,p.z,[table]));assert(Math.hypot(p.x+23,p.z+10.2)<1);const clear={x:0,z:19};assert.deepEqual(physics.resolveSpawn(clear,[]),clear);
});
