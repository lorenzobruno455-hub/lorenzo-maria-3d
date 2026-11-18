import {Vector3} from 'three';
import {cameraFraction} from './physics.js';

// Direction only: no canonical lines, historical assertions or saved progress here.
export const CINEMATIC_DIRECTIONS=Object.freeze({
 'CAP01-CENA02':{label:'A',mode:'object',object:'Chromebook',reaction:3,gesture:'react',tail:.65},
 'CAP01-CENA05':{label:'B',mode:'messages',object:'Mensagens · reconstrução narrativa',tail:.5},
 'CAP01-CENA08':{label:'C',mode:'classes',object:'Passagem das aulas',tail:.4},
 'CAP01-CENA09':{label:'C',mode:'conversation',reaction:7,gesture:'react',tail:.8,bell:true},
 'CAP05-CENA01':{label:'D',mode:'object',object:'Flores · símbolo do arquivo',gesture:'observe',tail:.8},
 'CAP06-CENA01':{label:'E',mode:'document',object:'Pedido de namoro · registro documental',tail:.7},
 'CAP06-CENA03':{label:'E',mode:'document',object:'Álbum · fatos preservados',tail:.6},
 'EP-CENA01':{label:'F',mode:'diary',object:'Diário de bordo',tail:1},
});

/** Same collision volumes as gameplay; constrain sightline AND inter-frame travel. */
export function protectCinematicCamera(focus,desired,previous,obstacles=[]){
 const safe=desired.clone();safe.lerpVectors(focus,safe,cameraFraction(focus,safe,obstacles,.24));
 if(previous)safe.lerpVectors(previous,safe,cameraFraction(previous,safe,obstacles,.18));
 return safe;
}

export function buildCinematicScene(id,lines,{camera,actors,point,toLocal=p=>p,obstacles=()=>[],onBeat=()=>{},onEnd=()=>{}}){
 const direction=CINEMATIC_DIRECTIONS[id];if(!direction)return null;
 const origin=new Vector3(point.x,point.y||0,point.z),player=actors.lorenzo;
 const localActor=actor=>toLocal(actor.root.getWorldPosition(new Vector3()));
 const playerPos=player?localActor(player):origin.clone();
 const nearby=Object.entries(actors).filter(([,a])=>a?.root&&a.root.visible&&localActor(a).distanceTo(playerPos)<6&&Math.abs(localActor(a).y-playerPos.y)<1.5);
 const cast=Object.fromEntries(nearby);
 let serial=0;
 const framing=(focus,distance=3.2,side=1)=>{
  const offset=camera.position.clone().sub(focus);offset.y=0;if(offset.lengthSq()<.01)offset.set(1,0,1);offset.normalize();
  const tangent=new Vector3(offset.z,0,-offset.x).multiplyScalar(side*.35);
  const end=focus.clone().addScaledVector(offset,distance).add(tangent);end.y=focus.y+.45;
  return {to:end.toArray(),lookAt:focus.toArray(),protect:true};
 };
 const objectFocus=origin.clone().add(new Vector3(0,(point.top??.85)+.35,0));
 const focusPlayer=playerPos.clone().add(new Vector3(0,1.3,0));
 const beats=lines.map((line,index)=>{
  const actor=cast[line.speakerId],position=actor?localActor(actor):null;
  const focus=position?position.clone().add(new Vector3(0,1.42,0)):direction.mode==='conversation'?focusPlayer:objectFocus;
  const reaction=index===direction.reaction;
  const state=reaction?direction.gesture||'react':line.speakerId==='narrator'?'observe':index%4===0?'talk':index%4===2?'point':'observe';
  const actorCommands=nearby.map(([key,a])=>{
   const other=nearby.find(([,v])=>v!==a)?.[1];
   const target=position&&a!==actor?position:other?localActor(other):origin;
   // Root headings are world-based; let the manager resolve the explicit local gaze target.
   return {id:key,state:key===line.speakerId?state:'observe',gaze:target.clone().add(new Vector3(0,1.5,0)).toArray(),lookAt:target.toArray()};
  });
  return {line:index,camera:framing(focus,reaction?2.25:direction.mode==='object'||direction.mode==='document'?2.9:3.5,index%2?-.4:.4),actors:actorCommands,effect:()=>onBeat({direction,line,index,serial:++serial})};
 });
 return {id:`script:${id}`,direction:direction.label,obstacles,shots:[
  {duration:.65,camera:framing(direction.mode==='conversation'?focusPlayer:objectFocus,4.2),actors:nearby.map(([key])=>({id:key,state:'observe'}))},
  {duration:.15,waitForDialogue:true,interruptOnClose:true,dialogue:lines,beats},
  {duration:direction.tail,camera:framing(objectFocus,3.5),actors:nearby.map(([key])=>({id:key,state:'observe'})),effect:()=>onEnd(direction)},
 ]};
}
