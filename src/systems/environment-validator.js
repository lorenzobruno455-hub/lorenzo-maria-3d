import * as THREE from 'three';
import { boundsOf } from './prop-placement.js';
export function validatePlacement(object, tolerance=.008) {
 const p=object.userData.placement;if(!p)return {ok:false,reason:'Sem apoio declarado'};
 const bounds=boundsOf(object), gap=bounds.min.y-p.height;
 return {ok:p.suspended||Math.abs(gap)<=tolerance,gap,support:p.support,origin:object.position.toArray(),dimensions:bounds.getSize(new THREE.Vector3()).toArray()};
}
export class EnvironmentValidator {
 constructor(scene,world) { this.scene=scene;this.world=world;this.group=new THREE.Group();scene.add(this.group);this.visible=false; }
 inspect(objects) {return objects.map(o=>({id:o.userData.propId||o.name,...validatePlacement(o)}));}
 show(objects,characters=[]) {
  this.clear();this.visible=true;
  for(const o of [...objects,...characters]) { this.group.add(new THREE.Box3Helper(boundsOf(o),0xe3bb67));const axes=new THREE.AxesHelper(.3);axes.position.copy(o.position);this.group.add(axes);const p=o.userData.placement?.point;if(p){const point=new THREE.Mesh(new THREE.SphereGeometry(.045,6,4),new THREE.MeshBasicMaterial({color:0x56ed9b}));point.position.set(p.x,p.y,p.z);this.group.add(point);}}
  for(const b of this.world.solids){const box=new THREE.Box3(new THREE.Vector3(b.minX,b.minY||0,b.minZ),new THREE.Vector3(b.maxX,b.maxY||2,b.maxZ));this.group.add(new THREE.Box3Helper(box,0xec6868));}
  for(const s of this.world.surfaces||[]){const grid=new THREE.GridHelper(Math.max(s.width,s.depth),8,0x62b6d1,0x62b6d1);grid.position.set(s.x,s.height+.005,s.z);this.group.add(grid);}
 }
 clear(){this.group.traverse(o=>{o.geometry?.dispose();if(o.material) for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();});this.group.clear();this.visible=false;}
 dispose(){this.clear();this.group.removeFromParent();}
}
