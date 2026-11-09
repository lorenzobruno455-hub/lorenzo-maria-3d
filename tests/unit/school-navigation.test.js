import test from 'node:test';
import assert from 'node:assert/strict';
import { SchoolNavigation } from '../../src/systems/school-navigation.js';
const layout = { rise:3.6, floors:[0,1,2].map(index=>({ index,baseY:index*3.6,walkY:index*3.6+.03,spawn:{x:0,z:14.5},rooms:[{id:'room',x1:-10,x2:-2,z1:8,z2:18}],colliders:index===1?[{minX:-.1,maxX:.1,minZ:-8,maxZ:8,minY:3.6,maxY:7,kind:'wall'}]:[],stairs:index===0?[{id:'up',x:-6.5,z:2.5,destination:1,spawn:{x:-6.5,z:-5}}]:index===1?[{id:'down',x:-6.5,z:-5,destination:0,spawn:{x:-6.5,z:2.5}},{id:'up',x:-6.5,z:2.5,destination:2,spawn:{x:-6.5,z:-14}}]:[{id:'down',x:-6.5,z:-14,destination:1,spawn:{x:-6.5,z:2.5}}]})) };
test('invalid floor and nonfinite save recover to safe floor spawn',()=>{const nav=new SchoolNavigation(layout);assert.equal(nav.floor(99).index,0);assert.deepEqual(nav.resolve(99,{x:NaN,z:Infinity}),{floor:0,x:0,y:.03,z:14.5});assert.ok(nav.resolve(0,{x:90,z:90}).x<=10.955);});
test('only active floor blocks movement; thin walls cannot tunnel and diagonal slides',()=>{const nav=new SchoolNavigation(layout),p={x:-2,y:0,z:0};nav.move(p,{x:4,z:0},0);assert.ok(p.x>1.9);p.x=-2;const distance=nav.move(p,{x:4,z:2},1);assert.ok(p.x<-.4);assert.ok(p.z>1.9);assert.ok(distance>0);assert.equal(p.y,3.63);});
test('perimeter contains player even through open exterior doors',()=>{const nav=new SchoolNavigation(layout),p={x:10,z:18};nav.move(p,{x:10,z:10},0);assert.ok(p.x<=10.955);assert.ok(p.z<=18.955);});
test('colliding spawn is repaired and camera has current floor ceiling and floor',()=>{const nav=new SchoolNavigation(layout),p=nav.resolve(1,{x:0,z:0});assert.ok(Math.abs(p.x)>=.42);assert.ok(nav.obstacles(1).some(b=>b.kind==='ceiling'&&b.minY===7));assert.ok(nav.obstacles(1).some(b=>b.kind==='floor'));assert.equal(nav.obstacles(0).filter(b=>b.kind==='wall').length,0);});
test('stairs require matching nearby landing and round trip through three floors',()=>{const nav=new SchoolNavigation(layout);assert.equal(nav.transition(0,'up',{x:0,z:0}),null);assert.equal(nav.transition(0,'missing',{x:-6.5,z:2.5}),null);let p=nav.transition(0,'up',{x:-6.5,z:2.5});assert.equal(p.floor,1);p=nav.transition(1,'down',p);assert.equal(p.floor,0);p=nav.transition(1,'up',{x:-6.5,z:2.5});assert.equal(p.floor,2);assert.equal(nav.transition(2,'down',p).floor,1);assert.equal(nav.targets(0,{x:0,z:0}).length,0);assert.equal(nav.targets(0,{x:-6.5,z:2.5}).length,1);});
test('room lookup respects active floor and bounds',()=>{const nav=new SchoolNavigation(layout);assert.equal(nav.roomAt(0,{x:-5,z:12}).id,'room');assert.equal(nav.roomAt(0,{x:0,z:0}),null);});
test('door lintels affect camera but allow walking underneath',()=>{const local=structuredClone(layout);local.floors[0].colliders.push({minX:-.1,maxX:.1,minZ:-8,maxZ:8,minY:2.6,maxY:3.05,kind:'wall'});const nav=new SchoolNavigation(local),p={x:-2,z:0};nav.move(p,{x:4,z:0},0);assert.ok(p.x>1.9);assert.ok(nav.obstacles(0).some(b=>b.minY===2.6));});

test('all real-layout rooms and stair landings are reachable from their floor corridor',async()=>{
  const {readFile}=await import('node:fs/promises');
  const {findPath}=await import('../../src/systems/navigation.js');
  const real=JSON.parse(await readFile(new URL('../../src/data/sao-jorge.json',import.meta.url),'utf8'));
  const nav=new SchoolNavigation(real);
  for(const floor of real.floors){
    const obstacles=nav.movementObstacles(floor.index);
    for(const room of floor.rooms){
      const target={x:(room.x1+room.x2)/2,z:(room.z1+room.z2)/2};
      assert.ok(findPath(floor.spawn,target,obstacles).length,`Unreachable ${room.id}`);
    }
    for(const stair of floor.stairs){
      assert.ok(findPath(floor.spawn,stair,obstacles).length,`Unreachable ${stair.id}`);
      const arrival=nav.transition(floor.index,stair.id,stair);
      assert.equal(arrival.floor,stair.destination);
      assert.ok(Math.hypot(arrival.x-stair.spawn.x,arrival.z-stair.spawn.z)<2.5,'Arrival remains at landing');
    }
  }
});
