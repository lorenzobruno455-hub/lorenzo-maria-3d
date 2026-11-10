import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as THREE from 'three';
import {createSchoolArchitecture} from '../../src/systems/school-architecture.js';
const floors=JSON.parse(fs.readFileSync(new URL('../../src/data/sao-jorge.json',import.meta.url))).floors;
const resources={geometry:()=>new THREE.BoxGeometry()},material=new THREE.MeshBasicMaterial(),materials={get:()=>material};
test('all wall labels face their reader and stay outside actual wall volumes',()=>{
 for(const floor of floors){const result=createSchoolArchitecture({resources,materials,floor});
 for(const s of result.stats.labels.filter(s=>!s.floor)){
  const normal=new THREE.Vector3(0,0,1).applyAxisAngle(new THREE.Vector3(0,1,0),s.rotation);
  // An unobstructed ray from the intended reading side must hit the label before the wall.
  const p=new THREE.Vector3(s.x,s.y,s.z),origin=p.clone().addScaledVector(normal,.5);
  for(const c of floor.colliders.filter(c=>c.kind==='wall')){
   const box=new THREE.Box3(new THREE.Vector3(c.minX,c.minY-floor.baseY,c.minZ),new THREE.Vector3(c.maxX,c.maxY-floor.baseY,c.maxZ));
   assert.equal(box.containsPoint(p),false,`${s.text} embedded in wall`);
   const hit=new THREE.Ray(origin,normal.clone().negate()).intersectBox(box,new THREE.Vector3());
   if(hit)assert.ok(hit.distanceTo(origin)>.505,`${s.text}: wall occludes reading side`);
  }
  if(s.y===2.87 && Math.abs(s.x)>1.8 && Math.abs(s.x)<2.1)assert.ok(normal.x*s.x<0,'door sign faces corridor');
 }
 result.dispose();}
});
test('each classroom has a board lesson and original mural; all atlas UVs stay in range',()=>{
 for(const floor of floors){const result=createSchoolArchitecture({resources,materials,floor});
 for(const room of floor.rooms.filter(r=>r.type==='class')){
  assert.ok(result.stats.labels.some(s=>s.roomId===room.id&&s.kind==='lesson'));
  assert.ok(result.stats.labels.some(s=>s.roomId===room.id&&s.kind==='mural'));
 }
 const uv=result.group.getObjectByName('school-sign-atlas').geometry.attributes.uv;
 for(let i=0;i<uv.count;i++)assert.ok(uv.getX(i)>0&&uv.getX(i)<1&&uv.getY(i)>0&&uv.getY(i)<1,'atlas UV inside painted bounds');
 result.dispose();}
});

import {Resources} from '../../src/systems/resources.js';
import {createSchoolFurniture,decodeFurnitureBoxes} from '../../src/systems/school-furniture.js';
import {NARRATIVE_POINTS,bookPoint} from '../../src/systems/school-narrative-map.js';
function furnitureSource(floor){const b=fs.readFileSync(new URL(`../../public${floor.url}`,import.meta.url)),n=b.readUInt32LE(12),g=JSON.parse(b.subarray(20,20+n)),bin=b.subarray(28+n),geo=new THREE.BufferGeometry();for(const[k,name]of[['POSITION','position'],['NORMAL','normal'],['COLOR_0','color']]){const ac=g.accessors[g.meshes.find(m=>m.name==='furniture').primitives[0].attributes[k]],v=g.bufferViews[ac.bufferView],a=new Float32Array(ac.count*3);for(let i=0;i<a.length;i++)a[i]=bin.readFloatLE((v.byteOffset||0)+(ac.byteOffset||0)+i*4);geo.setAttribute(name,new THREE.BufferAttribute(a,3));}return new THREE.Mesh(geo);}
test('all eight classrooms dress multiple real tables without occupying narrative supports',()=>{
 const resources=new Resources();let classrooms=0;
 for(const floor of floors.slice(0,2)){const source=furnitureSource(floor),boxes=decodeFurnitureBoxes(source),result=createSchoolFurniture({resources,materials,floor,source});
 for(const room of floor.rooms.filter(r=>r.type==='class')){classrooms++;const tables=new Set(result.supports.filter(s=>{const b=boxes[s.sourceBox];return b.center[0]>room.x1&&b.center[0]<room.x2&&b.center[2]>room.z1&&b.center[2]<room.z2;}).map(s=>s.sourceBox));assert.ok(tables.size>=4,`${room.id}: several desks need purposeful objects`);}
 const targets=[...Object.values(NARRATIVE_POINTS),...Array.from({length:6},(_,i)=>bookPoint(i))].filter(p=>p.floor===floor.index&&p.top!=null);
 for(const s of result.supports.filter(s=>s.decorative)){for(const p of targets){if(Math.abs(p.top-s.parentSurfaceY)>.25)continue;const dx=Math.max(s.bounds.minX-p.x,0,p.x-s.bounds.maxX),dz=Math.max(s.bounds.minZ-p.z,0,p.z-s.bounds.maxZ);assert.ok(Math.hypot(dx,dz)>.25,`${p.name} cluttered`);}}
 result.dispose();source.geometry.dispose();}assert.equal(classrooms,8);resources.dispose();
});
test('library adds varied books only into unoccupied shelf volumes and releases owned buffers',()=>{
 const resources=new Resources(),floor=floors[0],source=furnitureSource(floor),boxes=decodeFurnitureBoxes(source),result=createSchoolFurniture({resources,materials,floor,source});
 const books=result.supports.filter(s=>s.role==='shelf-book');assert.ok(books.length>=30,'fill gaps across existing shelves');assert.ok(new Set(books.map(s=>s.bounds.maxY-s.bounds.minY)).size>=3,'vary book height');
 for(const s of books){for(const b of boxes){if(b===boxes[s.sourceBox])continue;assert.ok(s.bounds.maxX<=b.min[0]||s.bounds.minX>=b.max[0]||s.bounds.maxZ<=b.min[2]||s.bounds.minZ>=b.max[2]||s.bounds.maxY<=b.min[1]+1e-6||s.bounds.minY>=b.max[1]-1e-6,'no existing volume intersection');}}
 assert.ok(result.stats.meshCount<=22);let disposed=0;result.group.children.forEach(m=>m.geometry.addEventListener('dispose',()=>disposed++));const count=result.group.children.length;result.dispose();result.dispose();assert.equal(disposed,count);resources.dispose();source.geometry.dispose();
});
test('corridor dressing preserves door apertures and existing player clearance',()=>{
 for(const floor of floors.slice(0,2)){const result=createSchoolArchitecture({resources,materials,floor});assert.ok(result.stats.labels.filter(s=>s.kind==='corridor').length>=4);assert.ok(result.stats.atlas.width*result.stats.atlas.height<=256*4096);
 for(const p of result.stats.parts.filter(p=>p.name.startsWith('fountain')||p.name==='water-fountain')){
  assert.ok(Math.min(Math.abs(p.minX),Math.abs(p.maxX))>=1.55,'inside inherited wall/player margin');
  assert.ok(floor.colliders.some(c=>c.kind==='wall'&&c.minY===floor.baseY&&p.minZ>=c.minZ&&p.maxZ<=c.maxZ&&Math.abs((c.minX+c.maxX)/2-Math.sign(p.minX)*2)<.01),'solid wall support away from doors');
 }
 result.dispose();}
});
