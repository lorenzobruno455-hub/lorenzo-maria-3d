import * as THREE from 'three';
import {batchMeshes} from './batching.js';
import {decodeFurnitureBoxes} from './school-furniture.js';
import {NARRATIVE_POINTS,bookPoint} from './school-narrative-map.js';

const overlaps=(a,b)=>a.minX<b.maxX-.001&&a.maxX>b.minX+.001&&a.minZ<b.maxZ-.001&&a.maxZ>b.minZ+.001&&a.minY<b.maxY-.001&&a.maxY>b.minY+.001;
const bounds=(x,y,z,w,h,d)=>({minX:x-w/2,maxX:x+w/2,minY:y,maxY:y+h,minZ:z-d/2,maxZ:z+d/2});
// Additional fitout borrows the existing primitive/material caches and static batcher.
export function createSchoolLivingDetails({resources,materials,floor,source,existingSupports=[]}){
 const group=new THREE.Group();group.name='Living School specialized fitout';
 if(source){group.position.copy(source.position);group.quaternion.copy(source.quaternion);group.scale.copy(source.scale);}
 const owned=[],supports=[],colliders=[],placements=[],stats={draws:0,triangles:0,props:0};let disposed=false;
 const boxes=decodeFurnitureBoxes(source)||[],targets=[...Object.values(NARRATIVE_POINTS),...Array.from({length:6},(_,i)=>bookPoint(i))].filter(p=>p.floor===floor.index);
 const wood='#8b6a4e',blue='#2d5fa8',paper='#eee9dd',dark='#5b616b';
 const add=(kind,x,y,z,w,h,d,color,finish='plain')=>{const m=new THREE.Mesh(resources.geometry(kind),materials.get(color,finish));m.position.set(x,y+h/2,z);m.scale.set(w*(kind==='cylinder'?.5:1),h,d*(kind==='cylinder'?.5:1));group.add(m);};
 const clearTarget=(b,p,radius)=>Math.hypot(Math.max(b.minX-p.x,0,p.x-b.maxX),Math.max(b.minZ-p.z,0,p.z-b.maxZ))>=radius;
 function solid(room,kind,x,z,w,h,d){
  const b=bounds(x,.03,z,w,h,d),absolute={...b,minY:b.minY+floor.baseY,maxY:b.maxY+floor.baseY};
  if(b.minX<=room.x1+.15||b.maxX>=room.x2-.15||b.minZ<=room.z1+.15||b.maxZ>=room.z2-.15)return null;
  const door=room.door;
  if(door&&overlaps(b,bounds(door.x,0,door.z,1.4,2.6,1.4)))return null;
  if(floor.colliders.some(c=>overlaps(absolute,c))||colliders.some(c=>overlaps(absolute,c)))return null;
  if(targets.some(p=>!clearTarget(b,p,.65)||(p.approach&&!clearTarget(b,p.approach,.55))))return null;
  colliders.push({...absolute,kind:'living-furniture',roomId:room.id});placements.push({...b,kind,roomId:room.id});return b;
 }
 function table(room,x,z,w=2,d=.8){
  const b=solid(room,'work-table',x,z,w,.75,d);if(!b)return null;
  add('rounded',x,.69,z,w,.09,d,wood,'wood');
  for(const sx of [-1,1])for(const sz of [-1,1])add('box',x+sx*(w/2-.08),.03,z+sz*(d/2-.08),.06,.66,.06,dark,'metal');
  return{...b,room};
 }
 function chair(room,x,z){
  if(!solid(room,'chair',x,z,.48,.90,.48))return;
  add('rounded',x,.43,z,.46,.07,.44,blue);
  add('rounded',x,.50,z-.20,.46,.43,.045,blue);
  for(const sx of [-1,1])for(const sz of [-1,1])add('box',x+sx*.18,.03,z+sz*.17,.035,.40,.035,dark,'metal');
 }
 function prop(parent,role,x,z,w,h,d,color,offset=0,kind='box'){
  const b=bounds(x,parent.maxY+offset,z,w,h,d);
  if(b.minX<parent.minX+.015||b.maxX>parent.maxX-.015||b.minZ<parent.minZ+.015||b.maxZ>parent.maxZ-.015)return;
  if(targets.some(p=>p.top!=null&&Math.abs(p.top-parent.maxY)<.25&&!clearTarget(b,p,.27)))return;
  if(existingSupports.some(s=>overlaps(b,s.bounds)))return;
  if(offset&&!supports.some(s=>s.parent===parent&&Math.abs(s.bounds.maxY-b.minY)<1e-7&&overlaps({...b,minY:s.bounds.minY},s.bounds)))return;
  if(supports.some(s=>s.parent===parent&&overlaps(b,s.bounds)))return;
  add(kind,x,b.minY,z,w,h,d,color,color===dark?'metal':'plain');supports.push({bounds:b,parent,roomType:parent.room.type,role});stats.props++;
 }
 function paperwork(p,x,z){prop(p,'folder',x,z,.25,.025,.30,blue);prop(p,'documents',x,z,.225,.018,.275,paper,.025);}
 function computer(p,x,z){
  if(existingSupports.some(s=>overlaps(bounds(x,p.maxY,z-.08,.38,.40,.43),s.bounds)))return;
  prop(p,'computer-base',x,z,.22,.025,.16,dark);prop(p,'computer-stand',x,z,.045,.13,.045,dark,.025);prop(p,'computer-monitor',x,z,.36,.23,.035,blue,.155);
  prop(p,'keyboard',x,z-.24,.30,.018,.11,dark);
 }
 function microscope(p,x,z){
  prop(p,'microscope-base',x,z,.23,.03,.20,dark);prop(p,'microscope-column',x,z+.025,.04,.19,.045,dark,.03);
  prop(p,'microscope-head',x,z,.15,.065,.10,paper,.22);prop(p,'microscope-eyepiece',x,z,.045,.04,.045,dark,.285,'cylinder');
  prop(p,'observation-slide',x+.055,z-.055,.08,.004,.035,blue,.03);
 }
 const surfaces=[];
 for(const b of boxes){const [w,h,d]=b.size,[x,,z]=b.center,room=floor.rooms.find(r=>x>r.x1&&x<r.x2&&z>r.z1&&z<r.z2);
  if(room&&h<.16&&w>.75&&d>.5&&b.max[1]>.65&&b.max[1]<1.25)surfaces.push({...bounds(x,b.min[1],z,w,h,d),room});
 }
 for(const room of floor.rooms){
  if(['teachers','reception','secretaria','office','coord','cinema'].includes(room.type)){
   const depth=room.type==='teachers'?1.1:room.type==='cinema'?.55:room.type==='office'?.5:.75;
   const z=room.z1+(room.type==='office'?.60:1.1),w=room.type==='teachers'?3:room.type==='cinema'?.95:1.8;
   const t=table(room,room.x,z,w,depth);if(t){surfaces.push(t);if(room.type!=='cinema')chair(room,room.x-(room.type==='office'?.65:0),z+depth/2+.45);}
  }
 }
 for(const p of surfaces){const type=p.room.type,x=(p.minX+p.maxX)/2,z=(p.minZ+p.maxZ)/2;
  if(['lab','science'].includes(type)){
   microscope(p,x-.34,z-.19);
   prop(p,'specimen-base',x+.32,z-.18,.16,.025,.15,dark);
   prop(p,'cell-model',x+.32,z-.18,.10,.12,.10,blue,.025,'rounded');
   prop(p,'sample-container',x+.32,z+.18,.075,.15,.075,paper,0,'cylinder');
   prop(p,'sample-cap',x+.32,z+.18,.08,.025,.08,blue,.15,'cylinder');
  }else if(['reception','secretaria','office','coord'].includes(type)){
   const depth=p.maxZ-p.minZ;computer(p,x-.25,z+.08);paperwork(p,x+.42,z-Math.min(.10,depth/2-.17));
   if(p.maxX-p.minX>1.5){const px=p.minX+.25,pz=z-Math.min(.16,depth/2-.13);prop(p,'printer',px,pz,.30,.13,.22,paper);prop(p,'printer-paper',px,pz,.24,.014,.18,paper,.13);}
   const tz=z+Math.min(.20,depth/2-.085);prop(p,'telephone-base',x+.45,tz,.20,.035,.13,dark);prop(p,'telephone-handset',x+.45,tz,.22,.025,.04,dark,.035,'rounded');
  }else if(type==='teachers'){
   paperwork(p,x-.65,z);paperwork(p,x+.3,z);
   prop(p,'work-cup',x+.7,z-.2,.075,.10,.075,paper,0,'cylinder');
   prop(p,'organizer',x-.05,z+.32,.20,.12,.14,blue);
  }else if(type==='cinema'){
   prop(p,'projector',x,z,.36,.15,.25,paper);prop(p,'projector-control',x,z,.07,.025,.06,dark,.15);
  }
 }
 batchMeshes(group,[...group.children],owned);stats.draws=group.children.length;for(const m of group.children){m.castShadow=false;m.receiveShadow=true;stats.triangles+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3;}
 return{group,supports,colliders,placements,stats,updateQuality(q){for(const m of group.children)m.castShadow=q==='high';},dispose(){if(disposed)return;disposed=true;group.removeFromParent();group.clear();owned.forEach(g=>g.dispose());}};
}
