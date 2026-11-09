import {test} from 'node:test';import assert from 'node:assert/strict';
import {validateSchoolVisit} from '../../src/systems/school-progress.js';
import {validateCampaign} from '../../src/systems/quests.js';
import {freshProgress,saveProgress,loadSave,SAVE_KEY} from '../../src/systems/progress.js';
test('M3 local actor state survives save/reload without replacing legacy position or campaign',()=>{
 const p=freshProgress();p.position={x:12,z:20};p.schoolVisit.active=true;p.schoolVisit.actors={bia:{floor:0,x:-4,z:-14,index:1,rotation:.8}};
 const m=new Map(),storage={getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)};assert(saveProgress(storage,p,{}));const loaded=loadSave(storage).progress;
 assert.deepEqual(loaded.position,p.position);assert.deepEqual(loaded.campaign,validateCampaign(p.campaign));assert.equal(loaded.schoolVisit.actors.bia.index,1);assert.equal(loaded.schoolVisit.actors.bia.x,-4);assert(m.has(SAVE_KEY));
});
test('invalid M3 actor coordinates and unknown actors are discarded; M1/M2 saves keep defaults',()=>{
 assert.deepEqual(validateSchoolVisit({}).actors,{});
 const p=validateSchoolVisit({actors:{unknown:{floor:0,x:0,z:0},bia:{floor:5,x:0,z:0},maria:{floor:0,x:Infinity,z:0},davi:{floor:2,x:6,z:0,index:-9,rotation:NaN}}});
 assert.deepEqual(Object.keys(p.actors),['davi']);assert.equal(p.actors.davi.index,0);assert.equal(p.actors.davi.rotation,0);
});
