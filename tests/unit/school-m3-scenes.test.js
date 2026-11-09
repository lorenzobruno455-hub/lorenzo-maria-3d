import {test} from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import fs from 'node:fs';import {CutsceneManager} from '../../src/systems/cutscene-manager.js';import {SchoolNarrative} from '../../src/systems/school-narrative.js';import {SchoolNavigation} from '../../src/systems/school-navigation.js';
test('an explicit shot start target faces the actors immediately, including on an upper floor',()=>{
 const camera=new THREE.PerspectiveCamera(),old=camera.quaternion.clone(),manager=new CutsceneManager({camera});const from=[7.6,9.43,.8],target=new THREE.Vector3(6,8.43,0);
 manager.play({id:'upper-floor',shots:[{duration:1,camera:{from,to:[7.3,9.2,.8],lookFrom:target.toArray(),lookAt:target.toArray()}}]});
 const expected=target.clone().sub(camera.position).normalize();assert(camera.getWorldDirection(new THREE.Vector3()).dot(expected)>.999);manager.skip();assert(camera.quaternion.equals(old));
});
test('album replay of a remote-floor memory keeps its reading camera on the current floor',()=>{
 const layout=JSON.parse(fs.readFileSync('src/data/sao-jorge.json')),context={floor:0,school:{navigation:new SchoolNavigation(layout),player:{position:{x:0,z:14.5}}}};
 const origin=SchoolNarrative.prototype.memoryOrigin.call(context,'memory-4');assert.equal(origin.x,0);assert.equal(origin.z,14.5);assert(origin.height<2);
});
