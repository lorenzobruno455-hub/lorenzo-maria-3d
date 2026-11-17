import{CONTINUOUS_BOUNDS as B}from'./world-coordinates.js';
// Wall faces preserve both hard map bounds and the existing northern campus exclusion.
export const PERIMETER=[[-38.52,29.52],[82.52,29.52],[82.52,-37.52],[37.84,-37.52],[37.84,-27.16],[-38.52,-27.16]];
export const LANDSCAPE_ZONES=[[-34,17.5,'Bosque oeste'],[-34,24.7,'Bosque do jardim'],[-29,-23.5,'Bosque norte'],[-20,-23.5,'Jardim da literatura'],[-11,-23.5,'Jardim de estudo'],[-16,26,'Jardim sul'],[24,26,'Jardim de convivência'],[34,26,'Bosque da transição'],[56,26,'Jardim do caminho'],[66,26,'Bosque sul do São Jorge'],[78,-31,'Bosque da quadra'],[78,-16,'Jardim da quadra'],[78,-2,'Bosque leste'],[78,13,'Jardim do São Jorge'],[78,25,'Bosque sudeste']];
const keepouts=[[-30,38,-18,-5],[-8,8,-28,29],[40,46,-37,22],[6,76,18,22],[48.2,72,-35.5,19.5],[42,76,-37,-34.3],[72,76,-37,-24]];
export function perimeterBoxes(){return PERIMETER.map(([x,z],i)=>{const [xx,zz]=PERIMETER[(i+1)%PERIMETER.length];return{minX:Math.min(x,xx)-.16,maxX:Math.max(x,xx)+.16,minZ:Math.min(z,zz)-.16,maxZ:Math.max(z,zz)+.16,minY:-.05,maxY:3.55,kind:'map-perimeter'};});}
export function createLandscapePlan({solids=[],points=[]}={}){
 const trees=[],patches=[];
 const clear=(x,z,r)=>x-r>B.minX+1&&x+r<B.maxX-1&&z-r>B.minZ+1&&z+r<B.maxZ-1&&!(x<38&&z-r< -25.8)&&!keepouts.some(([a,b,c,d])=>x+r>a&&x-r<b&&z+r>c&&z-r<d)&&!solids.some(b=>b.enabled!==false&&(b.minY??0)<2&&(b.maxY??3)>.1&&x+r>b.minX&&x-r<b.maxX&&z+r>b.minZ&&z-r<b.maxZ)&&!points.some(p=>Number.isFinite(p.x)&&Math.hypot(x-p.x,z-p.z)<r+2.1);
 for(const [i,[x,z,name]]of LANDSCAPE_ZONES.entries()){
  const patch={x,z,name,trees:[],flowers:[],shrubs:[],bed:i%3!==0};
  for(const[j,[dx,dz]]of[[-1.1,-.65],[1,-.3],[0,1.2]].entries()){
   const p={x:x+dx+(i%3-1)*.11,z:z+dz,scale:.82+((i*7+j*3)%9)*.045};if(clear(p.x,p.z,.8)&&!trees.some(t=>Math.hypot(t.x-p.x,t.z-p.z)<1.7)){trees.push(p);patch.trees.push(p);}
  }
  for(let j=0;j<12;j++){const a=j*2.399+i*.7,r=.6+(j%4)*.35,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;if(clear(px,pz,.22))patch.shrubs.push({x:px,z:pz,scale:.25+(j%3)*.08});}
  for(let j=0;j<8;j++){const a=j*.82+i,px=x+Math.cos(a)*1.55,pz=z+Math.sin(a)*1.1;if(clear(px,pz,.12))patch.flowers.push({x:px,z:pz,color:['#FF3194','#FFDA31','#FF503A'][j%3]});}
  if(patch.trees.length||patch.shrubs.length||patch.flowers.length)patches.push(patch);
 }
 // Low, bounded reception planters lie between the existing fence and facade, away from the gate.
 for(const z of[.5,10.5])patches.push({x:47.5,z,name:'Canteiro da recepção',bed:true,narrow:true,trees:[],shrubs:[{x:47.5,z,scale:.3}],flowers:Array.from({length:6},(_,i)=>({x:47.4+(i%2)*.2,z:z-.8+Math.floor(i/2)*.7,color:i%2?'#FFDA31':'#FF3194'}))});
 return{trees,patches,walls:perimeterBoxes()};
}
