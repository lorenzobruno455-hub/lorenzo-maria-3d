import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createActorContacts,actorContactHeight} from '../../src/systems/actor-contacts.js';
import {validateSettings} from '../../src/systems/progress.js';

test('contact follows physical floors, suppresses stairs, unsupported actors and off-campus school coordinates',()=>{
 const ground=()=>.025;
 assert.equal(actorContactHeight({x:0,y:.025,z:15},Math.PI,ground),.029);
 assert.ok(Math.abs(actorContactHeight({x:54,y:3.63,z:15},Math.PI,ground)-3.634)<1e-9);
 assert.equal(actorContactHeight({x:65,y:.57,z:-1.3},Math.PI,ground),null);
 assert.equal(actorContactHeight({x:54,y:5,z:15},Math.PI,ground),null);
 assert.equal(actorContactHeight({x:0,y:0,z:0},Math.PI,()=>undefined),.004);
});
test('one bounded contact batch borrows actors without mutating pose and disposes only its resources',()=>{
 const scene=new THREE.Scene(),actors=Array.from({length:7},()=>{const a=new THREE.Group();a.position.set(0,.025,15);scene.add(a);return a;});
 const original=actors.map(a=>a.position.clone()),contacts=createActorContacts({scene,actors,groundHeight:()=>.025,schoolRotation:()=>Math.PI});
 contacts.update(actors[0].position,'low');assert.equal(contacts.mesh.count,7);assert.equal(contacts.mesh.geometry.index.count/3,16);assert.equal(contacts.mesh.castShadow,false);
 actors[3].visible=false;contacts.update(actors[0].position,'low');assert.equal(contacts.mesh.count,6);
 actors.forEach((a,i)=>assert.ok(a.position.equals(original[i])));
 let geometry=0,material=0,instances=0;contacts.mesh.addEventListener('dispose',()=>instances++);contacts.mesh.geometry.addEventListener('dispose',()=>geometry++);contacts.mesh.material.addEventListener('dispose',()=>material++);contacts.dispose();contacts.dispose();assert.equal(geometry,1);assert.equal(material,1);assert.equal(instances,1);assert.ok(actors.every(a=>a.parent===scene));
});
test('accessibility visual preferences are optional, validated and preserve legacy defaults',()=>{
 assert.equal(validateSettings({}).reducedMotion,false);assert.equal(validateSettings({}).visualEffects,true);
 const s=validateSettings({reducedMotion:true,visualEffects:false});assert.equal(s.reducedMotion,true);assert.equal(s.visualEffects,false);
 assert.equal(validateSettings({reducedMotion:'yes',visualEffects:0}).visualEffects,true);
});
test('visual preference listeners save once and are removed when preferences are disposed',async()=>{
 const {installPreferences}=await import('../../src/systems/preferences.js');
 const ids=['controls-size','controls-opacity','music-volume','effects-volume','reduced-motion','visual-effects'],elements=Object.fromEntries(ids.map(id=>[id,new EventTarget()])),classes=new Set();
 const previous=globalThis.document;globalThis.document={body:{classList:{toggle(k,on){on?classes.add(k):classes.delete(k);}}},documentElement:{style:{setProperty(){}}},getElementById:id=>elements[id],querySelector:()=>({})};
 try{const settings=validateSettings({});let saved=0;const apply=installPreferences(settings,()=>saved++,{clear(){}});elements['reduced-motion'].checked=true;elements['reduced-motion'].dispatchEvent(new Event('change'));assert.equal(saved,1);assert.equal(settings.reducedMotion,true);assert.ok(classes.has('reduce-motion'));apply.dispose();elements['reduced-motion'].dispatchEvent(new Event('change'));assert.equal(saved,1);}finally{globalThis.document=previous;}
});
test('contacts remain in world coordinates when the actor is parented to a rotated upper-floor school',()=>{
 const scene=new THREE.Scene(),school=new THREE.Group(),actor=new THREE.Group();school.position.x=60;school.rotation.y=Math.PI;actor.position.set(6,3.63,-15);school.add(actor);scene.add(school);
 const contacts=createActorContacts({scene,actors:[actor],groundHeight:()=>0,schoolRotation:()=>Math.PI});contacts.update(actor.getWorldPosition(new THREE.Vector3()),'low');assert.equal(contacts.mesh.count,1);
 const m=new THREE.Matrix4(),p=new THREE.Vector3();contacts.mesh.getMatrixAt(0,m);p.setFromMatrixPosition(m);assert.ok(Math.abs(p.x-54)<1e-5);assert.ok(Math.abs(p.z-15)<1e-5);assert.ok(Math.abs(p.y-3.634)<1e-5);assert.equal(contacts.mesh.parent,scene);assert.equal(actor.parent,school);contacts.dispose();
});
test('court contacts sit on the visible blue floor and apron, above the walk collision height',()=>{
 assert.ok(Math.abs(actorContactHeight({x:60,y:.03,z:-27},Math.PI,()=>.03)-.070)<1e-9);
 assert.ok(Math.abs(actorContactHeight({x:69.5,y:.03,z:-27},Math.PI,()=>.03)-.059)<1e-9);
});
