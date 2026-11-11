import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Resources} from '../../src/systems/resources.js';
import {createSchoolExterior,EXTERIOR_PROPOSAL} from '../../src/systems/school-exterior.js';

test('confirmed exterior shares navigation ownership and preserves original world/navigation ownership',()=>{
 const resources=new Resources(),scene=new THREE.Scene(),solids=[{id:'original'}],world={resources,solids},before=JSON.stringify(solids);
 const exterior=createSchoolExterior({scene,world});assert.equal(EXTERIOR_PROPOSAL.approved,true);assert.equal(JSON.stringify(solids),before);
 assert.ok(exterior.group.getObjectByName('São Jorge annex'));assert.ok(exterior.state().windows>0);assert.equal(exterior.state().floors,3);
 let disposed=0;resources.geometry('box').addEventListener('dispose',()=>disposed++);exterior.dispose();exterior.dispose();assert.equal(disposed,0);assert.equal(scene.children.length,0);resources.dispose();
});

test('photo facade keeps observed bands/name and does not create an invented crest or yellow structure',()=>{
 const resources=new Resources(),scene=new THREE.Scene(),exterior=createSchoolExterior({scene,world:{resources,solids:[]}}),s=exterior.state();
 assert.equal(s.label,'COLÉGIO SÃO JORGE');assert.deepEqual(s.bands,['blue-middle','pink-upper']);assert.equal(s.fixedInteriorChanges,0);assert.equal(s.structuralYellowBeams,0);assert.equal(s.proposal.gates.length,3);assert.equal(s.proposal.court.maxZ,-19);assert.equal(s.proposal.corridorDoor.z,-19);
 exterior.dispose();resources.dispose();
});
