import * as THREE from'three';
import {batchMeshes}from'./batching.js';
import {SCHOOL_ORIGIN,ENTRANCE,shiftedBox,schoolBoundsToWorld}from'./world-coordinates.js';
import {splitEntranceBox}from'./school-entrance.js';
import {extendThreeGateConnection}from'./school-three-gate-connection.js';
export function createCampusConnection(scene,world,layout,options={}){
 const r=world.resources,group=new THREE.Group(),route=new THREE.Group(),props=new THREE.Group(),proxies=[],owned=[],colliders=[];group.name='Campus–São Jorge continuous connection';group.add(route);route.add(props);scene.add(group);
 const part=(parent,kind,color,x,y,z,w,h,d,finish='plain')=>{const m=r.mesh(kind,color,[w,h,d],finish);m.position.set(x,y,z);parent.add(m);return m;};
 part(route,'box','#9cae7d',62,-.22,0,42,.4,70,'plaster');
 part(route,'box','#c9c1ad',33,.005,20,54,.05,3,'tile');
 part(route,'box','#c9c1ad',60,.005,19,3,.05,3,'tile');
 const foliage=new THREE.InstancedMesh(r.geometry('leaf'),r.material('#698756'),6),leafTransform=new THREE.Object3D();
 foliage.userData.comicTreeCenters=[42,51,73].map(x=>({x,y:3.3,z:24,scale:.62}));props.add(foliage);let leafIndex=0;
 for(const x of [42,51,73]){
  part(props,'cylinder','#7d6b50',x,1.5,24,.18,3,.18,'wood');
  for(const dx of [-.5,.5]){leafTransform.position.set(x+dx,3.1,24);leafTransform.scale.set(.9,.8,.9);leafTransform.updateMatrix();foliage.setMatrixAt(leafIndex++,leafTransform.matrix);}
  colliders.push({minX:x-.18,maxX:x+.18,minZ:23.82,maxZ:24.18,minY:0,maxY:3});
 }
 for(const x of [44,69]){
  part(props,'box','#a58a5b',x,.5,23,2,.12,.65,'wood');part(props,'box','#a58a5b',x,.9,23.3,2,.75,.10,'wood');
  for(const dx of [-.7,.7])part(props,'box','#5b616b',x+dx,.25,23,.08,.5,.55,'metal');
  colliders.push({minX:x-1,maxX:x+1,minZ:22.65,maxZ:23.35,minY:0,maxY:1.3});
 }
 // Keep connection lights beside the new path, out of both room footprints.
 const lamps=options.threeGates?[[40,17.5],[48,17.5],[42.8,-12],[42.8,-28]]:[40,48,57,70].map(x=>[x,17.5]);
 for(const [x,z] of lamps){
  part(props,'cylinder','#5b616b',x,1.7,z,.045,3.4,.045,'metal');part(props,'box','#eee9dd',x,3.4,z,.40,.08,.30,'plain');
  colliders.push({minX:x-.05,maxX:x+.05,minZ:z-.05,maxZ:z+.05,minY:0,maxY:3.45});
 }
 colliders.forEach(b=>b.kind='connection-prop');
 batchMeshes(route,route.children.filter(m=>m.isMesh),owned);batchMeshes(props,props.children.filter(m=>m!==foliage),owned);
 for(const floor of layout.floors){
  const g=new THREE.Group();g.name=`São Jorge exterior proxy ${floor.index}`;g.position.set(SCHOOL_ORIGIN.x,floor.baseY,SCHOOL_ORIGIN.z);g.rotation.y=options.rotation||0;group.add(g);proxies.push(g);
  for(const side of [-1,1]){
   if(options.threeGates&&floor.index===0&&side===1){
    for(const[a,b]of [[-19,-6.8],[-4.2,19]])part(g,'box','#F4F4F1',11,1.8,(a+b)/2,.24,3.6,b-a);
    part(g,'box','#F4F4F1',11,3.1,-5.5,.24,1,2.6);
   }else part(g,'box','#F4F4F1',side*11,1.8,0,.24,3.6,38,'plain');
  }
  part(g,'box','#F4F4F1',0,1.8,-19,22,3.6,.24,'plain');
  if(floor.index===0){for(const side of [-1,1])part(g,'box','#F4F4F1',side*6.15,1.8,19,9.7,3.6,.24);part(g,'box','#F4F4F1',0,3.1,19,2.6,1,.24);}
  else part(g,'box','#F4F4F1',0,1.8,19,22,3.6,.24);
  for(const room of floor.rooms){const side=room.x1<=-10?-1:room.x2>=10?1:0;if(side&&room.type!=='stair'&&!(options.threeGates&&floor.index===0&&room.type==='reception'))part(g,'box','#A9CED5',side*11.135,1.95,(room.z1+room.z2)/2,.025,1.45,Math.min(2.5,room.z2-room.z1-1));}
  if(floor.index===2)part(g,'box','#F4F4F1',0,3.45,0,22,.1,38);
  batchMeshes(g,[...g.children],owned);
 }
 const mapBox=b=>options.threeGates?schoolBoundsToWorld(b,options.rotation):shiftedBox(b);
 const seal=mapBox({minX:-1.3,maxX:1.3,minZ:18.85,maxZ:19.15,minY:0,maxY:2.6,kind:'streaming-gate'});world.solids.push(...colliders,seal);world.occluders.push(...colliders,seal);
 const perimeter=layout.floors[0].colliders.filter(c=>c.kind==='wall'&&(Math.abs(c.minX)>10.8||Math.abs(c.minZ)>18.8)).flatMap(b=>options.threeGates?splitEntranceBox(b,{reception:true}):[b]).map(mapBox);
 // Guard the footprint before its detailed geometry/collision arrives.
 world.solids.push(...perimeter);world.occluders.push(...perimeter);
 const oldEntry=options.threeGates?{x:60,z:-19}:ENTRANCE;
 const door=world.addDoor(oldEntry.x,'Entrada São Jorge',{z:oldEntry.z,width:ENTRANCE.width,height:ENTRANCE.height,transient:true,rotation:options.rotation||0,gate:!!options.threeGates});group.add(door.root||door.pivot);
 const installed=[];
 const oldGround=world.groundHeight;world.groundHeight=(x,z)=>x>=6&&x<=61.5&&z>=18.5&&z<=21.5?.03:oldGround(x,z);
 const labelGeometry=new THREE.PlaneGeometry(3,.5);owned.push(labelGeometry);let texture=null;
 if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=256;c.height=64;const ctx=c.getContext('2d');ctx.fillStyle='#141824';ctx.fillRect(0,0,256,64);ctx.fillStyle='#ffd43b';ctx.font='bold 32px sans-serif';ctx.textAlign='center';ctx.fillText('SÃO JORGE',128,44);texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;}
 const labelMaterial=new THREE.MeshBasicMaterial({map:texture,color:texture?'#ffffff':'#ffd43b'}),label=new THREE.Mesh(labelGeometry,labelMaterial);label.position.set(oldEntry.x,2.95,oldEntry.z+(options.threeGates?-.14:.14));label.rotation.y=options.rotation||0;group.add(label);
 const proxyBounds=proxies.map(g=>new THREE.Box3().setFromObject(g)),frustum=new THREE.Frustum(),projection=new THREE.Matrix4();
 let disposed=false;
 const connection={group,door,seal,proxies,perimeter,installFloor(boxes){installed.push(...boxes);for(const list of[world.solids,world.occluders]){for(const b of perimeter){const i=list.indexOf(b);if(i>=0)list.splice(i,1);}list.push(...(list===world.solids?boxes.filter(b=>b.minY<layout.floors[0].walkY+1.8&&b.maxY>layout.floors[0].walkY):boxes));}seal.enabled=false;},update(active,loaded,inspecting,showDetail,distance=0){props.visible=active||distance<35;proxies.forEach((g,i)=>g.visible=g.userData.allowed=!inspecting&&!(loaded.includes(i)&&showDetail));},cull(camera){camera.updateMatrixWorld(true);frustum.setFromProjectionMatrix(projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));proxies.forEach((g,i)=>g.visible=g.userData.allowed!==false&&frustum.intersectsBox(proxyBounds[i]));},dispose(){if(disposed)return;disposed=true;group.removeFromParent();foliage.dispose();owned.forEach(g=>g.dispose());texture?.dispose();labelMaterial.dispose();world.groundHeight=oldGround;for(const a of[world.solids,world.occluders])for(const b of[...colliders,seal,...perimeter,...installed,door.bounds]){const i=a.indexOf(b);if(i>=0)a.splice(i,1);}const i=world.doors.indexOf(door);if(i>=0)world.doors.splice(i,1);}};
 return options.threeGates?extendThreeGateConnection(connection,world,options.rotation):connection;
}
