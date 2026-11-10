import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Resources} from '../../src/systems/resources.js';
import {decorateOverdriveMaterial} from '../../src/systems/comic-overdrive-p0.js';
import {createComicCanopies} from '../../src/systems/comic-overdrive-nature.js';

test('global environment profile removes spatial-mask work and keeps alpha, texture and rig chunks',()=>{
 const r=new Resources();
 for(const kind of ['wood','plaster','glass','plain']){
  const m=r.material(kind==='glass'?'#a9ced5':'#f4f0e7',kind),old=m.onBeforeCompile,map=m.map,opacity=m.opacity;
  const restore=decorateOverdriveMaterial(m,[],{global:true});
  const lib=m.isMeshStandardMaterial?THREE.ShaderLib.standard:THREE.ShaderLib.toon;
  const s={uniforms:{},vertexShader:lib.vertexShader,fragmentShader:lib.fragmentShader};m.onBeforeCompile(s);
  assert.ok(s.fragmentShader.includes('float coScope(vec3 p){return 1.;}'),kind);
  assert.ok(!s.fragmentShader.includes('coAreaMin['),kind);
  assert.ok(s.vertexShader.includes('#include <skinning_vertex>'));
  assert.ok(s.vertexShader.includes('instanceMatrix'));
  assert.equal(m.map,map);assert.equal(m.opacity,opacity);restore();assert.equal(m.onBeforeCompile,old);
 }
 r.dispose();
});

test('comic crowns retain the original visibility parent and restore counts without owning shared GPU resources',()=>{
 const r=new Resources(),scene=new THREE.Scene(),source=new THREE.InstancedMesh(r.geometry('leaf'),r.material('#698756'),36);
 source.userData.comicTreeCenters=[{x:-32,y:4.5,z:13},{x:32,y:4.5,z:24}];scene.add(source);const owned=[];
 let disposed=0;source.geometry.addEventListener('dispose',()=>disposed++);source.material.addEventListener('dispose',()=>disposed++);
 const crowns=createComicCanopies(scene,r,owned);assert.equal(source.count,0);assert.equal(crowns.trees,2);assert.equal(source.children[0].parent,source);
 const fill=source.children[0].children[1];assert.equal(fill.count,6);assert.equal(fill.geometry,source.geometry);assert.equal(fill.frustumCulled,true);
 crowns.setInspection(true);assert.equal(source.children[0].children[0].visible,false);assert.equal(fill.visible,true);crowns.setInspection(false);assert.equal(source.children[0].children[0].visible,true);
 const restored=source.instanceMatrix.array.slice();crowns.restore();owned.forEach(o=>o.dispose());assert.equal(source.count,36);assert.deepEqual(source.instanceMatrix.array,restored);assert.equal(source.children.length,0);assert.equal(disposed,0);
 source.dispose();r.dispose();
});
