import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SchoolNavigation} from '../../src/systems/school-navigation.js';
import {blocked} from '../../src/systems/physics.js';
import {findPath} from '../../src/systems/navigation.js';
import {NARRATIVE_POINTS,ACTOR_ROUTES,narrativeWaypoint,sameFloor} from '../../src/systems/school-narrative-map.js';
const layout=JSON.parse(fs.readFileSync('src/data/sao-jorge.json'));
test('all narrative approaches and NPC routes are reachable without moving the M2 furniture',()=>{
 const nav=new SchoolNavigation(layout);
 for(const p of [...Object.values(NARRATIVE_POINTS),...Object.values(ACTOR_ROUTES).flatMap(a=>[a.start,...a.route])]){
  const q=p.approach||p,obs=nav.movementObstacles(p.floor);
  assert(!blocked(q.x,q.z,obs),JSON.stringify(p));assert(findPath(nav.floor(p.floor).spawn,q,obs).length,JSON.stringify(p));
 }
});
test('cross-floor goals lead to the next real landing, never to an object through a ceiling',()=>{
 const nav=new SchoolNavigation(layout),p=NARRATIVE_POINTS.instrument;
 const w=narrativeWaypoint(nav,0,p);assert.equal(w.kind,'school-stair');assert.equal(w.destination,1);
 assert.equal(narrativeWaypoint(nav,1,p).destination,2);assert.equal(narrativeWaypoint(nav,2,p),p);
 assert.equal(sameFloor(p,0),false);assert.equal(sameFloor(p,2),true);
});

test('borrows the same actors and books, persists only local actor state and restores legacy transforms',async()=>{
 const THREE=await import('three'),{Resources}=await import('../../src/systems/resources.js');
 const {SchoolNarrative}=await import('../../src/systems/school-narrative.js');
 const resources=new Resources(),scene=new THREE.Scene(),legacy=new THREE.Group();scene.add(legacy);
 const mesh=resources.mesh('box','#123456',[.4,.1,.5]);mesh.position.set(20,1,-7);legacy.add(mesh);
 const book={id:'memory-1',kind:'memory-book',name:'Original',x:20,z:-7,height:1,mesh};
 const actor={definition:{id:'maria'},agent:{position:{x:5,z:5},rotation:0,index:0,path:[],definition:{route:[{x:5,z:5}]},timer:0},character:{root:new THREE.Group(),update(){}}};scene.add(actor.character.root);actor.character.root.position.set(5,.08,5);
 const nav=new SchoolNavigation(structuredClone(layout)),state={actors:{}},school={group:new THREE.Group(),navigation:nav,floor:0,active:true,inspect:false,getState:()=>state,legacy:{visibility:[[actor.character.root,true]]}};scene.add(school.group);
 const story={world:{objects:[book]},tracked:null},living={actors:[actor],campus:{objects:[]}},adventure={photo:null};
 const n=new SchoolNarrative({school,world:{resources,collectibles:[]},story,living,adventure,getProgress:()=>({collected:[],stage:2,campaign:{memories:[],steps:{}},living:{events:{}}})});
 n.enter();assert.equal(story.location,n);assert.equal(book.mesh,mesh);assert.equal(mesh.parent,n.group);assert.equal(book.floor,0);assert.equal(actor.agent.position.floor,0);assert.notEqual(actor.agent.position.x,5);
 assert.equal(n.bookObjects().length,1);n.capture();assert.equal(state.actors.maria.floor,0);
 n.leave();assert.equal(mesh.parent,legacy);assert.deepEqual(mesh.position.toArray(),[20,1,-7]);assert.equal(book.x,20);assert.equal(book.floor,undefined);assert.deepEqual(actor.agent.position,{x:5,z:5});assert.equal(story.location,null);assert.equal(actor.character.root.parent,scene);
 n.enter();n.leave();n.dispose();resources.dispose();
});

test('chapter visit cannot advance from matching X/Z on another floor',async()=>{
 const {Story}=await import('../../src/systems/story.js');const {freshCampaign}=await import('../../src/systems/quests.js');
 const c=freshCampaign(),point={floor:2,x:0,z:0},context={floor:0,visitPoint:()=>point,updateObjects(){}};
 const story={time:0,c,focus:null,world:{update(){}},living:{free:false,settings:{quality:'low'}},location:context,dialogue:{open:false},getProgress:()=>({stage:2,campaign:c}),changed(){},notify(){}};
 Story.prototype.update.call(story,.01,{x:0,z:0},true);assert.deepEqual(c.steps,{});
 context.floor=2;Story.prototype.update.call(story,.01,{x:0,z:0},true);assert.deepEqual(c.steps['chapter-1'],['visit']);
});

test('quiz has an unobstructed interaction ray beside the authored science equipment',async()=>{
 const {segmentHit}=await import('../../src/systems/physics.js');const p=NARRATIVE_POINTS.quiz,f=layout.floors[p.floor];
 const from={...p.approach,y:f.walkY+1.45},to={x:p.x,y:f.baseY+p.top+.16,z:p.z};assert.equal(f.colliders.some(b=>segmentHit(from,to,b,.015)!==null),false);
});

test('prologue pickups remain selectable beside optional activities',async()=>{
 const {InteractionRegistry}=await import('../../src/systems/interaction-registry.js'),{narrativePriority}=await import('../../src/systems/school-narrative-map.js');
 assert.equal(typeof narrativePriority,'function');const r=new InteractionRegistry({occluders:[]}),p=NARRATIVE_POINTS.card.approach;
 for(const[id,kind]of [['card','item'],['mem','game']])r.register({id,object:{...NARRATIVE_POINTS[id],kind,id},distance:2.2,priority:narrativePriority(kind)});
 assert.equal(r.nearest({...p,y:.03}).id,'card');
});

test('narrative prop anchors and all six books sit on authored furniture surfaces',async()=>{
 const {bookPoint}=await import('../../src/systems/school-narrative-map.js');
 const surfaces=layout.floors.map(f=>{
  const b=fs.readFileSync('public'+f.url),n=b.readUInt32LE(12),j=JSON.parse(b.subarray(20,20+n)),bin=b.subarray(28+n),primitive=j.meshes[j.nodes.find(n=>n.name==='furniture').mesh].primitives[0],a=j.accessors[primitive.attributes.POSITION],view=j.bufferViews[a.bufferView],boxes=[];
  for(let start=0;start<a.count;start+=36){const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(let v=start;v<start+36;v++)for(let k=0;k<3;k++){const q=bin.readFloatLE((view.byteOffset||0)+(a.byteOffset||0)+v*12+k*4);min[k]=Math.min(min[k],q);max[k]=Math.max(max[k],q);}boxes.push({min,max});}return boxes;
 });
 for(const p of [...Object.entries(NARRATIVE_POINTS).filter(([id])=>!['shelf-clue','shelf-puzzle'].includes(id)).map(([,p])=>p),...Array.from({length:6},(_,i)=>bookPoint(i))]){
  if(p.top===undefined||p.top<.1)continue;
  assert(surfaces[p.floor].some(b=>Math.abs(b.max[1]-p.top)<.005&&p.x>b.min[0]&&p.x<b.max[0]&&p.z>b.min[2]&&p.z<b.max[2]),`unsupported ${JSON.stringify(p)}`);
 }
});
