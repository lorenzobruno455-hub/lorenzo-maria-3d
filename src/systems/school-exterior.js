import * as THREE from 'three';
import {batchMeshes} from './batching.js';
import {SCHOOL_ORIGIN} from './world-coordinates.js';

// Confirmed topology; dimensions remain adaptations in game units, not surveyed measures.
import {schoolAccessLayout} from './school-access-layout.js';
const access=schoolAccessLayout(Math.PI);
export const EXTERIOR_PROPOSAL=Object.freeze({approved:true,schoolRotation:Math.PI,
 facade:'photo-street-side',campusFace:'reception-side',gates:access.gates,
 annex:Object.freeze({minX:49,maxX:71,minZ:19,maxZ:35,eave:4.15,rise:1.8}),
 court:access.court,corridorDoor:access.gates.find(g=>g.id==='school'),
});

function roofGeometry(a,fascia=false){
 const positions=[],uv=[],indices=[],segments=12,x1=a.minX-.25,x2=a.maxX+.25;
 for(let i=0;i<=segments;i++){
  const t=i/segments,z=THREE.MathUtils.lerp(a.minZ,a.maxZ+.25,t),y=a.eave+Math.sin(Math.PI*t)*a.rise;
  positions.push(x1,y,z,fascia?x1:x2,fascia?3.45:y,z);uv.push(t,1,t,0);
  if(i<segments){const k=i*2;indices.push(k,k+2,k+1,k+2,k+3,k+1);}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}

export function createSchoolExterior({scene,world}){
 const r=world.resources,group=new THREE.Group(),annex=new THREE.Group(),owned=[],materials=[],textures=[];
 const frame=new THREE.Group(),roofMeshes=[];frame.position.x=SCHOOL_ORIGIN.x;frame.rotation.y=Math.PI;group.position.x=-SCHOOL_ORIGIN.x;frame.add(group);
 group.name='São Jorge photo exterior';annex.name='São Jorge annex';group.add(annex);scene.add(frame);
 const stats={floors:3,windows:0,label:'COLÉGIO SÃO JORGE',bands:['blue-middle','pink-upper'],fixedInteriorChanges:0,structuralYellowBeams:0};
 function box(parent,color,x,y,z,w,h,d,kind='plain'){
  const m=r.mesh('box',color,[w,h,d],kind);m.position.set(x,y,z);parent.add(m);return m;
 }
 // Thin external finish borrows the existing three-floor footprint and heights.
 const front=SCHOOL_ORIGIN.x-11.30;
 for(let floor=0;floor<3;floor++){
  const base=floor*3.6;
  box(group,'#FFF1D6',front,base+1.8,0,.10,3.6,38);
  if(floor>0)box(group,floor===2?'#FF3194':'#2250FF',front-.065,base+1.98,0,.06,1.64,38);
  for(const z of [-16,-12,-8,-4,0,4,8,12,16]){
   box(group,'#101521',front-.10,base+1.98,z,.06,1.49,2.64);
   box(group,'#A9CED5',front-.14,base+1.98,z,.025,1.31,2.46,'glass');
   for(const dz of [-1.25,0,1.25])box(group,'#FFF8E9',front-.17,base+1.98,z+dz,.035,1.38,.045,'emissive');
   stats.windows++;
  }
 }
 box(group,'#FFF1D6',60,10.92,0,22.6,.18,38.4);
 box(group,'#101521',front-.11,10.81,0,.045,.055,38.4);
 // Observed front railings; the campus side opens onto the confirmed reception portal.
 const fenceX=46.8;
 for(const z of [-19.3,-10,0,10,18.6]){
  box(group,'#101521',fenceX,1.0,z,.15,2,.15);
  box(group,'#FFFDF3',fenceX-.02,1.0,z,.10,1.94,.10,'emissive');
 }
 for(const y of [.15,.92,1.78])box(group,'#FFFDF3',fenceX-.06,y,-.35,.045,.065,38,'emissive');
 for(let z=-19.1;z<18.7;z+=.55)box(group,'#FFFDF3',fenceX-.06,.97,z,.035,1.72,.035,'emissive');
 // The campus-facing side has an opening aligned with the reception portal.
 for(const [lo,hi]of [[-19,-7.1],[-3.9,19]]){
  for(const y of [.15,.92,1.78])box(group,'#FFFDF3',73.2,y,(lo+hi)/2,.045,.065,hi-lo,'emissive');
  for(let z=lo;z<hi;z+=.55)box(group,'#FFFDF3',73.2,.97,z,.035,1.72,.035,'emissive');
 }
 const a=EXTERIOR_PROPOSAL.annex;
 box(annex,'#69717D',(a.minX+a.maxX)/2,.005,(a.minZ+a.maxZ)/2,a.maxX-a.minX,.05,a.maxZ-a.minZ,'tile');
 // Three perimeter walls; the shared school wall keeps its original inner gate.
 for(const [lo,hi]of [[19,25.5],[28.5,35]])box(annex,'#2250FF',a.minX,1.64,(lo+hi)/2,.24,3.28,hi-lo);
 box(annex,'#2250FF',a.minX,2.94,27,.24,.68,3);
 box(annex,'#2250FF',a.maxX,1.64,27,.24,3.28,16);
 box(annex,'#2250FF',60,1.64,a.maxZ,22,3.28,.24);
 box(annex,'#19264D',a.minX-.055,3.38,(a.minZ+a.maxZ)/2,.13,.20,a.maxZ-a.minZ+.25);
 for(const [fascia,color]of [[false,'#C94742'],[true,'#FF503A']]){
  const geometry=roofGeometry(a,fascia),material=new THREE.MeshToonMaterial({color,side:THREE.DoubleSide,gradientMap:r.toonRamp()});
  r.colorbeat.decorate?.(material);materials.push(material);owned.push(geometry);
  const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=mesh.receiveShadow=true;annex.add(mesh);if(!fascia)roofMeshes.push(mesh);
 }
 for(let i=0;i<12;i++){
  const t=i/12,u=(i+1)/12,z=THREE.MathUtils.lerp(a.minZ,a.maxZ+.25,t),zz=THREE.MathUtils.lerp(a.minZ,a.maxZ+.25,u),y=a.eave+Math.sin(Math.PI*t)*a.rise,yy=a.eave+Math.sin(Math.PI*u)*a.rise;
  const edge=box(annex,'#101521',a.minX-.285,(y+yy)/2,(z+zz)/2,.055,.06,Math.hypot(zz-z,yy-y));edge.rotation.x=-Math.atan2(yy-y,zz-z);
 }
 box(annex,'#101521',a.minX-.29,3.45,(a.minZ+a.maxZ)/2,.055,.055,a.maxZ-a.minZ+.5);
 // Only the main name is transcribed; secondary text/crest are not confirmed.
 const labelGeometry=new THREE.PlaneGeometry(15.5,.72);labelGeometry.rotateY(-Math.PI/2);owned.push(labelGeometry);
 let map=null;
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const c=canvas.getContext('2d');
  c.fillStyle='#FFF1D6';c.fillRect(0,0,512,128);c.fillStyle='#101521';c.font='bold 43px "Barlow Condensed",sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(stats.label,256,34,492);c.font='bold 44px \"Barlow Condensed\",sans-serif';c.fillText('RECEPÇÃO',256,96,492);
  map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.generateMipmaps=false;map.minFilter=THREE.LinearFilter;textures.push(map);
 }
 const uv=labelGeometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,.5+uv.getY(i)*.5);
 const labelMaterial=new THREE.MeshBasicMaterial({map,color:map?'#ffffff':'#FFF1D6',toneMapped:false});materials.push(labelMaterial);
 const label=new THREE.Mesh(labelGeometry,labelMaterial);label.name='Photo reference school name';label.position.set(front-.20,10.35,-2);group.add(label);
 const receptionGeometry=new THREE.PlaneGeometry(2.6,.34);receptionGeometry.rotateY(Math.PI/2);const ruv=receptionGeometry.attributes.uv;for(let i=0;i<ruv.count;i++)ruv.setY(i,ruv.getY(i)*.5);owned.push(receptionGeometry);const receptionLabel=new THREE.Mesh(receptionGeometry,labelMaterial);receptionLabel.position.set(71.20,2.87,-5.5);group.add(receptionLabel);
 // Batch only primitives; roof and label own their buffers separately.
 batchMeshes(group,group.children.filter(m=>m.isMesh&&m!==label&&m!==receptionLabel),owned);
 batchMeshes(annex,annex.children.filter(m=>m.isMesh&&m.geometry===r.geometry('box')),owned);
 let disposed=false;
 return{group:frame,setReview(view){for(const mesh of roofMeshes)mesh.visible=view!=='entry';},state(){return{...stats,proposal:EXTERIOR_PROPOSAL,draws:group.children.length+annex.children.length-1};},dispose(){if(disposed)return;disposed=true;frame.removeFromParent();owned.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}
