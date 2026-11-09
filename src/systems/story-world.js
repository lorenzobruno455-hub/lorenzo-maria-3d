import narratives from '../data/interactions.json' with { type: 'json' };
import * as THREE from 'three';
import { addLibraryDetails } from './library-garden07c.js';
import { batchMeshes } from './batching.js';
import { PropLibrary } from './prop-library.js';
import { surface, groundHeight } from './prop-placement.js';
export function createStoryWorld(scene, world, memories, games) {
 let disposed=false;
 const objects=[],resources=world.resources,owned=[],group=new THREE.Group(),library=new PropLibrary(resources);scene.add(group);
 const place=(kind,color,scale,x,y,z)=>{const m=resources.mesh(kind,color,scale);m.position.set(x,y,z);group.add(m);return m;};
 const bounds=(x,y,z,w,h,d)=>{const b={minX:x-w/2,maxX:x+w/2,minY:y-h/2,maxY:y+h/2,minZ:z-d/2,maxZ:z+d/2};world.solids.push(b);world.occluders.push(b);return b;};
 place('box','#b9b3a0',[8,.1,10],32,.05,-11);place('box','#74877b',[8.5,.2,10],32,3.6,-11);
 for(const x of [28.5,35.5]){place('box','#d9d2bd',[.22,3.5,.22],x,1.75,-7);bounds(x,1.75,-7,.22,3.5,.22);}
 place('box','#4a5350',[3,1.1,1],32,.65,-14);bounds(32,.65,-14,3,1.1,1);
 for(let i=0;i<14;i++)place('box',i%3?'#eee8db':'#353d3b',[.16,.06,.4],30.9+i*.17,1.23,-13.5);
 world.sign('SALA DE MÚSICA',32,3.2,-6.4,4);world.sign('HISTÓRIA · MEMÓRIAS',-17,3.2,-5.6,3.6);world.sign('ESPAÇO DE REFLEXÃO',-24,2.2,21,4);
 place('box','#a59372',[3,.2,1],-24,.7,20);bounds(-24,.7,20,3,.2,1);
 for(const x of [-25,-23])place('box','#586b68',[.12,.6,.7],x,.3,20);
 const staticProps=[], placed=[];
 function table(id,x,z){const t=library.place(group,'desk',surface(`${id}:floor`,x,z,2.5,1.2,groundHeight(x,z)),{scale:.6});staticProps.push(t);placed.push(t);library.collider(t,world);return library.tableSurface(t);}
 const supportMap=new Map();
 const add=(kind,id,name,x,z,color,model='book',support=null)=>{
  const s=support||supportMap.get(`${x},${z}`)||table(id,x,z);supportMap.set(`${x},${z}`,s);
  const mesh=library.place(group,model,s,{x,z,color});placed.push(mesh);
  mesh.userData.inkDynamic=true;
  const item={kind,id,name,x,z,mesh,height:s.height+.05,beacon:null};objects.push(item);return item;
 };
 const album=add('album','album','Álbum de memórias',20,-7,'#aa8a64');
 for(const g of games.filter(g=>g.playable))add('game',g.id,g.title,g.position.x,g.position.z,'#6b8179',g.id==='rit'?'headphones':'book');
 add('secret','moon','Pequena lua',-30,19,'#ddd3a1','letter');
 // Every original location now has a physical support and a distinct narrative prop.
 const memoryObjects=new Map();const models=['book','letter','book','photo','flowers','letter'];
 for(const [i,m] of memories.entries())memoryObjects.set(m.id,add('memory',m.id,m.title,m.position.x,i===2?20:m.position.z-.35,['#836457','#6b8179','#8b7b91'][i%3],models[i],i===2?surface('reflection-bench',-24,20,3,1,.8):null));
 // Dedicated reading console: six individual books; stable IDs point to original records.
 const counter=place('box','#b99b70',[4,.12,.9],11.5,1.02,-15.5);const counterBounds=bounds(11.5,1.02,-15.5,4,.12,.9);
 place('box','#8d6e52',[4,1.4,.06],11.5,1.8,-15.94);place('box','#b99b70',[4,.08,.7],11.5,2.52,-15.62);for(const x of [9.52,13.48])place('box','#b99b70',[.08,1.5,.8],x,1.8,-15.57);
 for(const x of [9.8,13.2])place('box','#586b68',[.08,.96,.6],x,.6,-15.5);
 const shelf=surface('memory-console',11.5,-15.5,4,.9,1.08,counter);world.surfaces.push(shelf);
 world.sign('BIBLIOTECA DAS MEMÓRIAS',11.5,2.8,-16.5,5.4);
 const books=memories.map((m,i)=>{const x=10.1+i*.56,o=add('memory-book',m.id,m.title,x,-15.5,['#836457','#6b8179','#8b7b91'][i%3],'memory-book',shelf);const lock=resources.mesh('box','#c4ad7a',[.045,.02,.08]);lock.position.set(.18,.082,0);o.mesh.add(lock);o.lock=lock;o.ignoreCollider=counterBounds;o.memory=m;o.order=i;
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=384;const ctx=canvas.getContext('2d');
 const drawCover=()=>{ctx.fillStyle=['#6a493c','#405a52','#5d4e65'][i%3];ctx.fillRect(0,0,256,384);ctx.strokeStyle='#c4ad7a';ctx.lineWidth=3;ctx.strokeRect(14,14,228,356);ctx.fillStyle='#fff5dc';ctx.textAlign='center';ctx.font='700 22px "Barlow Condensed",sans-serif';
 let line='',row=95;for(const word of m.title.split(' ')){if((line+' '+word).length>18){ctx.fillText(line.trim(),128,row,218);row+=27;line='';}line+=' '+word;}ctx.fillText(line.trim(),128,row,218);ctx.font='15px "Atkinson Hyperlegible",sans-serif';ctx.fillText(m.date,128,290);ctx.fillText(m.rarity,128,325);};drawCover();
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;document.fonts?.ready.then(()=>{if(!disposed){drawCover();map.needsUpdate=true;}});const mat=new THREE.MeshToonMaterial({map,gradientMap:resources.toonRamp()});const title=new THREE.Mesh(resources.geometry('box'),mat);title.scale.set(.39,.001,.54);title.position.set(.23,.007,0);title.rotation.y=Math.PI;o.mesh.userData.cover.add(title);owned.push(map,mat);
 const label=world.sign(`${i+1} · ${m.date}`,x,.91,-15.02,.51);label.material.depthWrite=true;return o;});
 let selected=null,opening=null,openness=0;
 for(const n of narratives){if(n.id==='reflection-seat'){objects.push({id:n.id,kind:'seat',name:n.name,x:-24,z:19,mesh:null,height:.8});continue;}const existing=world.placed.find(p=>p.name==='desk'&&p.position.x===n.x&&p.position.z===n.z);const support=n.id==='music-headphones'?surface('piano-top',32,-14,3,1,1.2):existing?library.tableSurface(existing):null;const shared=n.id==='garden-letter'?supportMap.get(`${n.x},${n.z-.35}`):null;add('narrative',n.id,n.name,shared?n.x+.4:n.x,shared?n.z-.35:n.z,'#6b8179',n.prop,shared||support);}
 function highlight(target){selected=target?.ref||target;}
 function openBook(id){opening=books.find(b=>b.id===id)||null;}
 function update(campaign,time,focus,dt=.016,player=null,quality="medium"){
  for(const o of objects) if(o.mesh)o.mesh.visible=!player||Math.hypot(player.x-o.x,player.z-o.z)<(quality==='low'?21:65);
  for(const m of memories){const o=memoryObjects.get(m.id),i=memories.indexOf(m);o.mesh.visible=o.mesh.visible&&i<=campaign.memories.length;}
  openness=THREE.MathUtils.damp(openness,focus&&opening?1:0,9,dt);
  for(const b of books){const unlocked=campaign.memories.includes(b.id);b.unlocked=unlocked;b.lock.visible=!unlocked;b.mesh.userData.cover.rotation.z=b===opening?openness*1.9:0;
   // Small brass index tab appears only near the selected object, no permanent beacon.
   b.mesh.scale.setScalar((b.displayScale??1)*(selected===b?1.025:1));
  }
 }
 addLibraryDetails(place);
 for(const z of [-14,-10,-7.5])bounds(27.3,1.52,z,.62,2.9,2.3);
 const staticMeshes=[];for(const p of staticProps){p.userData.staticBounds=new THREE.Box3().setFromObject(p).clone();}for(const p of staticProps)p.traverse(m=>{if(m.isMesh)staticMeshes.push(m);});
 const dynamic=new Set(objects.filter(o=>o.mesh).map(o=>o.mesh));batchMeshes(group,[...group.children.filter(m=>m.isMesh&&!dynamic.has(m)),...staticMeshes],owned);
 // Keep all interactive/placed/actor descendants independent when consolidating scenery.
 const scenery=scene.children.flatMap(node=>node.isMesh?[node]:node.children).filter(m=>{
  if(!m.isMesh||!m.userData.inkStatic)return false;
  for(let p=m;p;p=p.parent)if(p.userData.inkDynamic||p.userData.placement||p.userData.inkActor)return false;
  return true;
 });
 batchMeshes(group,scenery,owned);
 return {narratives,objects,books,placed,highlight,openBook,update,album,dispose(){disposed=true;group.removeFromParent();owned.forEach(g=>g.dispose());}};
}
