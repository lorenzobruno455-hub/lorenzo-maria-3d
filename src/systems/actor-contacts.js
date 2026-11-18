import * as THREE from 'three';
import {courtSurfaceHeight} from './sports-court.js';
import {walkY,floorAt,stairSurface} from './physical-stairs.js';

// Graphic grounding only: never changes actor transforms, physics or navigation.
export function actorContactHeight(position,rotation,groundHeight,scratch={}){
 const dx=position.x-60,c=Math.cos(rotation),s=Math.sin(rotation);
 scratch.x=c*dx-s*position.z;scratch.z=s*dx+c*position.z;
 let height;
 if(Math.abs(scratch.x)<10.9&&Math.abs(scratch.z)<18.9){
  for(let f=0;f<2;f++){const y=stairSurface(f,scratch);if(y!==null&&Math.abs(y-position.y)<.15)return null;}
  height=walkY(floorAt(position.y));
 }else height=Math.max(groundHeight(position.x,position.z)??0,courtSurfaceHeight(position.x,position.z)??-Infinity);
 return position.y>=height-.08&&position.y-height<.6?height+.004:null;
}

export function createActorContacts({scene,actors,groundHeight,schoolRotation=()=>0}){
 const geometry=new THREE.CircleGeometry(1,16);geometry.rotateX(-Math.PI/2);
 const material=new THREE.MeshBasicMaterial({color:'#16132D',transparent:true,opacity:.24,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,toneMapped:false});
 const mesh=new THREE.InstancedMesh(geometry,material,actors.length);mesh.name='Colorbeat actor ground contacts';mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.castShadow=mesh.receiveShadow=false;mesh.raycast=()=>{};
 // One tiny batch spans the campus; per-actor distance culling happens below.
 mesh.frustumCulled=false;mesh.count=0;scene.add(mesh);
 const matrix=new THREE.Matrix4(),position=new THREE.Vector3(),scale=new THREE.Vector3(.30,1,.22),rotation=new THREE.Quaternion(),local={};let disposed=false;
 return{mesh,update(player,quality){
  if(disposed)return;let count=0;const limit=quality==='low'?20:45,turn=schoolRotation();
  for(const actor of actors){
   if(!actor.visible)continue;actor.getWorldPosition(position);
   if(Math.hypot(position.x-player.x,position.z-player.z)>limit)continue;
   const y=actorContactHeight(position,turn,groundHeight,local);if(y===null)continue;
   position.y=y;matrix.compose(position,rotation,scale);mesh.setMatrixAt(count++,matrix);
  }
  mesh.count=count;mesh.visible=count>0;mesh.instanceMatrix.needsUpdate=count>0;
 },dispose(){if(disposed)return;disposed=true;mesh.removeFromParent();mesh.dispose();geometry.dispose();material.dispose();}};
}
