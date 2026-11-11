import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Contact art reads existing supports; it never adds collision or interaction targets.
export function contactPatches(floor){
 const seen=new Set(),patches=[];
 for(const b of floor.colliders){
  if(!['furniture','furniture-detail','living-furniture'].includes(b.kind)||b.minY>floor.walkY+.06||b.maxY<floor.walkY+.18)continue;
  const w=b.maxX-b.minX,d=b.maxZ-b.minZ;if(w<=.015||d<=.015)continue;
  const key=[b.minX,b.maxX,b.minZ,b.maxZ].map(x=>x.toFixed(3)).join(':');if(seen.has(key))continue;seen.add(key);
  const minX=Math.max(-10.84,b.minX-.06),maxX=Math.min(10.84,b.maxX+.06),minZ=Math.max(-18.84,b.minZ-.06),maxZ=Math.min(18.84,b.maxZ+.06);
  if(minX>=maxX||minZ>=maxZ)continue;
  patches.push({x:(minX+maxX)/2,z:(minZ+maxZ)/2,y:floor.walkY+.004,width:maxX-minX,depth:maxZ-minZ});
 }return patches;
}

export function createSchoolComicDepth({school}){
 const material=new THREE.MeshBasicMaterial({color:'#171126',transparent:true,opacity:.30,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,toneMapped:false});
 const installed=new Map();let disposed=false;
 return{update(){
  if(disposed)return;
  for(const[index,lease]of school.leases){
   if(installed.has(index))continue;
   const floor=school.navigation.floor(index),patches=contactPatches(floor),parts=patches.map(p=>{
    const geometry=new THREE.PlaneGeometry(p.width,p.depth);geometry.rotateX(-Math.PI/2);geometry.translate(p.x,p.y-floor.baseY,p.z);return geometry;
   });
   const geometry=parts.length?mergeGeometries(parts,false):new THREE.BufferGeometry();parts.forEach(g=>g.dispose());
   const mesh=new THREE.Mesh(geometry,material);mesh.name='Comic school ground contacts';mesh.castShadow=mesh.receiveShadow=false;mesh.raycast=()=>{};lease.model.add(mesh);installed.set(index,{mesh,count:patches.length});
  }
 },state(){return{contactFloors:installed.size,contactPatches:[...installed.values()].reduce((n,x)=>n+x.count,0)};},dispose(){if(disposed)return;disposed=true;for(const{mesh}of installed.values()){mesh.removeFromParent();mesh.geometry.dispose();}installed.clear();material.dispose();}};
}
