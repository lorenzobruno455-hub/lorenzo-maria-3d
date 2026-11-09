import * as THREE from 'three';
// Bounded world-space gestures, borrowing meshes without owning their GPU data.
export class EnvironmentActions {
 constructor({scene,player,character,audio}){Object.assign(this,{scene,player,character,audio});this.active=null;}
 play(kind,object,done=()=>{}){
  if(this.active)return false;
  const state={book:'openbook',notebook:'openbook',pickup:'pickup',photo:'observe',instrument:'point',door:'interact',stand:'stand'}[kind]||'interact';
  const duration=kind==='stand'?1.4:.85;this.character.requestAction(state,{duration});
  const cover=object?.userData?.cover;const a={kind,object,visible:object?.visible,done,time:0,duration,cover,angle:cover?.rotation.z||0};
  if(object&&kind==='pickup'){object.updateWorldMatrix(true,true);a.ghost=object.clone(true);a.ghost.position.copy(object.getWorldPosition(new THREE.Vector3()));a.ghost.quaternion.copy(object.getWorldQuaternion(new THREE.Quaternion()));a.ghost.scale.copy(object.getWorldScale(new THREE.Vector3()));a.from=a.ghost.position.clone();this.scene.add(a.ghost);}
  this.active=a;this.audio.play(kind==='pickup'?'collect':'confirm');return true;
 }
 update(dt){const a=this.active;if(!a)return;a.time+=Math.max(0,dt);const t=Math.min(1,a.time/a.duration),ease=t*t*(3-2*t);
  if(a.cover)a.cover.rotation.z=a.angle+Math.sin(Math.PI*t)*1.6;
  if(a.ghost){a.object.visible=false;const p=this.player.position;a.ghost.position.lerpVectors(a.from,new THREE.Vector3(p.x+.25,p.y+1.1,p.z+.18),ease);a.ghost.rotation.y+=dt*1.3;}
  if(t>=1){this.clear(false);a.done();}
 }
 clear(restore=true){const a=this.active;if(!a)return;if(a.cover)a.cover.rotation.z=a.angle;a.ghost?.removeFromParent();if(restore&&a.ghost)a.object.visible=a.visible;this.active=null;}
 dispose(){this.clear();}
}
