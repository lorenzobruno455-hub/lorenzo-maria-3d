import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CutsceneManager } from '../../src/systems/cutscene-manager.js';

function setup(extra = {}) {
  const camera = new THREE.PerspectiveCamera(); camera.position.set(0,2,8);
  const actor = {root:new THREE.Group(), cutscenePose:'idle', requestAction() {}};
  const light = new THREE.PointLight('white',2), locks=[], finishes=[], errors=[];
  const manager = new CutsceneManager({camera,actors:{lorenzo:actor},light,onLock:v=>locks.push(v),onFinish:v=>finishes.push(v),onError:e=>errors.push(e),...extra});
  return {manager,camera,actor,light,locks,finishes,errors};
}
test('camera interpolates, pause freezes time, skip restores ownership exactly once',()=>{
  const {manager:m,camera,actor,light,locks,finishes}=setup();
  const rotation=camera.quaternion.clone();
  const prior={state:'observe',remaining:3};actor.requestedAction=prior;actor.requestAction=function(state,{duration}){this.requestedAction={state,remaining:duration};};
  m.play({id:'intro',shots:[{duration:2,camera:{to:[10,2,8],lookAt:[0,0,0]},actor:{id:'lorenzo',state:'wave',position:[3,0,0]},light:{intensity:5,color:'red'}}]});
  m.update(1); assert.equal(camera.position.x,5); assert.deepEqual(actor.cutscenePose,{state:'wave'});
  m.pause();m.update(20);assert.equal(camera.position.x,5);assert.equal(m.paused,true);
  m.resume();m.skip();m.skip();m.dispose();
  assert.equal(m.active,false);assert.deepEqual(camera.position.toArray(),[0,2,8]);assert(camera.quaternion.equals(rotation));
  assert.equal(light.intensity,2);assert.equal(light.color.getHex(),0xffffff);assert.equal(actor.cutscenePose,'idle');assert.equal(actor.root.position.x,0);assert.equal(actor.requestedAction,prior);
  assert.deepEqual(locks,[true,false]);assert.deepEqual(finishes,[{id:'intro',reason:'skipped'}]);
});
test('dialogue closed without done and missing actors recover; waits are bounded',()=>{
  const dialogue={open:false,start(lines,{done}){this.open=true;this.done=done;},close(){this.open=false;}};
  const {manager:m,finishes}=setup({dialogue});
  m.play({id:'closed',shots:[{duration:.1,actor:{id:'absent',state:'wave'},dialogue:{speaker:'Maria',text:'Oi',provenance:'creative-fiction'}}]});
  m.update(.2);assert.equal(m.active,true);dialogue.close();m.update(.1);assert.equal(m.active,false);
  m.play({id:'timeout',shots:[{duration:.1,dialogueTimeout:.2,dialogue:{speaker:'Maria',text:'Oi'}}]});
  m.update(.3);assert.equal(m.active,false);assert.equal(dialogue.open,false);assert.equal(finishes.length,2);
});
test('effect failure and disposal release locks and restore camera',()=>{
  const {manager:m,camera,errors,locks,finishes}=setup();
  m.play({id:'broken',shots:[{camera:{from:[4,4,4],to:[5,5,5]},effect(){throw Error('broken');}}]});
  assert.equal(m.active,false);assert.equal(errors.length,1);assert.deepEqual(camera.position.toArray(),[0,2,8]);
  m.play({id:'dispose',shots:[{duration:10}]});m.dispose();m.dispose();
  assert.deepEqual(locks,[true,false,true,false]);assert.deepEqual(finishes.map(x=>x.reason),['error','disposed']);assert.equal(m.play({shots:[]}),false);
});
test('reduced motion snaps and completion restores, replacing a scene cannot leak locks',()=>{
  const {manager:m,camera,locks,finishes}=setup({reducedMotion:()=>true});
  m.play({id:'a',shots:[{duration:1,camera:{to:[9,9,9]}}]});assert.equal(camera.position.x,9);
  m.play({id:'b',shots:[{duration:.1}]});m.update(.2);
  assert.deepEqual(camera.position.toArray(),[0,2,8]);assert.deepEqual(locks,[true,false,true,false]);assert.deepEqual(finishes.map(x=>x.reason),['replaced','complete']);
});
