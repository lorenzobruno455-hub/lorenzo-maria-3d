import {test} from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {SchoolNarrative} from '../../src/systems/school-narrative.js';
import {ACTOR_ROUTES} from '../../src/systems/school-narrative-map.js';
import {RoutineAgent} from '../../src/systems/npcs.js';

test('school actor presentation respects floor, inspection, distance and shadow preset',async()=>{
 const {schoolActorPresentation:view}=await import('../../src/systems/school-presentation.js');
 assert.deepEqual(view({id:'bia',floor:0,currentFloor:0,distance:28,quality:'low'}),{visible:false,castShadow:false});
 assert.deepEqual(view({id:'bia',floor:0,currentFloor:0,distance:8,quality:'medium'}),{visible:true,castShadow:false});
 assert.deepEqual(view({id:'bia',floor:0,currentFloor:0,distance:8,quality:'high'}),{visible:true,castShadow:true});
 assert.equal(view({id:'maria',floor:0,currentFloor:1,distance:1,quality:'high'}).visible,false);
 assert.equal(view({id:'maria',floor:0,currentFloor:0,distance:1,quality:'high',inspection:true}).visible,false);
});

test('distant school NPCs retain their routine but skip animation and share one quest/navigation query',()=>{
 let queries=0,obstacleQueries=0;const actors=['maria','bia','lia'].map(id=>{const route=ACTOR_ROUTES[id],root=new THREE.Group(),mesh=new THREE.Mesh();root.add(mesh);mesh.castShadow=true;return{definition:{id,name:id},agent:new RoutineAgent({id,start:route.start,route:route.route}),character:{root,body:root,updates:0,update(){this.updates++;}}};});
 const n=Object.create(SchoolNarrative.prototype);Object.assign(n,{active:true,school:{floor:0,quality:'low',player:{position:{x:0,y:.03,z:14.5}},navigation:{floor:()=>({walkY:.03}),movementObstacles(){obstacleQueries++;return[];}}},actorSnapshots:actors.map(actor=>({actor})),living:{actors,lastStepSound:0},getProgress:()=>({stage:2,campaign:{memories:[1,2,3,4,5,6]},living:{events:{}}}),adventure:{get current(){queries++;return null;},cutscenes:{active:false}}});
 n.updateActors(.01,{});assert.equal(actors[0].character.root.visible,true);assert.equal(actors[1].character.root.visible,false);assert.equal(actors[1].character.updates,0);assert(actors[1].agent.timer>0,'hidden actor still advances its local routine clock');assert(queries<=1);assert(obstacleQueries<=1);
 n.school.quality='high';n.updateActors(0,{});assert.equal(actors[1].character.root.visible,true);assert.equal(actors[1].character.root.children[0].castShadow,false);assert.equal(actors[0].character.root.children[0].castShadow,true);
 const loaded=new THREE.Group(),part=new THREE.Mesh();part.castShadow=true;loaded.add(part);actors[1].character.root.add(loaded);actors[1].character.custom=loaded;n.school.quality='medium';n.updateActors(0,{});assert.equal(part.castShadow,false,'late GLB load must inherit the current shadow budget');
 n.school.player.position.x=-3.1;n.school.player.position.z=-14;n.living.speakingId='bia';n.updateActors(.1,{dialogueOpen:true,speaker:'bia'});assert(Number.isFinite(actors[1].agent.rotation));assert(Number.isFinite(actors[1].character.root.rotation.y));
});

test('prop visibility uses one coherent quest state per update',()=>{
 let queries=0;const lost={id:'lost-book',floor:0,mesh:new THREE.Group()},score={id:'familiar-music',floor:2,mesh:new THREE.Group()};
 const n=Object.create(SchoolNarrative.prototype);Object.assign(n,{active:true,school:{floor:0},borrowed:[lost,score].map(object=>({object})),world:{collectibles:[]},living:{campus:{objects:[lost,score]}},getProgress:()=>({stage:2,collected:[],campaign:{memories:[]},living:{events:{}}}),adventure:{get current(){queries++;return{id:'lost-book',node:2};}}});
 n.updateObjects();assert.equal(lost.mesh.visible,true);assert.equal(score.mesh.visible,false);assert.equal(queries,1);
});
