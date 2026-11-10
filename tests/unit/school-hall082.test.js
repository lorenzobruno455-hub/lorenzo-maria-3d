import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as THREE from 'three';
import{Resources}from'../../src/systems/resources.js';import{createSchoolLivingDetails}from'../../src/systems/school-living-details.js';import{furnitureSource}from'../fixtures/school-glb.js';import{SchoolNavigation}from'../../src/systems/school-navigation.js';import{findPath}from'../../src/systems/navigation.js';import{NARRATIVE_POINTS,ACTOR_ROUTES}from'../../src/systems/school-narrative-map.js';
const layout=JSON.parse(fs.readFileSync('src/data/sao-jorge.json')),resources=new Resources(),cache=new Map(),materials={get(c,k){const key=c+k;if(!cache.has(key))cache.set(key,new THREE.MeshBasicMaterial());return cache.get(key);}};
test('new fitout preserves access to original room centers, doors, stairs and narrative approaches',()=>{
 const owners=[],floors=layout.floors.map(f=>{const source=furnitureSource(f),d=createSchoolLivingDetails({resources,materials,floor:f,source});owners.push(()=>{d.dispose();source.geometry.dispose();});return{...f,colliders:[...f.colliders,...d.colliders]};}),nav=new SchoolNavigation({...layout,floors});
 for(const f of floors){const targets=[...f.rooms.map(r=>({x:r.x,z:r.z})),...f.rooms.map(r=>r.door).filter(Boolean),...f.stairs,...Object.values(NARRATIVE_POINTS).filter(p=>p.floor===f.index&&p.approach).map(p=>p.approach),...Object.values(ACTOR_ROUTES).filter(r=>r.floor===f.index).flatMap(r=>r.route)];
 for(const p of targets)assert.ok(findPath(f.spawn,p,nav.movementObstacles(f.index)).length,`floor ${f.index}, unreachable ${JSON.stringify(p)}`);}
 owners.forEach(f=>f());
});
test('hall furniture stays reversible at the perimeter and adds no obstruction to the central activity space',()=>{
 const floor=layout.floors[2],source=furnitureSource(floor),d=createSchoolLivingDetails({resources,materials,floor,source});
 assert.ok(d.placements.filter(p=>p.kind==='chair').length>=8);for(const c of d.colliders)assert.ok(c.maxX<-6||c.minX>6,'central hall remains empty');assert.ok(d.stats.draws<=4);assert.ok(d.stats.triangles<15000);for(const m of d.group.children)assert.equal(m.castShadow,false);d.updateQuality('high');for(const m of d.group.children)assert.equal(m.castShadow,true);d.updateQuality('low');for(const m of d.group.children)assert.equal(m.castShadow,false);
 d.dispose();source.geometry.dispose();
});
