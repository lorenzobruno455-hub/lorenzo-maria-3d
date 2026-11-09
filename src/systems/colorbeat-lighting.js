import * as THREE from 'three';
export const COLORBEAT_LIGHT=Object.freeze({exposure:1,sun:{outside:1.8,inside:1.35},ambient:{outside:.86,inside:.72},fill:{low:6,medium:8,high:10},warm:'#FFF0D4',cool:'#DDEBFF'});
const skyOutside=new THREE.Color('#fff3df'),skyInside=new THREE.Color('#edf1ff'),ground=new THREE.Color('#536080');
export function updateColorbeatLighting({renderer,sun,hemisphere,indoors,dt,cinematic=false}){
 const t=1-Math.exp(-Math.max(0,dt)*3);
 renderer.toneMappingExposure=THREE.MathUtils.lerp(renderer.toneMappingExposure,COLORBEAT_LIGHT.exposure,t);
 if(cinematic)return; // CutsceneManager owns/restores the sun while a shot runs.
 sun.intensity=THREE.MathUtils.lerp(sun.intensity,indoors?COLORBEAT_LIGHT.sun.inside:COLORBEAT_LIGHT.sun.outside,t);
 hemisphere.intensity=THREE.MathUtils.lerp(hemisphere.intensity,indoors?COLORBEAT_LIGHT.ambient.inside:COLORBEAT_LIGHT.ambient.outside,t);
 hemisphere.color.lerp(indoors?skyInside:skyOutside,t);hemisphere.groundColor.lerp(ground,t);
}
