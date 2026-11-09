import * as THREE from 'three';
import {COLORBEAT_LIGHT} from './colorbeat-lighting.js';
// Two unshadowed fills at most. Their placement is artistic, not a real survey.
export class SchoolLighting{
 constructor(group,fill){this.group=group;this.primary=fill;this.secondary=new THREE.PointLight(COLORBEAT_LIGHT.cool,12,32,1.3);this.secondary.visible=false;this.ambient=new THREE.AmbientLight('#DBE5F4',.35);group.add(this.secondary,this.ambient);this.lastFloor=null;this.targetA=new THREE.Vector3();this.targetB=new THREE.Vector3();}
 update(floor,position,quality,dt=0,inspection=false){
  const room=floor.rooms.find(r=>position.x>=r.x1&&position.x<=r.x2&&position.z>=r.z1&&position.z<=r.z2),z=room?.z??Math.max(-15,Math.min(15,position.z));
  const x=room?.x||0;this.targetA.set(x<-2?-8.6:x>2?8.6:-6.5,floor.baseY+2.65,z);this.targetB.set(x<-2?-3.6:x>2?3.6:6.5,floor.baseY+2.4,z);
  if(this.lastFloor!==floor.index||!dt){this.primary.position.copy(this.targetA);this.secondary.position.copy(this.targetB);}else{const t=1-Math.exp(-dt*4);this.primary.position.lerp(this.targetA,t);this.secondary.position.lerp(this.targetB,t);}
  this.lastFloor=floor.index;this.primary.color.set(['library','teachers','cinema'].includes(room?.type)?COLORBEAT_LIGHT.warm:'#FFF9EB');this.primary.intensity=COLORBEAT_LIGHT.fill[quality]||8;this.primary.distance=34;this.primary.decay=1.3;this.primary.castShadow=false;
  this.secondary.visible=quality!=='low';this.secondary.intensity=quality==='high'?5:3;this.secondary.castShadow=false;this.ambient.intensity=inspection?.25:.18;
 }
 dispose(){this.secondary.removeFromParent();this.ambient.removeFromParent();}
}
