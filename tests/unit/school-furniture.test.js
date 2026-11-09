import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { Resources } from '../../src/systems/resources.js';
import { createSchoolFurniture, decodeFurnitureBoxes } from '../../src/systems/school-furniture.js';
const floors = JSON.parse(fs.readFileSync(new URL('../../src/data/sao-jorge.json', import.meta.url))).floors;
function sourceFor(floor) {
  const b = fs.readFileSync(new URL(`../../public${floor.url}`, import.meta.url));
  const n = b.readUInt32LE(12), gltf = JSON.parse(b.subarray(20,20+n)), binary = b.subarray(28+n);
  const primitive = gltf.meshes.find(m => m.name === 'furniture').primitives[0], geometry = new THREE.BufferGeometry();
  for (const [key,name] of [['POSITION','position'],['NORMAL','normal'],['COLOR_0','color']]) {
    const a = gltf.accessors[primitive.attributes[key]], v = gltf.bufferViews[a.bufferView], offset = (v.byteOffset||0)+(a.byteOffset||0);
    const array = new Float32Array(a.count*3); for(let i=0;i<array.length;i++) array[i]=binary.readFloatLE(offset+i*4);
    geometry.setAttribute(name,new THREE.BufferAttribute(array,3));
  }
  return new THREE.Mesh(geometry,new THREE.MeshBasicMaterial());
}
const resources = new Resources();
const cache = new Map();
const materials = { get(color,finish) { const key=color+finish; if(!cache.has(key))cache.set(key,new THREE.MeshBasicMaterial({color})); return cache.get(key); } };
for (const floor of floors) test(`floor ${floor.index}: real GLB decoding, support and disposal`,()=>{
  const source=sourceFor(floor), boxes=decodeFurnitureBoxes(source);
  assert.ok(boxes.length>0); assert.ok(boxes.every(b=>b.color.startsWith('#')));
  let borrowedDisposed=false; source.geometry.addEventListener('dispose',()=>borrowedDisposed=true);
  const result=createSchoolFurniture({resources,materials,floor,source});
  assert.equal(source.visible,false); assert.equal(result.stats.sourceBoxes,boxes.length);
  assert.ok(result.stats.meshCount <= 22, `batches ${result.stats.meshCount}`);
  assert.ok(result.stats.triangles < 120000,`triangles ${result.stats.triangles}`);
  for(const s of result.supports){
    assert.ok(s.bounds.minX>=s.parent.minX && s.bounds.maxX<=s.parent.maxX);
    assert.ok(s.bounds.minZ>=s.parent.minZ && s.bounds.maxZ<=s.parent.maxZ);
    assert.equal(s.bounds.minY,s.surfaceY);
    if(s.offset)assert.ok(result.supports.some(other=>other.sourceBox===s.sourceBox && Math.abs(other.bounds.maxY-s.surfaceY)<1e-7 && other.bounds.minX<s.bounds.maxX && other.bounds.maxX>s.bounds.minX && other.bounds.minZ<s.bounds.maxZ && other.bounds.maxZ>s.bounds.minZ));
  }
  for(const c of result.colliders)assert.ok(c.minY >= floor.baseY+.65);
  const merged = result.group.children.map(m=>m.geometry); let disposed=0;merged.forEach(g=>g.addEventListener('dispose',()=>disposed++));
  result.dispose();result.dispose();assert.equal(disposed,merged.length);assert.equal(source.visible,true);assert.equal(borrowedDisposed,false);
  console.log({floor:floor.index,...result.stats});
});
test('unsupported inputs retain original visibility',()=>{
 const source=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial());
 assert.equal(createSchoolFurniture({resources,materials,floor:floors[0],source}),null);assert.equal(source.visible,true);
 const real=sourceFor(floors[0]);real.geometry.attributes.color.setX(1,.678);
 assert.equal(decodeFurnitureBoxes(real),null);
});
test('real blue chair backs and wooden post fixture retain their source hues',()=>{
  const source=sourceFor(floors[0]), boxes=decodeFurnitureBoxes(source);
  const blueBack=boxes.find(b=>['#2d5fa8','#2f5d9a'].includes(b.color) && b.size[2]<.09 && b.size[0]>.45 && b.size[1]>.3);
  const woodPost=boxes.find(b=>['#8b6a4e','#c49b70','#a98262','#7a5a3d'].includes(b.color));
  // M1 has metal legs only; use its actual wood hue on a thin post fixture.
  const postGeometry=new THREE.BoxGeometry(.06,.65,.06).toNonIndexed();
  const rgb=new THREE.Color(woodPost.color), colors=[];
  for(let i=0;i<postGeometry.attributes.position.count;i++) colors.push(rgb.r,rgb.g,rgb.b);
  postGeometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  const post=new THREE.Mesh(postGeometry,source.material);
  assert.ok(blueBack,'actual blue chair back found');assert.ok(woodPost,'actual wood hue found');
  const used=[];
  const result=createSchoolFurniture({resources,materials:{get(color,finish){used.push({color,finish});return materials.get(color,finish);}},floor:floors[0],source});
  const postResult=createSchoolFurniture({resources,materials:{get(color,finish){used.push({color,finish});return materials.get(color,finish);}},floor:floors[0],source:post});
  assert.ok(used.some(m=>m.color===blueBack.color && m.finish==='plastic'));
  assert.ok(used.some(m=>m.color===woodPost.color && m.finish==='wood'));
  result.dispose();postResult.dispose();postGeometry.dispose();
});

test('selective furniture contours use a single owned batch and are disabled on Low',()=>{
 const source=sourceFor(floors[0]),result=createSchoolFurniture({resources,materials,floor:floors[0],source});assert(result.edges?.isLineSegments);assert(result.stats.outlineSegments>0);result.updateQuality('low');assert.equal(result.edges.visible,false);result.updateQuality('high');assert.equal(result.edges.visible,true);
 let disposed=0;result.edges.geometry.addEventListener('dispose',()=>disposed++);result.dispose();result.dispose();assert.equal(disposed,1);
});
