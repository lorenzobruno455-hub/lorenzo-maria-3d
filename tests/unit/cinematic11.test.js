import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PerspectiveCamera,Group,Vector3} from 'three';
import {CutsceneManager} from '../../src/systems/cutscene-manager.js';
import {protectCinematicCamera,buildCinematicScene,CINEMATIC_DIRECTIONS} from '../../src/systems/cinematic-direction.js';
const setup=()=>{
 const listeners=new Set(),dialogue={open:false,listen(fn){listeners.add(fn);return()=>listeners.delete(fn);},start(lines,{done}){this.open=true;this.done=done;this.lines=lines;this.line(0);},line(i){for(const fn of listeners)fn(this.lines[i],i);},close(){this.open=false;}};
 const actor={root:new Group()},camera=new PerspectiveCamera(),events=[];
 const m=new CutsceneManager({camera,actors:{lorenzo:actor},dialogue,onFinish:e=>events.push(e)});return {m,actor,camera,dialogue,listeners,events};
};
test('declarative line beats update poses, pause blocks beats and interruption releases ownership',()=>{
 const {m,actor,dialogue,listeners,events}=setup();
 m.play({id:'directed',shots:[{duration:.05,waitForDialogue:true,interruptOnClose:true,dialogue:[{text:'a'},{text:'b'}],beats:[{line:0,actors:[{id:'lorenzo',state:'observe'}]},{line:1,actors:[{id:'lorenzo',state:'react'}]}]}]});
 assert.equal(actor.cutscenePose.state,'observe');m.pause();dialogue.line(1);assert.equal(actor.cutscenePose.state,'observe');m.resume();dialogue.line(1);assert.equal(actor.cutscenePose.state,'react');
 dialogue.close();m.update(.1);assert.equal(m.active,false);assert.equal(events[0].reason,'interrupted');assert.equal(listeners.size,0);assert.equal(actor.cutscenePose,undefined);
});
test('camera protection checks target sightline and previous position, including ceilings',()=>{
 const wall={minX:-1,maxX:1,minY:0,maxY:3,minZ:2,maxZ:2.4};
 const result=protectCinematicCamera(new Vector3(0,1,0),new Vector3(0,1,6),new Vector3(0,1,1),[wall]);assert(result.z<2);
 const ceiling={minX:-10,maxX:10,minY:2.5,maxY:3,minZ:-10,maxZ:10};
 assert(protectCinematicCamera(new Vector3(0,1,0),new Vector3(0,5,1),new Vector3(0,1,0),[ceiling]).y<2.5);
});
test('six directions preserve lines, positions and use nearby actors only',()=>{
 assert.equal(new Set(Object.values(CINEMATIC_DIRECTIONS).map(x=>x.label)).size,6);
 const lorenzo={root:new Group()},maria={root:new Group()};maria.root.position.set(100,0,0);
 const lines=[{speakerId:'lorenzo',text:'a'},{speakerId:'maria',text:'Pode ser.'}];
 const scene=buildCinematicScene('CAP01-CENA09',lines,{camera:new PerspectiveCamera(),actors:{lorenzo,maria},point:{x:0,y:0,z:0},toLocal:p=>p,obstacles:()=>[]});
 assert.deepEqual(scene.shots.flatMap(s=>s.dialogue||[]),lines);assert(scene.shots.flatMap(s=>s.beats||[]).every(b=>!(b.actors||[]).some(a=>a.id==='maria')));assert.equal(maria.root.position.x,100);
});

test('normal reader completion advances once; replaced or skipped scenes remove beat listeners',()=>{
 const {m,dialogue,listeners,events}=setup();
 const shot={duration:.05,interruptOnClose:true,waitForDialogue:true,dialogue:[{text:'a'}],beats:[{line:0}]};
 m.play({id:'read',shots:[shot]});dialogue.done();dialogue.close();m.update(.2);assert.equal(events[0].reason,'complete');assert.equal(listeners.size,0);
 m.play({id:'first',shots:[shot]});m.play({id:'second',shots:[shot]});assert.equal(listeners.size,1);m.skip();assert.equal(listeners.size,0);assert.deepEqual(events.map(e=>e.reason),['complete','replaced','skipped']);
});

test('head gaze stays bounded on the authored rig and releases after a scene',async()=>{
 const {Character}=await import('../../src/systems/character.js'),{Resources}=await import('../../src/systems/resources.js');
 const resources=new Resources(),actor=new Character(resources),head=new Group();head.name='head';const custom=new Group();custom.add(head);actor.root.add(custom);actor.custom=custom;actor.gazeJoint=head;
 actor.controller={update(){head.quaternion.identity();},actions:{},dispose(){}};
 actor.gazeTarget=new Vector3(100,10,1);
 for(let i=0;i<100;i++)actor.update(.016);
 assert(actor.gazeYaw<=.55);assert(actor.gazePitch>=-.25);assert(Math.abs(head.rotation.y)<.6);
 actor.gazeTarget=null;for(let i=0;i<160;i++)actor.update(.016);
 assert(Math.abs(head.rotation.y)<.001);actor.dispose();resources.dispose();
});

test('nearby Maria gets the acceptance reaction without changing either actor position',()=>{
 const lorenzo={root:new Group()},maria={root:new Group()};maria.root.position.set(1.5,0,0);
 const lines=Array.from({length:9},(_,i)=>({speakerId:i===7?'maria':'lorenzo',text:String(i)}));
 const scene=buildCinematicScene('CAP01-CENA09',lines,{camera:new PerspectiveCamera(),actors:{lorenzo,maria},point:{x:0,y:0,z:0}});
 const beat=scene.shots[1].beats[7];assert.equal(beat.actors.find(a=>a.id==='maria').state,'react');assert.deepEqual(maria.root.position.toArray(),[1.5,0,0]);assert(beat.actors.every(a=>!a.position));
});

test('idle characters do not allocate or apply gaze work before any cinematic look target',async()=>{
 const {Character}=await import('../../src/systems/character.js'),{Resources}=await import('../../src/systems/resources.js');const r=new Resources(),actor=new Character(r);actor.update(.016);assert.equal(actor.gazeRotation,undefined);actor.dispose();r.dispose();
});
