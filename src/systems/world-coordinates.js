import * as THREE from 'three';
export const SCHOOL_ORIGIN=Object.freeze({x:60,y:0,z:0});
export const CONTINUOUS_BOUNDS=Object.freeze({minX:-38,maxX:82,minZ:-27,maxZ:29});
export const CAMPUS_BOUNDS=Object.freeze({minX:-38,maxX:38,minZ:-27,maxZ:29});
export const ENTRANCE=Object.freeze({x:60,z:19,width:2.6,height:2.6});
export function shiftedBox(b,offset=SCHOOL_ORIGIN){return{...b,minX:b.minX+offset.x,maxX:b.maxX+offset.x,minZ:b.minZ+offset.z,maxZ:b.maxZ+offset.z};}
export function changeFrame(object,parent,follow,offset){
 parent.attach(object);
 if(follow){parent.attach(follow.camera);for(const key of ['focus','desired','position','probe'])follow[key]?.sub(new THREE.Vector3(offset.x,0,offset.z));}
}
