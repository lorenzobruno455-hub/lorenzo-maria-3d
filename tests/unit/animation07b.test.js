import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {AnimationController} from '../../src/systems/animation-controller.js';
import {readFile} from 'node:fs/promises';
const names=['Idle','Walk','Run','Accelerate','Decelerate','Turn','Sit','Stand','Wave','Talk','Point','Pickup','OpenBook','React'];
function fixture(){const root=new THREE.Group();root.name='actor';return new AnimationController(root,names.map(n=>new THREE.AnimationClip(n,1,[new THREE.NumberKeyframeTrack('.rotation[x]',[0,1],[0,.1])])));}
test('mixer crossfades and synchronizes locomotion speed',()=>{const c=fixture();c.update(.1,{speed:2});assert.equal(c.state,'accelerate');c.update(.5,{speed:2});assert.equal(c.state,'walk');assert.equal(c.actions.walk.timeScale,2/2.2);assert(c.mixer.time>0);c.update(.1,{speed:0});assert.equal(c.state,'decelerate');c.dispose();});
test('bounded requested actions return to locomotion and unknown actions reject',()=>{const c=fixture();assert.equal(c.requestAction('OpenBook',{duration:.2}),true);c.update(.1);assert.equal(c.state,'openbook');c.update(.2);assert.equal(c.state,'idle');assert.equal(c.requestAction('missing'),false);c.dispose();});
for(const name of ['lorenzo','maria'])test(`${name} GLB includes all 0.7B authored clips`,async()=>{const b=await readFile(`public/models/aurora/${name}.glb`);const g=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));for(const n of names)assert(g.animations.some(a=>a.name===n),n);});
test('Character smooths host yaw updates and keeps converging after a single target change',async()=>{const {Character}=await import('../../src/systems/character.js'),{Resources}=await import('../../src/systems/resources.js');const r=new Resources(),c=new Character(r);c.root.rotation.y=Math.PI/2;c.update(.016);assert(c.root.rotation.y>0&&c.root.rotation.y<Math.PI/2);const first=c.root.rotation.y;for(let i=0;i<40;i++)c.update(.016);assert(c.root.rotation.y>first);assert(Math.abs(c.root.rotation.y-Math.PI/2)<.001);c.dispose();r.dispose();});
