import * as THREE from 'three';
export const SCHOOL_ORIGIN=Object.freeze({x:60,y:0,z:0});
export const CONTINUOUS_BOUNDS=Object.freeze({minX:-38,maxX:82,minZ:-37,maxZ:29});
export const CAMPUS_BOUNDS=Object.freeze({minX:-38,maxX:38,minZ:-27,maxZ:29});
export const ENTRANCE=Object.freeze({x:60,z:19,width:2.6,height:2.6});
export function shiftedBox(b,offset=SCHOOL_ORIGIN){return{...b,minX:b.minX+offset.x,maxX:b.maxX+offset.x,minZ:b.minZ+offset.z,maxZ:b.maxZ+offset.z};}
const trig=rotation=>{const clean=n=>Math.abs(n)<1e-12?0:Math.abs(n-1)<1e-12?1:Math.abs(n+1)<1e-12?-1:n;return[clean(Math.cos(rotation)),clean(Math.sin(rotation))];};
export function schoolPointToWorld(p,rotation=0){const[c,s]=trig(rotation);return{...p,x:SCHOOL_ORIGIN.x+c*p.x+s*p.z,z:SCHOOL_ORIGIN.z-s*p.x+c*p.z};}
export function schoolPointToLocal(p,rotation=0){const[c,s]=trig(rotation),x=p.x-SCHOOL_ORIGIN.x,z=p.z-SCHOOL_ORIGIN.z;return{...p,x:c*x-s*z,z:s*x+c*z};}
function mappedBounds(b,map){const p=[[b.minX,b.minZ],[b.minX,b.maxZ],[b.maxX,b.minZ],[b.maxX,b.maxZ]].map(([x,z])=>map({x,z}));return{...b,minX:Math.min(...p.map(p=>p.x)),maxX:Math.max(...p.map(p=>p.x)),minZ:Math.min(...p.map(p=>p.z)),maxZ:Math.max(...p.map(p=>p.z))};}
export function schoolBoundsToWorld(b,rotation=0){return mappedBounds(b,p=>schoolPointToWorld(p,rotation));}
export function schoolBoundsToLocal(b,rotation=0){return mappedBounds(b,p=>schoolPointToLocal(p,rotation));}
export function changeFrame(object,parent,follow,offset){
 const previous=object.parent;previous?.updateWorldMatrix(true,false);parent.updateWorldMatrix(true,false);
 const transform=new THREE.Matrix4().copy(parent.matrixWorld).invert().multiply(previous?.matrixWorld||new THREE.Matrix4());
 parent.attach(object);
 if(follow){parent.attach(follow.camera);for(const key of ['focus','desired','position','probe'])follow[key]?.applyMatrix4(transform);const turn=Math.atan2(transform.elements[8],transform.elements[10]);for(const key of ['yaw','renderYaw'])if(Number.isFinite(follow[key]))follow[key]+=turn;}
}
