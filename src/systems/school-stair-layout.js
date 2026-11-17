import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {decodeFurnitureBoxes} from './school-furniture.js';
const ranges={'sj-f2-02':[5.5,12],'sj-f2-03':[-8,-4.25],'sj-f2-04':[-4.25,-.5],'sj-f2-05':[-.5,5.5]};
export function alignStairRooms(layout){
 const floor=layout.floors[1];floor.originalRooms=structuredClone(floor.rooms);floor.rooms=floor.rooms.map(r=>{const z=ranges[r.id];return z?{...r,z1:z[0],z2:z[1],z:(z[0]+z[1])/2,door:{...r.door,z:(z[0]+z[1])/2}}:{...r};});
 floor.colliders=floor.colliders.flatMap(b=>b.kind==='wall'?keepWall(b):mapFurniture(b,floor));
 floor.colliders.push(...newWalls(floor.baseY,floor.rooms));return layout;
}
export function keepWall(b){
 const cx=(b.minX+b.maxX)/2,cz=(b.minZ+b.maxZ)/2;
 if(Math.abs(cx+2)<.2&&b.maxZ>-8&&b.minZ<12)return[{...b,maxZ:Math.min(b.maxZ,-8)},{...b,minZ:Math.max(b.minZ,12)}].filter(p=>p.maxZ-p.minZ>1e-5);
 if(b.minX< -2.1&&b.maxX> -10.8&&[-2,1.5,5].some(z=>Math.abs(cz-z)<.15))return[];
 return[b];
}
function mapFurniture(b,floor){const x=(b.minX+b.maxX)/2,z=(b.minZ+b.maxZ)/2,r=floor.originalRooms.find(r=>ranges[r.id]&&x>r.x1&&x<r.x2&&z>r.z1&&z<r.z2);if(!r)return[b];if(r.type==='stair')return[];const n=floor.rooms.find(n=>n.id===r.id),scale=(n.z2-n.z1)/(r.z2-r.z1);return[{...b,minZ:n.z1+(b.minZ-r.z1)*scale,maxZ:n.z1+(b.maxZ-r.z1)*scale}];}
export function newWalls(base,rooms){
 const out=[];const wall=(x1,x2,z1,z2,minY=0,maxY=3.05)=>out.push({minX:x1,maxX:x2,minZ:z1,maxZ:z2,minY:base+minY,maxY:base+maxY,kind:'wall'});
 for(const z of[-4.25,-.5,5.5])wall(-11,-2,z-.12,z+.12);
 for(const r of rooms.filter(r=>ranges[r.id])){const width=r.door?.width||1.5,d=r.z;wall(-2.12,-1.88,r.z1,d-width/2);wall(-2.12,-1.88,d+width/2,r.z2);wall(-2.12,-1.88,d-width/2,d+width/2,2.6);}
 return out;
}
export function refitStairRooms(model,floor){
 if(floor.index!==1)return{dispose(){}};const owned=[],restore=[];
 for(const name of['structure','furniture','floors']){
  const mesh=model.getObjectByName(name),boxes=decodeFurnitureBoxes(mesh);if(!boxes)throw Error('Geometria incompatível com reorganização das salas');const original=mesh.geometry,parts=[];
  const values=boxes.flatMap(b=>{const c={minX:b.min[0],maxX:b.max[0],minY:b.min[1],maxY:b.max[1],minZ:b.min[2],maxZ:b.max[2]};return name==='structure'?keepWall(c):mapFurniture(c,floor).map(p=>({...p,color:b.color}));});
  if(name==='structure')values.push(...newWalls(0,floor.rooms));
  for(const b of values){const g=new THREE.BoxGeometry(b.maxX-b.minX,b.maxY-b.minY,b.maxZ-b.minZ).toNonIndexed();g.deleteAttribute('uv');g.translate((b.minX+b.maxX)/2,(b.minY+b.maxY)/2,(b.minZ+b.maxZ)/2);const color=new THREE.Color(b.color||'#f4f4f1'),a=new Float32Array(g.attributes.position.count*3);for(let i=0;i<a.length;i+=3)a.set([color.r,color.g,color.b],i);g.setAttribute('color',new THREE.BufferAttribute(a,3));parts.push(g);}
  const g=mergeGeometries(parts,false);parts.forEach(p=>p.dispose());mesh.geometry=g;owned.push(g);restore.push(()=>mesh.geometry=original);
 }
 return{dispose(){restore.forEach(f=>f());owned.forEach(g=>g.dispose());}};
}
