import * as THREE from 'three';
export const surface = (id, x, z, width, depth, height, mesh = null) => ({ id, x, z, width, depth, height, mesh });
export function surfaceHeight(s, x, z) {
  if (Math.abs(x-s.x)>s.width/2 || Math.abs(z-s.z)>s.depth/2) throw new Error(`Fora da superfície ${s.id}`);
  if (s.mesh) { s.mesh.updateWorldMatrix(true,true); const ray = new THREE.Raycaster(new THREE.Vector3(x,s.height+10,z),new THREE.Vector3(0,-1,0)); const hit=ray.intersectObject(s.mesh,true)[0]; if(hit) return hit.point.y; }
  return s.height;
}
export function boundsOf(object) { object.updateWorldMatrix(true,true); return object.userData.staticBounds?.clone() || new THREE.Box3().setFromObject(object); }
export function placeOn(object, support, { x = support.x, z = support.z, yaw = 0, scale = 1, suspended = false } = {}) {
  object.scale.setScalar(scale); object.rotation.y=yaw; object.position.set(x,0,z);
  const b=boundsOf(object), height=surfaceHeight(support,x,z);
  if (b.isEmpty()) throw new Error('Objeto sem geometria');
  object.position.y += height-b.min.y; object.updateWorldMatrix(true,true);
  const dimensions=boundsOf(object).getSize(new THREE.Vector3());
  object.userData.placement={ support: support.id, height, point:{x,y:height,z}, dimensions:dimensions.toArray(), suspended, yaw, scale };
  return object;
}
export function colliderFor(object, extra = {}) { const b=boundsOf(object); return {minX:b.min.x,maxX:b.max.x,minY:b.min.y,maxY:b.max.y,minZ:b.min.z,maxZ:b.max.z,...extra}; }
export function groundHeight(x,z) {
  if (z>=-17 && z<=-6 && (Math.abs(x+17)<=11 || Math.abs(x-17)<=11)) return .12;
  if (x>=28 && x<=36 && z>=-16 && z<=-6) return .1;
  if (Math.abs(x)<=5 && z>=-25.5 && z<=-18.5) return .08;
  if (Math.abs(x)<=29 && Math.abs(z)<=6) return .045;
  if (Math.abs(x)<=6 && z>=-16 && z<=30) return .025;
  if(x>=-37&&x<=-29&&z>=-1&&z<=9)return .04;
  return -.02;
}
