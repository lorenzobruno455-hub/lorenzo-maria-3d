import * as THREE from 'three';
import {mergeGeometries}from'three/addons/utils/BufferGeometryUtils.js';
import {decodeFurnitureBoxes}from'./school-furniture.js';
export function splitEntranceBox(b,options={}){
 if(b.kind!=='wall'||b.minY>.01)return[b];
 if(b.minX< -1.3&&b.maxX>1.3&&Math.abs((b.minZ+b.maxZ)/2-19)<.15)return[{...b,maxX:-1.3},{...b,minX:1.3},{...b,minX:-1.3,maxX:1.3,minY:2.6}];
 if(options?.reception===true&&b.minX<11&&b.maxX>11&&b.minZ< -6.8&&b.maxZ> -4.2)return[{...b,maxZ:-6.8},{...b,minZ:-4.2},{...b,minZ:-6.8,maxZ:-4.2,minY:2.6}];
 return[b];
}
// Only the necessary front-door opening changes; pooled GLB buffers stay intact.
export function openSchoolEntrance(model,options={}){
 const mesh=model.getObjectByName('structure'),boxes=decodeFurnitureBoxes(mesh);if(!boxes)throw Error('Estrutura incompatível com o vão de entrada');
 const original=mesh.geometry,parts=[];let openings=0;
 for(const [i,b]of boxes.entries()){
  const box={minX:b.min[0],maxX:b.max[0],minY:b.min[1],maxY:b.max[1],minZ:b.min[2],maxZ:b.max[2],kind:'wall'},split=splitEntranceBox(box,options);
  if(split.length===1){const g=new THREE.BufferGeometry();for(const[name,a]of Object.entries(original.attributes))g.setAttribute(name,new THREE.BufferAttribute(a.array.slice(i*36*a.itemSize,(i+1)*36*a.itemSize),a.itemSize,a.normalized));parts.push(g);continue;}
  openings++;for(const p of split){const g=new THREE.BoxGeometry(p.maxX-p.minX,p.maxY-p.minY,p.maxZ-p.minZ).toNonIndexed();g.deleteAttribute('uv');g.translate((p.minX+p.maxX)/2,(p.minY+p.maxY)/2,(p.minZ+p.maxZ)/2);const colors=new Float32Array(g.attributes.position.count*3),a=original.attributes.color;for(let j=0;j<colors.length;j+=3)colors.set([a.getX(i*36),a.getY(i*36),a.getZ(i*36)],j);g.setAttribute('color',new THREE.BufferAttribute(colors,3));parts.push(g);}
 }
 if(openings!==(options.reception?2:1)){parts.forEach(g=>g.dispose());throw Error('Paredes de entrada não confirmadas');}
 const geometry=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());mesh.geometry=geometry;let disposed=false;
 return{dispose(){if(disposed)return;disposed=true;mesh.geometry=original;geometry.dispose();}};
}
