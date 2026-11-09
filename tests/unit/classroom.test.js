import {test} from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {Resources} from '../../src/systems/resources.js';
test('classroom furniture rests on the floor and stays inside walls with a clear entrance',async()=>{
 const module=await import('../../src/systems/classroom.js').catch(()=>null);assert.ok(module,'classroom component missing');
 const previous=globalThis.document;globalThis.document={createElement:()=>({getContext:()=>new Proxy({},{get:()=>()=>{}})})};
 const r=new Resources(),scene=new THREE.Scene(),room=module.createClassroomDetails(scene,r);
 assert(room.metrics.desks>=6);assert(room.metrics.posters>=3);assert(room.metrics.windows>=5);
 for(const b of room.colliders){assert(b.minX>=-27.75&&b.maxX<=-6.25);assert(b.minZ>=-16.75&&b.maxZ<=-6.25);assert(Math.abs(b.minY-.12)<.01);assert(!(b.minX< -16&&b.maxX> -18&&b.maxZ> -8.0),'entrance blocked');}
 room.dispose();r.dispose();globalThis.document=previous;
});
test('rounded furniture batches together with indexed metal and rubber parts',async()=>{
 const previous=globalThis.document;globalThis.document={createElement:()=>({getContext:()=>new Proxy({},{get:()=>()=>{}})})};const {PropLibrary}=await import('../../src/systems/prop-library.js');const r=new Resources(),lib=new PropLibrary(r);const desk=lib.create('desk');assert(desk.children.length<8);const chair=lib.create('chair');assert(chair.children.length<6);r.dispose();globalThis.document=previous;
});
