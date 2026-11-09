import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
const path = 'src/data/sao-jorge.json';
const read = () => JSON.parse(fs.readFileSync(path));
const blocked = (floor,x,z,r=.4) => floor.colliders.some(c => c.minY < floor.walkY+1.6 && c.maxY > floor.walkY+.1 && x+r>c.minX && x-r<c.maxX && z+r>c.minZ && z-r<c.maxZ);
test('São Jorge: three prepared GLBs have normals, vertex colors and split layers',()=>{
 const data=read(); assert.equal(data.rise,3.6); assert.equal(data.floors.length,3);
 for(const f of data.floors){
  const b=fs.readFileSync(`public${f.url}`); assert.equal(b.toString('ascii',0,4),'glTF'); assert.equal(b.readUInt32LE(8),b.length);
  const g=JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12)));
  assert.deepEqual(g.nodes.map(n=>n.name).sort(),['floors','furniture','structure']); assert.ok(g.meshes.length<=12);
  for(const m of g.meshes) for(const p of m.primitives) for(const a of ['POSITION','NORMAL','COLOR_0']) assert.ok(Number.isInteger(p.attributes[a]));
  const original=fs.readFileSync(`references/sao-jorge-v08/modelos/${g.asset.extras.sourceFile}`);
  assert.equal(g.asset.extras.sourceSHA256,createHash('sha256').update(original).digest('hex'));
  assert.ok(g.asset.extras.sourceBoxes>0); assert.equal(g.asset.extras.vertexColorSpace,'linear');
 }
});
test('São Jorge: all room doors, stair landings and room interiors reachable by player radius .4',()=>{
 for(const f of read().floors){
  const step=.2, key=(x,z)=>`${Math.round(x/step)},${Math.round(z/step)}`;
  const seen=new Set(), queue=[[0,14.4]]; seen.add(key(0,14.4));
  for(let i=0;i<queue.length;i++){const [x,z]=queue[i];for(const [dx,dz] of [[step,0],[-step,0],[0,step],[0,-step]]){const nx=+(x+dx).toFixed(2),nz=+(z+dz).toFixed(2),k=key(nx,nz);if(Math.abs(nx)>10.7||Math.abs(nz)>18.7||seen.has(k)||blocked(f,nx,nz))continue; seen.add(k);queue.push([nx,nz]);}}
  for(const r of f.rooms){assert.ok(r.door.width>=1.4);assert.ok(!blocked(f,r.door.x,r.door.z),`${r.id} door blocked`);assert.ok(queue.some(([x,z])=>x>r.x1+.4&&x<r.x2-.4&&z>r.z1+.4&&z<r.z2-.4),`${r.id} unreachable`);}
  for(const s of f.stairs) assert.ok(queue.some(([x,z])=>Math.hypot(x-s.x,z-s.z)<.3),`${s.id} unreachable`);
 }
});
test('São Jorge: provenance, generic names, all croqui room types and only hall upstairs',()=>{
 const d=read();const types=new Set(d.floors.slice(0,2).flatMap(f=>f.rooms.map(r=>r.type)));
 for(const t of ['class','bath','stair','teachers','library','cinema','reception','secretaria','office','science','coord','lab']) assert.ok(types.has(t),t);
 for(const f of d.floors)for(const r of f.rooms){assert.ok(r.provenance);assert.doesNotMatch(r.name,/20\d/);}
 assert.deepEqual(d.floors[2].rooms.map(r=>r.type),['hall']);
});
