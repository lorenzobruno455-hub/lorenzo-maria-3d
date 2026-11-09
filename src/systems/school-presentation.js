// Match the legacy campus' distance/shadow budget without changing NPC routes.
export function schoolActorPresentation({id,floor,currentFloor,distance,quality,inspection=false}){
 const visible=floor===currentFloor&&!inspection&&(id==='maria'||distance<(quality==='low'?20:45));
 return{visible,castShadow:visible&&quality==='high'&&distance<15};
}
