import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { FollowCamera } from '../../src/systems/camera.js';
import { freshProgress, freshSchoolVisit, validateSchoolVisit, validateProgress, saveProgress, loadSave, SAVE_KEY, PRE08_SAVE_KEY } from '../../src/systems/progress.js';
const memory = () => { const data = new Map(); return { getItem: k => data.get(k) ?? null, setItem: (k,v) => data.set(k,v) }; };
test('school visit validates independently and preserves legacy progress', () => {
  const p = validateProgress(freshProgress()); p.campaign.talks=7; p.adventure.active='first-encounter'; p.adventure.quests['first-encounter'].status='active'; p.stage=1; p.collected=['card']; p.position={x:20,z:24}; p.doors=[true,false]; p.interactions={'mission-old':true};
  p.schoolVisit={active:true,floor:2,position:{x:2,z:12},yaw:1,pitch:.5,actors:{}};
  const valid=validateProgress(p); assert.deepEqual(valid,p); assert.deepEqual(validateSchoolVisit({active:1,floor:8,position:{x:99,z:12},yaw:NaN,pitch:Infinity}),freshSchoolVisit());
  assert.equal(validateSchoolVisit({floor:1.5}).floor,0); assert.deepEqual(validateSchoolVisit({position:{x:0,z:NaN}}).position,{x:0,z:14.5});
  assert.notEqual(freshProgress().schoolVisit.position,freshProgress().schoolVisit.position);
});
test('first save snapshots exact old raw once and backup recovers corrupt current', () => {
 const s=memory(); const old=' {"version":4,"progress":{"stage":1,"collected":["card"],"position":{"x":20,"z":24},"doors":[true,false],"interactions":{"mission-old":true}}} ';
 s.setItem(SAVE_KEY,old); const p=loadSave(s).progress; p.schoolVisit.active=true; p.schoolVisit.floor=2;
 assert(saveProgress(s,p,{})); assert.equal(s.getItem(PRE08_SAVE_KEY),old); assert.deepEqual(loadSave(s).progress,p);
 assert(saveProgress(s,p,{})); assert.equal(s.getItem(PRE08_SAVE_KEY),old);
 s.setItem(SAVE_KEY,'{broken'); const restored=loadSave(s); assert(restored.exists); assert.equal(restored.progress.position.x,20); assert.equal(restored.progress.interactions['mission-old'],true);
});
test('failed storage reads or backup writes never overwrite existing save', () => {
 const s=memory(); const old='{"progress":{"stage":1}}'; s.setItem(SAVE_KEY,old); s.setItem('lorenzo-maria-v03','legacy untouched'); const set=s.setItem;
 s.setItem=(k,v)=>{if(k===PRE08_SAVE_KEY)throw Error('quota');set(k,v);}; assert.equal(saveProgress(s,freshProgress(),{}),false); assert.equal(s.getItem(SAVE_KEY),old); assert.equal(s.getItem('lorenzo-maria-v03'),'legacy untouched');
 let writes=0; assert.equal(saveProgress({getItem(){throw Error('denied');},setItem(){writes++;}},freshProgress(),{}),false); assert.equal(writes,0);
 const quota=memory(); quota.setItem(SAVE_KEY,old); const write=quota.setItem; quota.setItem=(k,v)=>{if(k===SAVE_KEY)throw Error('full');write(k,v);}; assert.equal(saveProgress(quota,freshProgress(),{}),false); assert.equal(quota.getItem(SAVE_KEY),old); assert.equal(quota.getItem(PRE08_SAVE_KEY),old);
 assert(saveProgress({setItem(){}},freshProgress(),{}));
});
test('follow camera follows elevated floors and respects walls, ceilings and explicit focus', () => {
 const camera=new THREE.PerspectiveCamera(); const orbit=new FollowCamera(camera,[]); orbit.update({x:0,y:8,z:0},.016,true); assert.equal(orbit.focus.y,9.42);
 orbit.obstacles=[{minX:-3,maxX:3,minY:8,maxY:13,minZ:2,maxZ:2.3}]; orbit.update({x:0,y:8,z:0},.016,true); assert(orbit.actualDistance<2);
 orbit.obstacles=[{minX:-10,maxX:10,minY:10.5,maxY:11,minZ:-10,maxZ:10}]; orbit.update({x:0,y:8,z:0},.016,true); assert(camera.position.y<10.5);
 orbit.obstacles=[]; orbit.conversation=true; orbit.partner={x:1,z:0}; orbit.update({x:0,y:8,z:0},.016,true); assert.equal(orbit.focus.y,9.5);
 orbit.focusObject={x:0,y:3,z:0}; orbit.update({x:0,y:8,z:0},.016,true); assert.equal(orbit.focus.y,3);
 orbit.conversation=false; orbit.focusObject={x:0,y:3,z:0}; orbit.update({x:0,y:8,z:0},.016,true); assert.equal(orbit.focus.y,3);
 orbit.focusObject=null; orbit.update({x:0,z:0},.016,true); assert.equal(orbit.focus.y,1.42); orbit.update({x:0,y:NaN,z:0},.016,true); assert(Number.isFinite(camera.position.y));
});
