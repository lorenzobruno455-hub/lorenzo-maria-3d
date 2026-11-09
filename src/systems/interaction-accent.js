import * as THREE from 'three';

// Single contextual comic bracket: no beacon cloud, depth bypass or postprocess.
export class InteractionAccent {
 constructor(scene){
  const points=[];for(const [x,z] of [[-1,-1],[1,-1],[1,1],[-1,1]]){points.push(x*.28,0,z*.16,x*.16,0,z*.16,x*.28,0,z*.16,x*.28,0,z*.07);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
  this.mesh=new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:'#ffd43b',toneMapped:false,depthWrite:false}));this.point=new THREE.Vector3();this.mesh.name='Colorbeat contextual brackets';this.mesh.visible=false;scene.add(this.mesh);
 }
 update(target,time,{reducedMotion=false,floorY=0}={}){
  if(this.disposed)return;const o=target?.ref||target;
  const x=target?.x??o?.x,z=target?.z??o?.z;
  this.mesh.visible=!!target&&!['npc','maria','campus','school-stair'].includes(target.kind)&&Number.isFinite(x)&&Number.isFinite(z);
  if(!this.mesh.visible)return;
  const supportY=o?.mesh?.getWorldPosition(this.point).y;
  this.mesh.position.set(x,(target.height??o?.height??supportY??floorY+.12)+.025,z);
  this.mesh.scale.setScalar(reducedMotion?1:1+Math.sin(time*2.5)*.025);
 }
 dispose(){if(this.disposed)return;this.disposed=true;this.mesh.removeFromParent();this.mesh.geometry.dispose();this.mesh.material.dispose();}
}
