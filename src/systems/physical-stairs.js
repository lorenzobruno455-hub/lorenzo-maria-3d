import * as THREE from 'three';import{mergeGeometries}from'three/addons/utils/BufferGeometryUtils.js';import{decodeFurnitureBoxes}from'./school-furniture.js';
export const STAIR=Object.freeze({xFront:-3.5,xBack:-8.5,zA:1.3,zB:3.7,halfWidth:.6,rise:3.6,hole:{minX:-10.3,maxX:-3.6,minZ:.6,maxZ:4.4}});
export const walkY=f=>.03+3.6*f;export const floorAt=y=>Math.max(0,Math.min(2,Math.round((y-.03)/3.6)));
export function stairSurface(i,p){
 const b=walkY(i);
 if(p.x>=-8.5&&p.x<=-3.5&&Math.abs(p.z-1.3)<=.6)return b+(-3.5-p.x)/5*1.8;
 if(p.x>=-10.2&&p.x<=-8.5&&p.z>=.7&&p.z<=4.3)return b+1.8;
 if(p.x>=-8.5&&p.x<=-3.5&&Math.abs(p.z-3.7)<=.6)return b+1.8+(p.x+8.5)/5*1.8;
 return null;
}
export function stairAt(p,tolerance=.15){return[0,1].find(i=>{const y=stairSurface(i,p);return y!==null&&Math.abs(y-p.y)<tolerance;})??null;}
export const inHole=p=>p.x>STAIR.hole.minX&&p.x<STAIR.hole.maxX&&p.z>STAIR.hole.minZ&&p.z<STAIR.hole.maxZ;
export function splitOpening(b,h=STAIR.hole){if(b.maxX<=h.minX||b.minX>=h.maxX||b.maxZ<=h.minZ||b.minZ>=h.maxZ)return[b];const a=Math.max(b.minX,h.minX),c=Math.min(b.maxX,h.maxX),d=Math.max(b.minZ,h.minZ),e=Math.min(b.maxZ,h.maxZ);return[{...b,maxX:a},{...b,minX:c},{...b,minX:a,maxX:c,maxZ:d},{...b,minX:a,maxX:c,minZ:e}].filter(p=>p.maxX-p.minX>1e-5&&p.maxZ-p.minZ>1e-5);}
export function stairBarriers(f){return[{...STAIR.hole,kind:'stair-reservation',minY:walkY(f),maxY:walkY(f)+1}];}
export function moveOnSurfaces(position,delta,{obstacles,move,inside=()=>true,ready=()=>true}){
 const before={...position},steps=Math.max(1,Math.ceil(Math.hypot(delta.x,delta.z)/.07));
 for(let i=0;i<steps;i++){const old={...position},p={x:old.x,y:old.y,z:old.z};move(p,{x:delta.x/steps,z:delta.z/steps},obstacles(old));if(!inside(p)){Object.assign(position,p);continue;}let y=null;
  for(const f of[0,1]){const h=stairSurface(f,p);if(h!==null&&Math.abs(h-old.y)<.13&&ready(f+1,h)){y=h;break;}}
  if(y===null&&Math.abs(old.y-walkY(floorAt(old.y)))<.13&&!(floorAt(old.y)>0&&inHole(p)))y=walkY(floorAt(old.y));
  if(y!==null)Object.assign(position,{x:p.x,y,z:p.z});
 }return Math.hypot(position.x-before.x,position.y-before.y,position.z-before.z);
}
export function replaceBoxes(mesh,boxes){const original=mesh.geometry,parts=[];for(const b of boxes){const g=new THREE.BoxGeometry(b.maxX-b.minX,b.maxY-b.minY,b.maxZ-b.minZ).toNonIndexed();g.deleteAttribute('uv');g.translate((b.minX+b.maxX)/2,(b.minY+b.maxY)/2,(b.minZ+b.maxZ)/2);const a=new Float32Array(g.attributes.position.count*3),c=b.rgb||[.9,.9,.9];for(let i=0;i<a.length;i+=3)a.set(c,i);g.setAttribute('color',new THREE.BufferAttribute(a,3));parts.push(g);}const geometry=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());mesh.geometry=geometry;return{dispose(){mesh.geometry=original;geometry.dispose();}};}
export function cutStairOpening(model,index){if(index===0)return{dispose(){}};const mesh=model.getObjectByName('floors'),source=decodeFurnitureBoxes(mesh);if(!source)throw Error('Piso incompatível com abertura');const c=mesh.geometry.attributes.color;return replaceBoxes(mesh,source.flatMap((b,i)=>splitOpening({minX:b.min[0],maxX:b.max[0],minY:b.min[1],maxY:b.max[1],minZ:b.min[2],maxZ:b.max[2],rgb:[c.getX(i*36),c.getY(i*36),c.getZ(i*36)]})));}
export function createPhysicalStairs(resources){
 const group=new THREE.Group(),owned=[],colliders=[],batches=new Map();group.name='Escadas internas físicas 0.9.2';
 const box=(color,x,y,z,w,h,d,rz=0)=>{const g=new THREE.BoxGeometry(w,h,d);g.rotateZ(rz);g.translate(x,y,z);if(!batches.has(color))batches.set(color,[]);batches.get(color).push(g);};
 const rail=(x1,z1,y1,x2,z2,y2)=>{
  const length=Math.hypot(x2-x1,z2-z1,y2-y1),geo=new THREE.BoxGeometry(length,.07,.07),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1,0,0),new THREE.Vector3(x2-x1,y2-y1,z2-z1).normalize());geo.applyQuaternion(q);geo.translate((x1+x2)/2,(y1+y2)/2+1,(z1+z2)/2);if(!batches.has('#FFDA31'))batches.set('#FFDA31',[]);batches.get('#FFDA31').push(geo);
  const n=Math.ceil(length/.5);for(let i=0;i<n;i++){const t=(i+.5)/n,x=x1+(x2-x1)*t,z=z1+(z2-z1)*t,y=y1+(y2-y1)*t;colliders.push({minX:x-.055-Math.abs(x2-x1)/n/2,maxX:x+.055+Math.abs(x2-x1)/n/2,minZ:z-.055-Math.abs(z2-z1)/n/2,maxZ:z+.055+Math.abs(z2-z1)/n/2,minY:y-.2,maxY:y+1.08,kind:'stair-guard'});}
 };
 for(let f=0;f<2;f++){
  const b=walkY(f);for(let i=0;i<10;i++)for(const flight of[0,1]){const x=flight===0?-3.5-(i+.5)*.5:-8.5+(i+.5)*.5,y=b+flight*1.8+(i+1)*.18,z=flight?3.7:1.3;box('#69717D',x,y-.1,z,.5,.2,1.2);box('#141824',x+(flight?-.24:.24),y-.17,z,.025,.03,1.2);}
  box('#69717D',-9.35,b+1.7,2.5,1.7,.2,3.6);
  for(const side of[-1,1])for(const flight of[0,1]){const za=(flight?3.7:1.3)+side*.68,xa=flight?-8.5:-3.5,xb=flight?-3.5:-8.5,ya=b+flight*1.8,yb=ya+1.8;rail(xa,za,ya,xb,za,yb);for(let j=0;j<=5;j++)box('#141824',xa+(xb-xa)*j/5,ya+(yb-ya)*j/5+.5,za,.055,1,.055);}
  rail(-10.25,.62,b+1.8,-10.25,4.38,b+1.8);rail(-10.25,.62,b+1.8,-8.5,.62,b+1.8);rail(-10.25,4.38,b+1.8,-8.5,4.38,b+1.8);
  // Protect the upper opening; both flights join the intact front landing.
  for(const z of[.55,4.45])rail(-10.3,z,walkY(f+1),-3.5,z,walkY(f+1));rail(-10.3,.55,walkY(f+1),-10.3,4.45,walkY(f+1));
 }
 for(const[color,parts]of batches){const geometry=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());owned.push(geometry);const mesh=new THREE.Mesh(geometry,resources.material(color));mesh.castShadow=false;mesh.receiveShadow=true;group.add(mesh);}
 return{group,colliders,dispose(){group.removeFromParent();owned.forEach(g=>g.dispose());}};
}
