import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Original, deterministic 64px neutral maps; tint remains the supplied palette.
export class SchoolMaterials {
 constructor(resources){this.resources=resources;this.materials=new Map();this.textures=new Map();this.disposed=false;}
 texture(kind){
  if(this.textures.has(kind))return this.textures.get(kind);
  const size=64,data=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const noise=((x*37+y*67+x*y*3)%17)/17;let v=250-noise*5;
   if(kind==='wood')v=244+Math.sin(y*.72+Math.sin(x*.12)*1.4)*5-noise*4-(y%32===0?12:0);
   if(kind==='tile')v=(x%32===0||y%32===0)?220:250-noise*3;
   if(kind==='cloth')v=246-((x+y)%3===0?7:0)-noise*3;
   const i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;
  }
  const texture=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.needsUpdate=true;this.textures.set(kind,texture);return texture;
 }
 get(color,kind='plain',vertexColors=false){
  const key=`${String(color).toLowerCase()}:${kind}:${vertexColors}`;if(this.materials.has(key))return this.materials.get(key);
  let m;if(kind==='glass')m=new THREE.MeshStandardMaterial({color,transparent:true,opacity:.45,roughness:.3,metalness:0,depthWrite:false});
  else if(kind==='emissive')m=new THREE.MeshBasicMaterial({color,toneMapped:false});
  else m=new THREE.MeshToonMaterial({color,vertexColors,gradientMap:this.resources.toonRamp(),map:['wood','tile','cloth','plaster'].includes(kind)?this.texture(kind):null});
  this.materials.set(key,m);return m;
 }
 dispose(){if(this.disposed)return;this.disposed=true;this.materials.forEach(m=>m.dispose());this.textures.forEach(t=>t.dispose());this.materials.clear();this.textures.clear();}
}
function projectedUV(geometry,scale=1.8){
 const p=geometry.getAttribute('position'),n=geometry.getAttribute('normal'),uv=new Float32Array(p.count*2);
 for(let i=0;i<p.count;i++){const y=Math.abs(n?.getY(i)||0),x=Math.abs(n?.getX(i)||0);uv[i*2]=(y>.5?p.getX(i):x>.5?p.getZ(i):p.getX(i))/scale;uv[i*2+1]=(y>.5?p.getZ(i):p.getY(i))/scale;}
 geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));return geometry;
}
// All new buffers are owned here; original GLB buffers stay in the shared pool.
export function finishSchoolSurfaces({model,materials}){
 const floor=model.getObjectByName('floors'),structure=model.getObjectByName('structure'),owned=[],restore=[];const group=new THREE.Group();group.name='M2 floor finishes';
 if(structure?.isMesh){const previous={geometry:structure.geometry,material:structure.material};structure.geometry=projectedUV(structure.geometry.clone(),2.4);structure.material=materials.get('#ffffff','plaster',true);owned.push(structure.geometry);restore.push(()=>{structure.geometry=previous.geometry;structure.material=previous.material;});}
 if(floor?.isMesh){
  const previousVisible=floor.visible,source=floor.geometry,index=source.index;const geometry=index?source.toNonIndexed():source;const color=geometry.getAttribute('color'),position=geometry.getAttribute('position');const bins={wood:[],tile:[]};
  if(color&&position.count%36===0){
   for(let start=0;start<position.count;start+=36){const r=color.getX(start),g=color.getY(start),b=color.getZ(start),kind=r>g*1.25&&g>b*1.2?'wood':'tile',part=new THREE.BufferGeometry();for(const name of ['position','normal','color']){const a=geometry.getAttribute(name);if(a)part.setAttribute(name,new THREE.BufferAttribute(a.array.slice(start*a.itemSize,(start+36)*a.itemSize),a.itemSize,a.normalized));}bins[kind].push(part);}
   for(const[kind,parts]of Object.entries(bins)){if(!parts.length)continue;const merged=projectedUV(mergeGeometries(parts,false));parts.forEach(g=>g.dispose());owned.push(merged);const mesh=new THREE.Mesh(merged,materials.get('#ffffff',kind,true));mesh.castShadow=false;mesh.receiveShadow=true;mesh.name=`M2 ${kind} floor`;group.add(mesh);}
   group.position.copy(floor.position);group.quaternion.copy(floor.quaternion);group.scale.copy(floor.scale);floor.parent.add(group);floor.visible=false;restore.push(()=>floor.visible=previousVisible);
  }
  if(index)geometry.dispose();
 }
 let disposed=false;return{group,dispose(){if(disposed)return;disposed=true;restore.forEach(fn=>fn());group.removeFromParent();owned.forEach(g=>g.dispose());}};
}
