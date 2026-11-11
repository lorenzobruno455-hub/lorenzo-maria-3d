import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Resources} from '../../src/systems/resources.js';
import {InkOutlines} from '../../src/systems/ink-outlines.js';
import {createActorInkMaterial} from '../../src/systems/actor-ink-material.js';
import {decorateOverdriveMaterial} from '../../src/systems/comic-overdrive-p0.js';
import {decorateOverdrive20Material,createOverdrive20Ink} from '../../src/systems/comic-overdrive-20.js';
import {batchMeshes} from '../../src/systems/batching.js';

test('native and cached primitives can still share a material batch',()=>{
 const r=new Resources(),root=new THREE.Group(),owned=[],material=r.material('#ffffff');
 root.add(r.mesh('box','#ffffff',[1,1,1]),new THREE.Mesh(new THREE.TorusGeometry(1,.02,4,8),material));
 assert.doesNotThrow(()=>batchMeshes(root,[...root.children],owned));assert.equal(root.children.length,1);
 owned.forEach(g=>g.dispose());r.dispose();
});

test('box face borders have an explicit opt-in; cylinders cannot acquire a false UV seam',()=>{
 const r=new Resources();for(const kind of ['box','rounded','cylinder','sphere','leaf']){
  const g=r.geometry(kind),flag=g.getAttribute('comicBoxEdge');assert.ok(flag,kind);assert.equal(flag.count,g.getAttribute('position').count);
  assert.ok([...flag.array].every(x=>x===(kind==='box'?1:0)),kind);
 }r.dispose();
});
test('expanded borders share pixel ratio, keep actual sRGB floor colors and restore the shader chain',()=>{
 const r=new Resources(),m=r.material('#ffffff','tile'),undoBase=decorateOverdriveMaterial(m,[],{global:true,finishing:true}),compile=m.onBeforeCompile,ratio={value:1.35};
 const undo=decorateOverdrive20Material(m,'b',{expanded:true,edgePixelRatio:ratio});
 const shader={uniforms:{},vertexShader:THREE.ShaderLib.toon.vertexShader,fragmentShader:THREE.ShaderLib.toon.fragmentShader};m.onBeforeCompile(shader);
 assert.equal(shader.uniforms.co20PixelRatio,ratio);assert.equal(shader.uniforms.co20Floor.value.getHexString(),'60402f');assert.equal(shader.uniforms.co20Paving.value.getHexString(),'69717d');
 assert.match(shader.vertexShader,/comicBoxEdge/);assert.match(shader.fragmentShader,/fwidth\(co20UV\)/);assert.ok(shader.vertexShader.includes('#include <skinning_vertex>'));
 undo();assert.equal(m.onBeforeCompile,compile);undoBase();r.dispose();
});
test('minimum NPC silhouettes survive Low only when the expanded style requests them',()=>{
 const scene=new THREE.Scene(),root=new THREE.Group(),body=new THREE.Group();root.add(body);scene.add(root);body.name='body';body.add(new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial()));
 const ink=new InkOutlines(scene,{},[{root,body,player:false}]),camera=new THREE.PerspectiveCamera();camera.position.z=5;
 ink.update('low',root.position,camera);assert.equal(ink.actorInk[0].mesh.visible,false);
 ink.minimalNPCInk=true;ink.update('low',root.position,camera);assert.equal(ink.actorInk[0].mesh.visible,true);
 camera.position.z=50;ink.update('low',root.position,camera);assert.equal(ink.actorInk[0].mesh.visible,false);ink.dispose();body.children[0].geometry.dispose();body.children[0].material.dispose();
});
test('BackSide canopy ink cancels FLIP_SIDED after instanced normal transformation to expand outward',()=>{
 const m=createActorInkMaterial({instanced:true}),s={uniforms:{},vertexShader:THREE.ShaderLib.basic.vertexShader};m.onBeforeCompile(s);assert.equal(m.side,THREE.BackSide);assert.match(THREE.ShaderChunk.defaultnormal_vertex,/#ifdef FLIP_SIDED/);assert.match(s.vertexShader,/cbInkNormal=normalize\(-transformedNormal\)/);assert.ok(s.vertexShader.indexOf('cbInkOffset')>s.vertexShader.indexOf('#include <defaultnormal_vertex>'));m.dispose();
});
test('campus ink reuses its line draw instead of expanding all micro-edges, and restores borrowed material',()=>{
 const geometry=new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,1,0,0],3)),material=new THREE.LineBasicMaterial({color:'#778899',opacity:.48}),source=new THREE.LineSegments(geometry,material);
 const ink=createOverdrive20Ink({school:{connection:{proxies:[]},leases:new Map()},variant:'b',expanded:true,ink:{staticInk:source}});
 assert.equal(source.children.length,0);assert.equal(source.geometry,geometry);assert.equal(material.opacity,1);ink.dispose();assert.equal(material.color.getHexString(),'778899');assert.equal(material.opacity,.48);geometry.dispose();material.dispose();
});
