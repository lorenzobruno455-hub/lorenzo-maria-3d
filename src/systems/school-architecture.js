import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Original atmospheric panels: these do not purport to reconstruct real windows.
export function createSchoolArchitecture({ resources, materials, floor, structure }) {
  const group = new THREE.Group(); group.name = `school-architecture-${floor.index}`;
  const batches = new Map(), owned = [], parts = [], signs = [], colliders = [];
  const stats = { windows: 0, fixtures: 0, signs: 0, draws: 0, parts, labels: signs };
  let disposed = false;
  function box(name, position, size, color, kind = 'plain') {
    const material = materials.get(color, kind);
    const geometry = resources.geometry('box').clone();
    geometry.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...position), new THREE.Quaternion(), new THREE.Vector3(...size)));
    if (!batches.has(material)) batches.set(material, []);
    batches.get(material).push(geometry);
    parts.push({ name, minX: position[0]-size[0]/2, maxX: position[0]+size[0]/2, minY: position[1]-size[1]/2, maxY: position[1]+size[1]/2, minZ: position[2]-size[2]/2, maxZ: position[2]+size[2]/2 });
  }
  function window(side, z, width) {
    const x = side * 10.84;
    box('window-panel', [x, 1.95, z], [.055, 1.45, width], '#A9CED5', 'glass');
    for (const y of [1.19, 2.71]) box('window-frame', [side*10.80,y,z],[.14,.09,width+.16],'#F4F4F1');
    for (const offset of [-width/2, 0, width/2]) box('window-mullion',[side*10.79,1.95,z+offset],[.16,1.5,.065],'#F4F4F1');
    box('curtain-rail',[side*10.72,2.83,z],[.12,.055,width+.3],'#5B616B','metal');
    for (const offset of [-width/2+.09,width/2-.09]) {
      box('curtain',[side*10.67,1.99,z+offset],[.15,1.625,.23],'#D8D3C8','cloth');
      box('curtain-fold',[side*10.61,1.99,z+offset],[.035,1.55,.055],'#BBB5AA','cloth');
    }
    colliders.push({ minX: side < 0 ? -10.88 : 10.5925, maxX: side < 0 ? -10.5925 : 10.88,
      minY: floor.baseY + 1.15, maxY: floor.baseY + 2.87, minZ: z-width/2-.15, maxZ: z+width/2+.15, kind: 'architecture-detail' });
    stats.windows++;
  }
  function fixture(x,z) {
    box('ceiling-canopy',[x,3.37,z],[.9,.06,.18],'#5B616B','metal');
    for(const dx of [-.37,.37]) box('fixture-support',[x+dx,3.14,z],[.025,.46,.025],'#5B616B','metal');
    box('fixture-housing',[x,2.88,z],[1.22,.12,.38],'#5B616B','metal');
    box('fixture-diffuser',[x,2.811,z],[1.10,.025,.29],'#FFF4D5','emissive');
    stats.fixtures++;
  }
  function sign(text, x,y,z, rotation=0, width=1.8,height=.36) { signs.push({text,x,y,z,rotation,width,height}); }
  if (floor.index === 2) {
    for (const side of [-1,1]) for (const z of [-14,-7,0,7,14]) window(side,z,2.5);
    for (const x of [-5,5]) for(const z of [-13,-5,3,11]) fixture(x,z);
    sign('SALÃO MULTIUSO',0,2.2,-18.875,0,3,.5);
  } else {
    for (const room of floor.rooms) {
      const side = room.x1 <= -10 ? -1 : room.x2 >= 10 ? 1 : 0;
      if(side && room.type !== 'stair') window(side,(room.z1+room.z2)/2, Math.min(2.5,room.z2-room.z1-1));
      if(room.type !== 'stair') fixture(room.x,room.z);
      const d=room.door;
      if(!d) continue;
      const alongZ = Math.abs(d.x) === 2;
      // Jambs lie outside the original aperture; no closed leaves.
      if(alongZ) {
        for(const s of [-1,1]) box('door-jamb',[d.x,1.32,d.z+s*(d.width/2+.065)],[.25,2.58,.13],'#7A5A3D','wood');
        box('door-lintel',[d.x,2.66,d.z],[.25,.12,d.width+.26],'#7A5A3D','wood');
        sign(room.name,d.x-Math.sign(d.x)*.095,2.87,d.z,Math.sign(d.x)*Math.PI/2,1.9,.26);
      } else {
        for(const s of [-1,1]) box('door-jamb',[d.x+s*(d.width/2+.065),1.32,d.z],[.13,2.58,.25],'#7A5A3D','wood');
        box('door-lintel',[d.x,2.66,d.z],[d.width+.26,.12,.25],'#7A5A3D','wood');
        sign(room.name,d.x,2.87,d.z+.095,0,1.9,.26);
      }
    }
    for(const z of [-12,-4,4,12]) fixture(0,z);
  }
  // Thin perimeter trim stays inside the inherited wall collision buffer.
  for(const side of [-1,1]) box('institutional-trim',[side*10.84,.78,0],[.07,.055,37.4],'#B9413B');
  sign('IDEIAS EM MOVIMENTO',10.875,1.9,17, -Math.PI/2,1.25,.9);
  sign('LER • CRIAR • COMPARTILHAR',-10.875,1.9,-17,Math.PI/2,1.25,.9);
  for(const stair of floor.stairs || []) {
    // Offset from interaction/arrival centers, readable horizontal landing marker.
    sign(`${stair.destination+1}º ANDAR  →`,stair.x+1.15,.033,stair.z, -Math.PI/2,1.1,.55);
    signs[signs.length-1].floor = true;
  }
  for(const [material, geometries] of batches) {
    const geometry=mergeGeometries(geometries,false); geometries.forEach(g=>g.dispose()); owned.push(geometry);
    const mesh=new THREE.Mesh(geometry,material); mesh.name='architecture-batch'; mesh.castShadow=true; mesh.receiveShadow=true; group.add(mesh);
  }
  let texture, signMaterial;
  if (typeof document !== 'undefined') {
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
    const context=canvas.getContext('2d');
    if(context) {
      texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
      const paint=()=>{if(disposed)return;context.clearRect(0,0,512,512);signs.forEach((s,i)=>{const y=i*32;context.fillStyle=s.floor?'#2F5D9A':'#F4F4F1';context.fillRect(0,y,512,32);context.fillStyle=s.floor?'#FFFFFF':'#2F5D9A';context.font='bold 23px "Barlow Condensed", "Atkinson Hyperlegible", sans-serif' ;context.textAlign='center';context.textBaseline='middle';context.fillText(s.text,256,y+16,496);});texture.needsUpdate=true;};
      paint(); document.fonts?.ready.then(paint);
    }
  }
  // Geometry remains available in headless runs; painting requires a browser canvas.
  signMaterial=new THREE.MeshBasicMaterial({map:texture || null,color:texture?'#FFFFFF':'#2F5D9A',side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  const signGeometries=signs.map((s,i)=>{
    const g=new THREE.PlaneGeometry(s.width,s.height), uv=g.attributes.uv;
    for(let j=0;j<uv.count;j++) uv.setY(j,1-(i*32+1+(1-uv.getY(j))*30)/512);
    if(s.floor) g.rotateX(-Math.PI/2); else g.rotateY(s.rotation);
    g.translate(s.x,s.y,s.z);return g;
  });
  if(signGeometries.length){const geometry=mergeGeometries(signGeometries,false);signGeometries.forEach(g=>g.dispose());owned.push(geometry);const mesh=new THREE.Mesh(geometry,signMaterial);mesh.name='school-sign-atlas';group.add(mesh);}
  stats.signs=signs.length;
  // Only select long wall silhouettes, never outline every furnishing triangle.
  const edgeGeometries=[];
  for(const c of floor.colliders.filter(c=>c.kind==='wall' && (c.maxX-c.minX>5 || c.maxZ-c.minZ>5))) {
    const g=new THREE.BoxGeometry(c.maxX-c.minX,c.maxY-c.minY,c.maxZ-c.minZ);
    g.translate((c.minX+c.maxX)/2,(c.minY+c.maxY)/2-floor.baseY,(c.minZ+c.maxZ)/2);
    const e=new THREE.EdgesGeometry(g);g.dispose();edgeGeometries.push(e);
  }
  const edgeMaterial=new THREE.LineBasicMaterial({color:'#4B5158',transparent:true,opacity:.22});
  let edges;
  if(edgeGeometries.length){const geometry=mergeGeometries(edgeGeometries,false);edgeGeometries.forEach(g=>g.dispose());owned.push(geometry);edges=new THREE.LineSegments(geometry,edgeMaterial);edges.name='selective-wall-edges';group.add(edges);}
  // Kept separate so inspection reveals rooms without changing static batches.
  const ceiling = new THREE.Mesh(resources.geometry('box'), materials.get('#F4F4F1', 'plain'));
  ceiling.name = 'school-ceiling'; ceiling.position.set(0,3.45,0); ceiling.scale.set(22,.1,38);
  ceiling.castShadow = ceiling.receiveShadow = true; group.add(ceiling);
  const capGeometries=[];
  for(const wall of floor.colliders.filter(c=>c.kind==='wall')) {
    const minY=floor.baseY+3.05, maxY=floor.baseY+3.4;
    const cap={minX:wall.minX,maxX:wall.maxX,minZ:wall.minZ,maxZ:wall.maxZ,minY,maxY,kind:'architecture-detail'};
    colliders.push(cap);
    const geometry=resources.geometry('box').clone();
    geometry.applyMatrix4(new THREE.Matrix4().compose(
      new THREE.Vector3((cap.minX+cap.maxX)/2,3.225,(cap.minZ+cap.maxZ)/2),
      new THREE.Quaternion(),new THREE.Vector3(cap.maxX-cap.minX,.35,cap.maxZ-cap.minZ)));
    capGeometries.push(geometry);
  }
  let caps;
  if(capGeometries.length){
    const geometry=mergeGeometries(capGeometries,false);capGeometries.forEach(g=>g.dispose());owned.push(geometry);
    caps=new THREE.Mesh(geometry,materials.get('#F4F4F1','plain'));caps.name='school-wall-caps';caps.castShadow=true;caps.receiveShadow=true;group.add(caps);
  }
  function setInspection(inspecting) { ceiling.visible = !inspecting; if(caps)caps.visible=!inspecting; }
  stats.draws=group.children.length;
  function updateQuality(quality){if(edges)edges.visible=quality!=='low';}
  return {group,colliders,stats,updateQuality,setInspection,dispose(){if(disposed)return;disposed=true;owned.forEach(g=>g.dispose());texture?.dispose();signMaterial.dispose();edgeMaterial.dispose();group.clear();}};
}
