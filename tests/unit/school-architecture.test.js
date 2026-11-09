import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { createSchoolArchitecture } from '../../src/systems/school-architecture.js';
const data=JSON.parse(fs.readFileSync(new URL('../../src/data/sao-jorge.json',import.meta.url)));

test('architectural dressing stays mounted, preserves apertures and releases only owned assets',()=>{
  const box=new THREE.BoxGeometry(1,1,1), materialCache=new Map();
  let borrowedDisposed=0;
  box.addEventListener('dispose',()=>borrowedDisposed++);
  const resources={geometry:()=>box},materials={get(color,kind){const key=color+kind;if(!materialCache.has(key)){const material=new THREE.MeshBasicMaterial();material.addEventListener('dispose',()=>borrowedDisposed++);materialCache.set(key,material);}return materialCache.get(key);}};
  for(const floor of data.floors){
    const result=createSchoolArchitecture({resources,materials,floor});
    assert(result.stats.windows>=8);assert(result.stats.fixtures>=8);assert(result.stats.draws<=15);
    assert.equal(result.colliders.length,result.stats.windows+floor.colliders.filter(c=>c.kind==='wall').length);assert.equal(result.group.position.y,0);
    for(const collider of result.colliders){assert.equal(collider.kind,'architecture-detail');assert(collider.minY>=floor.baseY+1.15);}
    const caps=result.group.getObjectByName('school-wall-caps');caps.geometry.computeBoundingBox();
    assert(Math.abs(caps.geometry.boundingBox.min.y-3.05)<1e-6);assert(Math.abs(caps.geometry.boundingBox.max.y-3.4)<1e-6);
    const wallCaps=result.colliders.filter(c=>c.minY===floor.baseY+3.05);
    for(const wall of floor.colliders.filter(c=>c.kind==='wall'))assert(wallCaps.some(c=>c.minX===wall.minX&&c.maxX===wall.maxX&&c.minZ===wall.minZ&&c.maxZ===wall.maxZ&&c.maxY===floor.baseY+3.4));
    for(const label of result.stats.labels){
      if(label.floor)assert.equal(label.y,.033);
      else if(label.text.startsWith('IDEIAS')||label.text.startsWith('LER'))assert.equal(Math.abs(label.x),10.875);
      else if(label.text==='SALÃO MULTIUSO')assert.equal(label.z,-18.875);
      else {assert.equal(label.y,2.87);assert.equal(label.height,.26);const room=floor.rooms.find(r=>r.name===label.text);assert(room);if(Math.abs(room.door.x)===2)assert.equal(label.x,room.door.x-Math.sign(room.door.x)*.095);else assert.equal(label.z,room.door.z+.095);}
    }
    const ceiling=result.group.getObjectByName('school-ceiling');assert.equal(ceiling.geometry,box);
    assert(Math.abs(ceiling.position.y-ceiling.scale.y/2-3.4)<1e-9);
    result.setInspection(true);assert.equal(ceiling.visible,false);assert.equal(caps.visible,false);result.setInspection(false);assert.equal(ceiling.visible,true);assert.equal(caps.visible,true);
    const parts=result.stats.parts;
    for(const p of parts.filter(p=>/window|curtain/.test(p.name))){
      assert(Math.min(Math.abs(p.minX),Math.abs(p.maxX))>=10.56,`${p.name} exceeds existing wall buffer`);
      assert(Math.max(Math.abs(p.minX),Math.abs(p.maxX))<=10.89);
      assert(p.minZ>-18.5&&p.maxZ<18.5,'window avoids wall corners');
    }
    for(const support of parts.filter(p=>p.name==='fixture-support')){
      const housing=parts.find(p=>p.name==='fixture-housing' && p.minX<=support.minX && p.maxX>=support.maxX && p.minZ<=support.minZ && p.maxZ>=support.maxZ);
      const canopy=parts.find(p=>p.name==='ceiling-canopy' && p.minX<=support.minX && p.maxX>=support.maxX && p.minZ<=support.minZ && p.maxZ>=support.maxZ);
      assert(housing&&canopy);assert(support.minY<=housing.maxY+.001);assert(support.maxY>=canopy.minY-.001);assert.equal(canopy.maxY,3.4);
    }
    for(const room of floor.rooms){
      if(floor.index===2)continue;
      const d=room.door;
      for(const p of parts.filter(p=>p.name==='door-jamb')){
        if(Math.abs(d.x)===2 && Math.abs((p.minX+p.maxX)/2-d.x)<.01)assert(p.maxZ<=d.z-d.width/2+.00001 || p.minZ>=d.z+d.width/2-.00001);
        else if(Math.abs(d.x)!==2 && Math.abs((p.minZ+p.maxZ)/2-d.z)<.01)assert(p.maxX<=d.x-d.width/2+.00001 || p.minX>=d.x+d.width/2-.00001);
      }
    }
    const edges=result.group.getObjectByName('selective-wall-edges');result.updateQuality('low');assert.equal(edges.visible,false);result.updateQuality('high');assert.equal(edges.visible,true);
    let disposed=0;const ownedChildren=result.group.children.filter(child=>child!==ceiling);const count=ownedChildren.length;ownedChildren.forEach(child=>{child.geometry.addEventListener('dispose',()=>disposed++);});
    result.dispose();result.dispose();assert.equal(disposed,count);assert.equal(borrowedDisposed,0);
  }
});
