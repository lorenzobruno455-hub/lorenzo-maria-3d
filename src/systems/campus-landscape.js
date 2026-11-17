import*as THREE from'three';import{batchMeshes}from'./batching.js';import{PERIMETER,createLandscapePlan}from'./landscape-layout.js';
export function createCampusLandscape({scene,world,points=[]}){
 const r=world.resources,group=new THREE.Group(),owned=[],walls=[],chunks=[],colliders=[],cameraOnly=[],plan=createLandscapePlan({solids:world.solids,points});group.name='Aurora perimeter and gardens';scene.add(group);let disposed=false;
 const box=(parent,color,x,y,z,w,h,d)=>{const m=r.mesh('box',color,[w,h,d]);m.position.set(x,y,z);m.castShadow=false;parent.add(m);return m;};
 // A continuous ground skirt sits below existing paving/grass; it conceals terrain edges beyond the wall.
 const skirt=r.mesh('box','#21D75B',[500,.08,500],'emissive');skirt.position.set(22,-.10,-4);skirt.castShadow=skirt.receiveShadow=false;group.add(skirt);
 const wallVisual=new THREE.Group();wallVisual.name='Shared perimeter batches';group.add(wallVisual);
 for(const [i,[x,z]]of PERIMETER.entries()){
  const [xx,zz]=PERIMETER[(i+1)%PERIMETER.length],length=Math.hypot(xx-x,zz-z),wall=new THREE.Group(),alongX=z===zz;wall.name=`Institutional perimeter ${i}`;group.add(wall);const cx=(x+xx)/2,cz=(z+zz)/2;
  box(wall,'#FFF1D6',cx,1.56,cz,alongX?length:.32,3.2,alongX?.32:length);
  for(const[y,h,color]of[[.15,.24,'#141824'],[2.35,.13,'#2250FF'],[3.18,.09,'#141824']])box(wall,color,cx,y,cz,alongX?length:.36,h,alongX?.36:length);
  const n=Math.ceil(length/6);for(let j=0;j<=n;j++){const t=j/n,px=x+(xx-x)*t,pz=z+(zz-z)*t;box(wall,'#FFF1D6',px,1.68,pz,.32,3.46,.32);box(wall,'#141824',px,3.45,pz,.40,.10,.40);}
  walls.push(wall);
 }
 batchMeshes(wallVisual,walls.flatMap(w=>w.children.filter(m=>m.isMesh)),owned);
 colliders.push(...plan.walls);cameraOnly.push(...plan.walls);
 const plantGeometry=new THREE.OctahedronGeometry(1,0);plantGeometry.setAttribute('comicBoxEdge',new THREE.Float32BufferAttribute(new Float32Array(plantGeometry.attributes.position.count),1));owned.push(plantGeometry);
 const transform=new THREE.Object3D(),color=new THREE.Color(),white=r.material('#FFFFFF');
 function instances(parent,geometry,items){if(!items.length)return null;const mesh=new THREE.InstancedMesh(geometry,white,items.length);for(const[i,p]of items.entries()){transform.position.set(p.x,p.y,p.z);transform.rotation.set(0,p.angle||0,p.tilt||0);transform.scale.set(p.w,p.h,p.d);transform.updateMatrix();mesh.setMatrixAt(i,transform.matrix);mesh.setColorAt(i,color.set(p.color));}mesh.computeBoundingSphere();mesh.receiveShadow=true;mesh.castShadow=false;parent.add(mesh);return mesh;}
 const regions=new Map();
 for(const patch of plan.patches){
  const key=`${Math.floor(patch.x/40)}:${Math.floor(patch.z/40)}`;if(!regions.has(key)){const g=new THREE.Group();g.name=`Vegetação regional ${key}`;group.add(g);regions.set(key,{group:g,trunks:[],crowns:[],plants:[],edges:[],minX:Infinity,maxX:-Infinity,minZ:Infinity,maxZ:-Infinity,patchCount:0});}
  const region=regions.get(key),{trunks,crowns,plants,edges}=region;region.minX=Math.min(region.minX,patch.x-3);region.maxX=Math.max(region.maxX,patch.x+3);region.minZ=Math.min(region.minZ,patch.z-3);region.maxZ=Math.max(region.maxZ,patch.z+3);region.patchCount++;
  const ground=(x,z)=>world.groundHeight(x,z)-.05;
  for(const [i,t]of patch.trees.entries()){
   const y=ground(t.x,t.z),h=3.2*t.scale;trunks.push({x:t.x,y:y+h/2,z:t.z,w:.16*t.scale,h,d:.16*t.scale,color:'#7A5A3D'});
   for(let j=0;j<3;j++)crowns.push({x:t.x+(j===1?-.65:j===2?.65:0)*t.scale,y:y+h+.3+(j===0?.7:0),z:t.z+(j%2?.25:-.2),w:1.25*t.scale,h:(j===0?1.35:.95)*t.scale,d:1.15*t.scale,color:['#21D75B','#138A91','#64DA48'][(i+j)%3]});
   const half=.16*t.scale;colliders.push({minX:t.x-half,maxX:t.x+half,minZ:t.z-half,maxZ:t.z+half,minY:y,maxY:y+h,kind:'landscape-trunk'});
   cameraOnly.push({minX:t.x-1.95*t.scale,maxX:t.x+1.95*t.scale,minZ:t.z-1.8*t.scale,maxZ:t.z+1.8*t.scale,minY:y+h+.3-.95*t.scale,maxY:y+h+1+1.35*t.scale,kind:'landscape-canopy'});
  }
  const soil=patch.bed?.04:0;
  if(patch.bed){const w=patch.narrow?.72:3.7,d=patch.narrow?2.5:2.6,y=ground(patch.x,patch.z);edges.push({x:patch.x,y:y+.02,z:patch.z,w,h:.04,d,color:'#21D75B'});for(const side of[-1,1]){edges.push({x:patch.x+side*w/2,y:y+.06,z:patch.z,w:.09,h:.12,d:d+.09,color:'#FFF1D6'});edges.push({x:patch.x,y:y+.06,z:patch.z+side*d/2,w,h:.12,d:.09,color:'#FFF1D6'});}}
  for(const p of patch.shrubs){const y=ground(p.x,p.z)+soil;plants.push({x:p.x,y:y+p.scale*.55,z:p.z,w:p.scale*1.45,h:p.scale*.8,d:p.scale,color:'#21D75B'});}
  for(const f of patch.flowers){const y=ground(f.x,f.z)+soil;edges.push({x:f.x,y:y+.12,z:f.z,w:.018,h:.24,d:.018,color:'#138A91'});for(let j=0;j<4;j++){const a=j*Math.PI/2;plants.push({x:f.x+Math.cos(a)*.065,y:y+.27,z:f.z+Math.sin(a)*.065,w:.075,h:.03,d:.075,color:f.color});}plants.push({x:f.x,y:y+.285,z:f.z,w:.035,h:.03,d:.035,color:'#FFDA31'});}
 }
 for(const region of regions.values()){const{group:g,trunks,crowns,plants,edges,minX,maxX,minZ,maxZ}=region,trunkMesh=instances(g,r.geometry('cylinder'),trunks),crownMesh=instances(g,r.geometry('leaf'),crowns);instances(g,plantGeometry,plants);instances(g,r.geometry('box'),edges);chunks.push({group:g,x:(minX+maxX)/2,z:(minZ+maxZ)/2,radius:Math.hypot(maxX-minX,maxZ-minZ)/2,patchCount:region.patchCount,trunkMesh,crownMesh});}
 world.solids.push(...colliders);world.occluders.push(...cameraOnly,...colliders.filter(b=>b.kind==='landscape-trunk'));
 const meshes=[];group.traverse(m=>{if(m.isMesh)meshes.push(m);});
 return{group,plan,update(player,quality,exteriorVisible=true){const far={low:48,medium:68,high:88}[quality]||48;for(const c of chunks){const distance=Math.hypot(c.x-player.x,c.z-player.z);c.group.visible=exteriorVisible&&distance<far+c.radius;if(c.trunkMesh)c.trunkMesh.castShadow=quality!=='low'&&distance<28;if(c.crownMesh)c.crownMesh.castShadow=quality==='high'&&distance<28;}},state(){return{walls:plan.walls.length,trees:plan.trees.length,patches:plan.patches.length,flowers:plan.patches.reduce((n,p)=>n+p.flowers.length,0),regions:chunks.length,visiblePatches:chunks.reduce((n,c)=>n+(c.group.visible?c.patchCount:0),0),drawMeshes:meshes.length,colliders:colliders.length};},dispose(){if(disposed)return;disposed=true;group.removeFromParent();for(const list of[world.solids,world.occluders])for(const c of new Set([...colliders,...cameraOnly])){const i=list.indexOf(c);if(i>=0)list.splice(i,1);}meshes.forEach(m=>m.isInstancedMesh&&m.dispose());owned.forEach(g=>g.dispose());}};
}
