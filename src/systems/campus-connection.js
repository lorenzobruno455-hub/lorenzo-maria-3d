import * as THREE from'three';
import {batchMeshes}from'./batching.js';
import {SCHOOL_ORIGIN,ENTRANCE,shiftedBox}from'./world-coordinates.js';
export function createCampusConnection(scene,world,layout){
 const r=world.resources,group=new THREE.Group(),route=new THREE.Group(),proxies=[],owned=[],colliders=[];group.name='Campus–São Jorge continuous connection';group.add(route);scene.add(group);
 const part=(parent,kind,color,x,y,z,w,h,d,finish='plain')=>{const m=r.mesh(kind,color,[w,h,d],finish);m.position.set(x,y,z);parent.add(m);return m;};
 part(route,'box','#9cae7d',62,-.22,0,42,.4,70,'plaster');
 part(route,'box','#c9c1ad',33,.005,20,54,.05,3,'tile');
 part(route,'box','#c9c1ad',60,.005,19,3,.05,3,'tile');
 for(const x of [42,51,73]){
  part(route,'cylinder','#7d6b50',x,1.5,24,.18,3,.18,'wood');
  for(const dx of [-.5,.5])part(route,'leaf','#698756',x+dx,3.1,24,.9,.8,.9);
  colliders.push({minX:x-.18,maxX:x+.18,minZ:23.82,maxZ:24.18,minY:0,maxY:3});
 }
 for(const x of [44,69]){
  part(route,'box','#a58a5b',x,.5,23,2,.12,.65,'wood');part(route,'box','#a58a5b',x,.9,23.3,2,.75,.10,'wood');
  for(const dx of [-.7,.7])part(route,'box','#5b616b',x+dx,.25,23,.08,.5,.55,'metal');
  colliders.push({minX:x-1,maxX:x+1,minZ:22.65,maxZ:23.35,minY:0,maxY:1.3});
 }
 for(const x of [40,48,57,70]){
  part(route,'cylinder','#5b616b',x,1.7,17.5,.045,3.4,.045,'metal');part(route,'box','#eee9dd',x,3.4,17.5,.40,.08,.30,'plain');
  colliders.push({minX:x-.05,maxX:x+.05,minZ:17.45,maxZ:17.55,minY:0,maxY:3.45});
 }
 batchMeshes(route,[...route.children],owned);
 for(const floor of layout.floors){
  const g=new THREE.Group();g.name=`São Jorge exterior proxy ${floor.index}`;g.position.set(SCHOOL_ORIGIN.x,floor.baseY,SCHOOL_ORIGIN.z);group.add(g);proxies.push(g);
  for(const side of [-1,1])part(g,'box','#F4F4F1',side*11,1.8,0,.24,3.6,38,'plain');
  part(g,'box','#F4F4F1',0,1.8,-19,22,3.6,.24,'plain');
  if(floor.index===0){for(const side of [-1,1])part(g,'box','#F4F4F1',side*6.15,1.8,19,9.7,3.6,.24);part(g,'box','#F4F4F1',0,3.1,19,2.6,1,.24);}
  else part(g,'box','#F4F4F1',0,1.8,19,22,3.6,.24);
  for(const room of floor.rooms){const side=room.x1<=-10?-1:room.x2>=10?1:0;if(side&&room.type!=='stair')part(g,'box','#A9CED5',side*11.135,1.95,(room.z1+room.z2)/2,.025,1.45,Math.min(2.5,room.z2-room.z1-1));}
  if(floor.index===2)part(g,'box','#F4F4F1',0,3.45,0,22,.1,38);
  batchMeshes(g,[...g.children],owned);
 }
 const seal=shiftedBox({minX:-1.3,maxX:1.3,minZ:18.85,maxZ:19.15,minY:0,maxY:2.6,kind:'streaming-gate'});world.solids.push(...colliders,seal);world.occluders.push(...colliders,seal);
 const perimeter=layout.floors[0].colliders.filter(c=>c.kind==='wall'&&(Math.abs(c.minX)>10.8||Math.abs(c.minZ)>18.8)).map(c=>shiftedBox(c));
 // Guard the footprint before its detailed geometry/collision arrives.
 world.solids.push(...perimeter);world.occluders.push(...perimeter);
 const door=world.addDoor(ENTRANCE.x,'Entrada São Jorge',{z:ENTRANCE.z,width:ENTRANCE.width,height:ENTRANCE.height,transient:true});group.add(door.pivot);
 const installed=[];
 const oldGround=world.groundHeight;world.groundHeight=(x,z)=>x>=6&&x<=61.5&&z>=18.5&&z<=21.5?.03:oldGround(x,z);
 const labelGeometry=new THREE.PlaneGeometry(3,.5);owned.push(labelGeometry);let texture=null;
 if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=256;c.height=64;const ctx=c.getContext('2d');ctx.fillStyle='#141824';ctx.fillRect(0,0,256,64);ctx.fillStyle='#ffd43b';ctx.font='bold 32px sans-serif';ctx.textAlign='center';ctx.fillText('SÃO JORGE',128,44);texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;}
 const labelMaterial=new THREE.MeshBasicMaterial({map:texture,color:texture?'#ffffff':'#ffd43b'}),label=new THREE.Mesh(labelGeometry,labelMaterial);label.position.set(60,2.95,19.14);group.add(label);
 let disposed=false;
 return{group,door,seal,proxies,perimeter,installFloor(boxes){installed.push(...boxes);for(const list of[world.solids,world.occluders]){for(const b of perimeter){const i=list.indexOf(b);if(i>=0)list.splice(i,1);}list.push(...(list===world.solids?boxes.filter(b=>b.minY<layout.floors[0].walkY+1.8&&b.maxY>layout.floors[0].walkY):boxes));}seal.enabled=false;},update(active,loaded,inspecting,showDetail){proxies.forEach((g,i)=>g.visible=!inspecting&&!(loaded.includes(i)&&showDetail));},dispose(){if(disposed)return;disposed=true;group.removeFromParent();owned.forEach(g=>g.dispose());texture?.dispose();labelMaterial.dispose();world.groundHeight=oldGround;for(const a of[world.solids,world.occluders])for(const b of[...colliders,seal,...perimeter,...installed,door.bounds]){const i=a.indexOf(b);if(i>=0)a.splice(i,1);}const i=world.doors.indexOf(door);if(i>=0)world.doors.splice(i,1);}};
}
