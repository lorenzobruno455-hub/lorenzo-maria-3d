import * as THREE from 'three';
import {LineSegments2} from 'three/addons/lines/LineSegments2.js';
import {LineSegmentsGeometry} from 'three/addons/lines/LineSegmentsGeometry.js';
import {LineMaterial} from 'three/addons/lines/LineMaterial.js';

// D1 is an opt-in visual study. No architecture, navigation or saved data changes.
export const OVERDRIVE_20_STUDIES=Object.freeze({
 a:Object.freeze({name:'Tinta solar',floor:'#327EDB',paper:'#FFF1C6',shadow:'#2250FF',ink:'#101521',width:2.2,low:.38,high:.69}),
 b:Object.freeze({name:'Sombra elétrica',floor:'#6044C9',paper:'#FFD7A0',shadow:'#903BFF',ink:'#101521',width:2.8,low:.48,high:.78}),
});

export function decorateOverdrive20Material(material,variant){
 if(!material.isMeshToonMaterial||!OVERDRIVE_20_STUDIES[variant])return()=>{};
 const study=OVERDRIVE_20_STUDIES[variant],compile=material.onBeforeCompile,key=material.customProgramCacheKey;
 material.customProgramCacheKey=()=>key.call(material)+`:overdrive-20-${variant}-d1`;
 material.onBeforeCompile=shader=>{
  compile.call(material,shader);
  const values={Floor:study.floor,Paper:study.paper,Shadow:study.shadow,Pink:'#FF3194',Blue:'#2250FF',Green:'#21D75B',Aqua:'#16D9D4',Sun:'#FFE238',Coral:'#FF503A',Ink:study.ink};
  for(const[name,value]of Object.entries(values))shader.uniforms['co20'+name]={value:new THREE.Color(value)};
  shader.fragmentShader=Object.keys(values).map(n=>`uniform vec3 co20${n};`).join('\n')+'\n'+shader.fragmentShader;
  const effect=/* glsl */`
   // World normals retain skinned/instanced transforms from the existing pipeline.
   if(coFamily<5.){
    vec3 n20=normalize((vec4(normal,0.)*viewMatrix).xyz);
    vec3 base20=diffuseColor.rgb;
    float hi20=max(max(base20.r,base20.g),base20.b);
    float lo20=min(min(base20.r,base20.g),base20.b);
    vec3 pigment20=base20;
    if(base20.g>base20.r*1.04&&base20.g>base20.b*1.12){
     pigment20=mix(co20Green,co20Aqua,step(.7,base20.b/max(base20.g,.001))*.65);
     pigment20*=.82+.18*step(.5,mod(floor(cbWorldPosition.x/3.)+floor(cbWorldPosition.z/3.),2.));
    }else if(coFamily==2.||(coFamily==1.&&n20.y>.9&&mod(cbWorldPosition.y,3.6)<.12))pigment20=co20Floor;
    else if(coFamily==1.)pigment20=mix(co20Coral,co20Sun,.68);
    else if(hi20-lo20<.20&&hi20>.38)pigment20=co20Paper;
    else if(hi20>.07)pigment20=base20/max(hi20,.001)*min(hi20*1.25,.95);
    // Color study only: bands on existing exterior faces, never new wall volumes.
    vec3 p20=cbWorldPosition-vec3(60.,0.,0.);
    bool facade20=(abs(p20.x)>10.88&&abs(p20.x)<11.2&&abs(p20.z)<19.2&&p20.x*n20.x>0.)||
      (abs(p20.z)>18.88&&abs(p20.z)<19.2&&abs(p20.x)<11.2&&p20.z*n20.z>0.);
    if(facade20&&hi20-lo20<.20&&hi20>.38&&abs(n20.y)<.2){
     float row20=mod(p20.y,3.6);
     if(row20>1.15&&row20<2.8&&p20.y>3.6)pigment20=p20.y>7.2?co20Pink:co20Blue;
    }
    float facing20=dot(n20,normalize(vec3(-.7,.8,-.5)))*.5+.5;
    // Orientation bands keep volumes legible even when several interior fills overlap.
    float band20=step(${study.low},facing20)+step(${study.high},facing20);
    vec3 dark20=mix(pigment20*.36,co20Shadow*.42,.38);
    vec3 mid20=pigment20*${variant==='a'?'.70':'.61'};
    vec3 bright20=pigment20;
    vec3 graphic20=band20<.5?dark20:(band20<1.5?mid20:bright20);
    float lum20=dot(base20,vec3(.2126,.7152,.0722));
    float energy20=dot(reflectedLight.directDiffuse,vec3(.2126,.7152,.0722))/max(lum20,.008);
    graphic20=mix(dark20,graphic20,.55+.45*smoothstep(.06,.22,energy20));
    // Near-black authored markings stay dark; atlas text and transparent glazing are excluded.
    outgoingLight=mix(base20,graphic20,smoothstep(.008,.045,lum20));
   }
  `;
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',effect+'\n#include <opaque_fragment>');
 };
 material.needsUpdate=true;let disposed=false;
 return()=>{if(disposed)return;disposed=true;material.onBeforeCompile=compile;material.customProgramCacheKey=key;material.needsUpdate=true;};
}

// A single selected-edge batch per streamed root. No screen postprocess, no
// silhouette pass over every mesh, no triangle diagonals, no extra shadow casters.
export function createOverdrive20Ink({school,variant}){
 const study=OVERDRIVE_20_STUDIES[variant],roots=new WeakSet(),owned=[];
 const material=new LineMaterial({color:study.ink,linewidth:study.width,worldUnits:false,depthTest:true,depthWrite:false,alphaToCoverage:true,toneMapped:false});
 function attach(root,detailed=false){
  if(roots.has(root))return;roots.add(root);root.updateMatrixWorld(true);
  const inverse=new THREE.Matrix4().copy(root.matrixWorld).invert(),positions=[];
  root.traverse(m=>{
   const furnitureEdges=m.isLineSegments&&m.name==='Colorbeat selective furniture ink';
   if(furnitureEdges){
    const edges=m.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,m.matrixWorld));
    positions.push(...edges.getAttribute('position').array);edges.dispose();return;
   }
   if(!m.isMesh||m.isSkinnedMesh||m.isInstancedMesh||m.userData.inkShell||Array.isArray(m.material)||m.material.transparent)return;
   // Furnishings already expose curated top/back edges. Avoid outlining every
   // bevel and micro-prop in their merged geometry (over 100k unnecessary triangles).
   if(!(m.name==='structure'||(!detailed&&m.userData.inkStatic)))return;
   const edges=new THREE.EdgesGeometry(m.geometry,38);
   edges.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,m.matrixWorld));
   const p=edges.getAttribute('position');for(let i=0;i<p.array.length;i++)positions.push(p.array[i]);edges.dispose();
  });
  if(!positions.length)return;
  const geometry=new LineSegmentsGeometry().setPositions(positions),lines=new LineSegments2(geometry,material);
  lines.name='Overdrive 2.0 D1 selected ink';lines.raycast=()=>{};lines.castShadow=lines.receiveShadow=false;
  root.add(lines);owned.push(lines);
 }
 // Proxies and detailed floors inherit their original culling/streaming visibility.
 for(const root of school.connection.proxies)attach(root);
 let disposed=false;
 return{update(){if(disposed)return;for(const[,lease]of school.leases)attach(lease.model,true);},state(){return{edgeBatches:owned.length,inkPixels:study.width};},dispose(){if(disposed)return;disposed=true;for(const lines of owned){lines.removeFromParent();lines.geometry.dispose();}material.dispose();}};
}
