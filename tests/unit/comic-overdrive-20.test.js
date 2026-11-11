import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Resources} from '../../src/systems/resources.js';
import {decorateOverdriveMaterial} from '../../src/systems/comic-overdrive-p0.js';
import {decorateOverdrive20Material,createOverdrive20Ink} from '../../src/systems/comic-overdrive-20.js';

test('D1 composes and restores the borrowed toon pipeline without disposing shared resources',()=>{
 for(const variant of ['a','b']){
  const r=new Resources(),m=r.material('#ffffff','tile'),compile=m.onBeforeCompile,key=m.customProgramCacheKey(),ramp=m.gradientMap;
  let disposed=0;m.addEventListener('dispose',()=>disposed++);
  const undoBase=decorateOverdriveMaterial(m,[],{global:true,finishing:true}),baseCompile=m.onBeforeCompile;
  const undo=decorateOverdrive20Material(m,variant),shader={uniforms:{},vertexShader:THREE.ShaderLib.toon.vertexShader,fragmentShader:THREE.ShaderLib.toon.fragmentShader};
  m.onBeforeCompile(shader);assert.equal(m.gradientMap,ramp);assert.ok(shader.uniforms.co20Floor);
  assert.ok(shader.vertexShader.includes('#include <skinning_vertex>'));assert.ok(shader.vertexShader.includes('instanceMatrix'));
  undo();undo();assert.equal(m.onBeforeCompile,baseCompile);undoBase();assert.equal(m.onBeforeCompile,compile);assert.equal(m.customProgramCacheKey(),key);assert.equal(disposed,0);r.dispose();
 }
});

test('D1 leaves transparent glazing and atlas lettering callbacks untouched',()=>{
 for(const material of [new THREE.MeshBasicMaterial(),new THREE.MeshStandardMaterial({transparent:true,opacity:.42})]){
  const compile=material.onBeforeCompile,key=material.customProgramCacheKey;
  decorateOverdrive20Material(material,'a')();assert.equal(material.onBeforeCompile,compile);assert.equal(material.customProgramCacheKey,key);material.dispose();
 }
});

test('D1 ink follows streamed root transforms/visibility and frees only its own buffers',()=>{
 const r=new Resources(),proxy=new THREE.Group(),floor=new THREE.Group(),mesh=r.mesh('box','#ffffff',[2,3,1]);
 mesh.userData.inkStatic=true;proxy.position.set(60,7.2,0);proxy.add(mesh);let released=0;mesh.geometry.addEventListener('dispose',()=>released++);
 const school={connection:{proxies:[proxy]},leases:new Map()},ink=createOverdrive20Ink({school,variant:'b'});
 assert.equal(ink.state().edgeBatches,1);school.leases.set(0,{model:floor});const structure=r.mesh('box','#ffffff',[2,3,1]);structure.name='structure';floor.add(structure);
 ink.update();ink.update();assert.equal(ink.state().edgeBatches,2);
 const line=proxy.children.find(o=>o.isLineSegments2);assert.ok(line);assert.equal(line.material.depthTest,true);assert.equal(line.material.linewidth,2.8);assert.equal(line.castShadow,false);
 assert.equal(line.geometry.instanceCount,12); // Six real box faces, twelve edges, no triangulation diagonals.
 proxy.visible=false;assert.equal(line.parent.visible,false);
 ink.dispose();ink.dispose();assert.equal(proxy.children.length,1);assert.equal(floor.children.length,1);assert.equal(released,0);r.dispose();
});
