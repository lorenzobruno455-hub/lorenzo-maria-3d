import { batchMeshes } from './batching.js';
import * as THREE from 'three';
import catalogue from '../data/props.json' with { type: 'json' };
import { placeOn, colliderFor, surface } from './prop-placement.js';
export class PropLibrary {
 constructor(resources){this.resources=resources;this.instances=[];}
 create(id,{color='#8d6e52',label=''}={}){
  const definition=catalogue.find(p=>p.id===id);if(!definition)throw new Error(`Prop desconhecido: ${id}`);
  const g=new THREE.Group();g.name=id;g.userData.propId=id;g.userData.definition=definition;
  const part=(kind,c,s,p)=>{const m=this.resources.mesh(kind==='box'&&['desk','chair'].includes(id)?'rounded':kind,c,s,c==='#586b68'?'metal':['#b99b70','#8d6e52'].includes(c)?'wood':'plain');m.position.set(...p);g.add(m);return m;};
  const box=(c,s,p)=>part('box',c,s,p),metal='#586b68',wood='#b99b70',paper='#e8dfc9';
  if(id==='desk') {box(wood,[2.5,.08,1.2],[0,.84,0]);box(metal,[2.25,.06,.06],[0,.32,.4]);for(const x of [-1,1])for(const z of [-.43,.43])part('cylinder',metal,[.028,.8,.028],[x,.4,z]);box(metal,[2,.035,.55],[0,.61,0]);for(const x of [-1,1]){box(metal,[.05,.05,.92],[x,.72,0]);for(const z of [-.43,.43])part('cylinder','#414c4d',[.036,.04,.036],[x,.02,z]);}for(const x of [-1.13,1.13])for(const z of [-.49,.49])part('sphere','#586b68',[.012,.005,.012],[x,.885,z]);}
  else if(id==='chair') {box(wood,[.5,.055,.48],[0,.465,0]);box(wood,[.5,.23,.045],[0,.755,.23]);for(const x of [-.21,.21])for(const z of [-.19,.19]){part('cylinder',metal,[.022,.44,.022],[x,.22,z]);part('cylinder','#414c4d',[.028,.035,.028],[x,.0175,z]);}for(const x of [-.21,.21])part('cylinder',metal,[.02,.42,.02],[x,.66,.22]);}
  else if(id==='shelf') {for(const x of [-1.85,1.85])box(wood,[.1,2.8,.5],[x,1.4,0]);box('#8d6e52',[3.6,2.7,.035],[0,1.4,-.23]);for(const y of [.08,.73,1.38,2.03,2.72])box(wood,[3.8,.08,.5],[0,y,0]);for(let row=0;row<4;row++)for(let i=0;i<17;i++){const h=.35+(i%4)*.05;box(['#836457','#6b8179','#b09a6c'][i%3],[.13,h,.28],[-1.65+i*.2,.12+row*.65+h/2,.02]);}}
  else if(['book','memory-book','mission-notebook'].includes(id)){box(color,[.46,.012,.62],[0,.006,0]);box(paper,[.43,.048,.58],[.008,.036,0]);const pivot=new THREE.Group();pivot.position.set(-.23,.066,0);g.add(pivot);const cover=this.resources.mesh('box',color,[.46,.012,.62]);cover.position.x=.23;pivot.add(cover);box(color,[.02,.075,.62],[-.22,.0375,0]);box('#c4ad7a',[.28,.002,.025],[.01,.073,-.12]);box('#c4ad7a',[.16,.002,.015],[.01,.073,.04]);g.userData.cover=pivot;}
  else if(id==='photo'){box(wood,[.48,.045,.38],[0,.0225,0]);box(paper,[.42,.012,.32],[0,.051,0]);box('#8c9f8b',[.36,.002,.23],[0,.058,0]);}
  else if(id==='letter'){box(paper,[.4,.018,.28],[0,.009,0]);const fold=box('#d4c9ae',[.26,.005,.13],[0,.02,-.045]);fold.rotation.y=.12;}
  else if(id==='lamp'){part('cylinder',metal,[.13,.025,.13],[0,.0125,0]);part('cylinder',metal,[.018,.4,.018],[0,.22,0]);part('sphere','#a5ad96',[.18,.09,.18],[0,.46,0]);part('sphere','#e8dfc9',[.13,.012,.13],[0,.43,0]);}
  else if(id==='flowers'){part('cylinder','#aa8265',[.13,.2,.13],[0,.1,0]);part('cylinder','#6d7458',[.115,.015,.115],[0,.2,0]);for(let i=0;i<5;i++){const a=i*2.4,x=Math.cos(a)*.085,z=Math.sin(a)*.085,h=.27+(i%2)*.08;part('cylinder','#698756',[.009,h,.009],[x,.2+h/2,z]);part('sphere','#cfae94',[.065,.035,.065],[x,.2+h,z]);}}
  else if(id==='headphones'){for(const x of [-.13,.13])part('sphere',metal,[.065,.05,.1],[x,.05,0]);for(let i=0;i<8;i++){const a=Math.PI*i/7;part('sphere',metal,[.035,.025,.035],[Math.cos(a)*.13,.035,-Math.sin(a)*.17]);}}
  else box(wood,[1,.8,.06],[0,.4,0]);
  g.userData.label=label;
  const owned=[];batchMeshes(g,g.children.filter(m=>m.isMesh),owned);
  g.children.filter(m=>m.isMesh).forEach((m,i)=>{const key=`prop:${id}:${color}:${i}`,cached=this.resources.geometries.get(key);if(cached){m.geometry.dispose();m.geometry=cached;}else this.resources.geometries.set(key,m.geometry);});
  this.instances.push(g);return g;
 }
 place(parent,id,support,options={}) {const object=this.create(id,options);parent.add(object);placeOn(object,support,options);return object;}
 collider(object,world,extra={}) {const b=colliderFor(object,extra);world.solids.push(b);world.occluders.push(b);return b;}
 tableSurface(object){const b=colliderFor(object);return surface(`${object.uuid}:top`,(b.minX+b.maxX)/2,(b.minZ+b.maxZ)/2,b.maxX-b.minX,b.maxZ-b.minZ,b.maxY);}
}
