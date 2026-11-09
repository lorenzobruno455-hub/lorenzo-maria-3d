import test from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
test('context accent reuses one geometry, stays still for reduced motion and clears stale targets',async()=>{
 const {InteractionAccent}=await import('../../src/systems/interaction-accent.js'),scene=new THREE.Scene(),accent=new InteractionAccent(scene),geometry=accent.mesh.geometry,material=accent.mesh.material;
 accent.update({kind:'item',x:2,z:4,height:8},0,{reducedMotion:true});assert.equal(accent.mesh.visible,true);assert.equal(accent.mesh.position.y,8.025);const scale=accent.mesh.scale.x;
 accent.update({kind:'item',x:2,z:4,height:8},5,{reducedMotion:true});assert.equal(accent.mesh.scale.x,scale);accent.update(null,6);assert.equal(accent.mesh.visible,false);accent.update({kind:'npc',x:2,z:4},7);assert.equal(accent.mesh.visible,false);assert.equal(accent.mesh.geometry,geometry);assert.equal(accent.mesh.material,material);let count=0;geometry.addEventListener('dispose',()=>count++);accent.dispose();accent.dispose();assert.equal(count,1);assert.equal(scene.children.length,0);
});
test('context accent follows a prop support on an upper floor when legacy target has no height',async()=>{
 const {InteractionAccent}=await import('../../src/systems/interaction-accent.js');const scene=new THREE.Scene(),floor=new THREE.Group(),prop=new THREE.Group();floor.position.y=4;prop.position.set(2,.8,4);floor.add(prop);scene.add(floor);const accent=new InteractionAccent(scene);accent.update({kind:'item',x:2,z:4,ref:{mesh:prop}},0,{floorY:4,reducedMotion:true});assert.ok(Math.abs(accent.mesh.position.y-4.825)<1e-8);accent.dispose();
});
