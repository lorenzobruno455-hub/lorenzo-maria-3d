import {schoolPointToWorld,schoolBoundsToWorld} from './world-coordinates.js';
export const RECEPTION_APERTURE=Object.freeze({plane:11,center:-5.5,width:2.6,height:2.6});
export function schoolAccessLayout(rotation=Math.PI){
 const specifications=[{id:'court',name:'Portão da quadra',local:{x:-11,z:27},basis:-Math.PI/2,width:3,height:2.6,openAngle:Math.PI/2},
  {id:'school',name:'Portão da escola · dentro da quadra',local:{x:0,z:19},basis:0,width:2.6,height:2.6,openAngle:Math.PI/2},
  {id:'reception',name:'Entrada da recepção',local:{x:11,z:-5.5},basis:Math.PI/2,width:2.6,height:2.6,openAngle:-Math.PI/2}];
 return{rotation,gates:specifications.map(g=>({...g,...schoolPointToWorld(g.local,rotation),basis:g.basis+rotation})),court:schoolBoundsToWorld({minX:-11,maxX:11,minZ:19,maxZ:35,minY:0,maxY:4.15},rotation)};
}
