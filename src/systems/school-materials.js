import * as THREE from 'three';
import {ColorbeatMaterials} from './colorbeat-materials.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Compatibility facade; the actual game borrows the campus' Colorbeat owner.
export class SchoolMaterials {
 constructor(resources){this.library=resources.colorbeat||new ColorbeatMaterials({gradient:resources.toonRamp()});this.ownsLibrary=!resources.colorbeat;this.materials=new Map();this.textures=new Map();this.disposed=false;}
 texture(kind){const map=this.library.texture(kind);this.textures.set(kind,map);return map;}
 get(color,kind='plain',vertexColors=false){if(this.disposed)throw Error('School materials disposed');const material=this.library.get(color,kind,{vertexColors});this.materials.set(`${color}:${kind}:${vertexColors}`,material);return material;}
 dispose(){if(this.disposed)return;this.disposed=true;if(this.ownsLibrary)this.library.dispose();this.materials.clear();this.textures.clear();}
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
