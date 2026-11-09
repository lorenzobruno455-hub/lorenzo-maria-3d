import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {addLibraryDetails,addGardenDetails} from '../../src/systems/library-garden07c.js';
import {batchMeshes} from '../../src/systems/batching.js';
test('07C procedural dressing batches by a bounded shared palette without new geometry types',()=>{
 const group=new THREE.Group(),geometry=new THREE.BoxGeometry(),materials=new Map(),owned=[];
 const place=(kind,color,scale,x,y,z)=>{
  assert(['box','cylinder','sphere','leaf'].includes(kind));
  if(!materials.has(color))materials.set(color,new THREE.MeshBasicMaterial({color}));
  const mesh=new THREE.Mesh(geometry,materials.get(color));mesh.scale.set(...scale);mesh.position.set(x,y,z);group.add(mesh);return mesh;
 };
 addLibraryDetails(place);addGardenDetails(place);
 assert(group.children.length>400,'substantial physical detail');
 const count=group.children.length;batchMeshes(group,[...group.children],owned);
 assert(group.children.length<=14,`${count} details must share <=14 material batches`);
 assert.equal(group.children.length,materials.size);
 for(const mesh of group.children)assert(mesh.userData.inkStatic);
 owned.forEach(g=>g.dispose());geometry.dispose();materials.forEach(m=>m.dispose());
});
