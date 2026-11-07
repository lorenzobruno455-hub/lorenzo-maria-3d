import { segmentHit } from './physics.js';
export class InteractionRegistry {
 constructor(world,getState=()=>({})) {this.world=world;this.getState=getState;this.entries=new Map();}
 register(entry) {if(!entry.id||this.entries.has(entry.id))throw new Error(`Interação duplicada: ${entry.id}`);const e={type:'examine',distance:2.3,requirements:()=>true,dialogue:null,quest:null,reward:null,persistent:false,...entry};this.entries.set(e.id,e);return()=>this.entries.delete(e.id);}
 nearest(position) {
  const list=[];
  for(const e of this.entries.values()) {const o=e.object;if(!o||o.mesh?.visible===false||!e.requirements(this.getState()))continue;const distance=Math.hypot(position.x-o.x,position.z-o.z);if(distance>e.distance)continue;
   const from={x:position.x,y:(position.y||0)+1.45,z:position.z},to={x:o.x,y:e.height??o.mesh?.position.y??1.3,z:o.z};
   if(this.world.occluders.some(b=>b.enabled!==false&&b!==e.ignoreCollider&&segmentHit(from,to,b,.015)!==null))continue;
   list.push({...o,ref:o,interactionId:e.id,distance,priority:e.priority||0});
  }
  list.sort((a,b)=>(a.distance-a.priority)-(b.distance-b.priority));return list[0]||null;
 }
 activate(id,position) {const target=this.nearest(position);if(!target||target.interactionId!==id)return false;this.entries.get(id).action(target);return true;}
 dispose(){this.entries.clear();}
}
