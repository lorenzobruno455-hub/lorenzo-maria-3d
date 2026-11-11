import test from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {Resources} from '../../src/systems/resources.js';import {GLBAssets} from '../../src/systems/asset-pipeline.js';
import {decorateOverdriveMaterial} from '../../src/systems/comic-overdrive-p0.js';
test('authored actor roles are opt-in, preserve colors/clips and borrow the shared cache',async()=>{
 for(const enabled of [false,true]){
  const r=new Resources();r.colorbeat.actorProfiles=enabled;const root=new THREE.Group(),names=['skin','hair','eye','shirt'];
  for(const name of names){const m=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial({color:'#eadfc8'}));m.name=name;m.material.name=name;root.add(m);}
  const clip=new THREE.AnimationClip('Idle',1,[]),pool=new GLBAssets(r,{load:async()=>({scene:root,animations:[clip]})}),lease=await pool.acquire('actor-roles');
  for(const name of names){const m=lease.model.getObjectByName(name),kind=name==='shirt'?'fabric':enabled?name:'plain';assert.equal(m.material.userData.colorbeatKind,kind);if(enabled&&name!=='shirt')assert.equal(m.material.color.getHexString(),'eadfc8');assert.equal(m.material,r.material('#eadfc8',kind));}
  assert.equal(lease.animations[0],clip);assert.equal(pool.ownedMaterials.size,0);let disposed=0;lease.model.getObjectByName('skin').material.addEventListener('dispose',()=>disposed++);lease.release();pool.dispose();assert.equal(disposed,0);r.dispose();
 }
});
test('finishing materials share hatch budget, preserve skinning and distinguish skin, hair and eyes',()=>{
 const r=new Resources(),budget={value:1};
 for(const [kind,family]of [['skin',5],['hair',6],['eye',7],['wood',1]]){
  const m=r.material('#be8870',kind),old=m.onBeforeCompile,restore=decorateOverdriveMaterial(m,[],{global:true,finishing:true,hatchBudget:budget}),s={uniforms:{},vertexShader:THREE.ShaderLib.toon.vertexShader,fragmentShader:THREE.ShaderLib.toon.fragmentShader};m.onBeforeCompile(s);
  assert.equal(s.uniforms.coFamily.value,family);assert.equal(s.uniforms.coHatchBudget,budget);assert.ok(s.vertexShader.includes('#include <skinning_vertex>'));assert.ok(s.fragmentShader.includes('fwidth(coHatchPhase)'));budget.value=0;assert.equal(s.uniforms.coHatchBudget.value,0);restore();assert.equal(m.onBeforeCompile,old);
 }
 r.dispose();
});
