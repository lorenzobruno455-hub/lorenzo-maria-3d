import * as THREE from 'three';

// Original Aurora parameters. These are not specifications/assets from Hi-Fi RUSH.
export const COLORBEAT_STYLE=Object.freeze({id:'aurora-colorbeat-081',ink:'#141824',environmentInkOpacity:.48});
const PALETTE={ '#eadfc8':'#fff1ce','#c9c1ad':'#e4ca88','#b8b0a0':'#e7d9ac','#557b73':'#138a91','#31564a':'#175d68','#64766b':'#40577b','#b99b70':'#d49c4b','#bc9a63':'#dfa24e','#8d6e52':'#9f633d','#62867a':'#228e90','#698756':'#74a942','#7b684f':'#a87643','#dbdbcf':'#fff5dc','#8faaa0':'#50adb4','#56656b':'#344966','#414c4d':'#202b43' };
const PROFILES={plain:{specular:0},wood:{specular:0,period:1.4},tile:{specular:0,period:1.2},plaster:{specular:0,period:2.4},concrete:{specular:0,period:1.8},cloth:{specular:0,period:.25},plastic:{specular:.055},metal:{specular:.22},glass:{},emissive:{}};
const GRADIENT=/* glsl */`
#ifdef USE_GRADIENTMAP
 uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance(vec3 normal,vec3 lightDirection){
 float c=dot(normal,lightDirection)*.5+.5;
 float aa=max(fwidth(c)*.65,.001);
 #ifdef USE_GRADIENTMAP
  vec3 low=vec3(texture2D(gradientMap,vec2(1.0/6.0,0.)).r);
  vec3 mid=vec3(texture2D(gradientMap,vec2(.5,0.)).r);
  vec3 high=vec3(texture2D(gradientMap,vec2(5.0/6.0,0.)).r);
  return mix(mix(low,mid,smoothstep(1.0/3.0-aa,1.0/3.0+aa,c)),high,smoothstep(2.0/3.0-aa,2.0/3.0+aa,c));
 #else
  return vec3(mix(.58,1.,smoothstep(.66-aa,.66+aa,c)));
 #endif
}
`;
const MAP=/* glsl */`
#ifdef USE_MAP
 vec3 cbPlane=abs(normalize(cross(dFdx(cbWorldPosition),dFdy(cbWorldPosition))));
 vec2 cbUV=cbPlane.y>max(cbPlane.x,cbPlane.z)?cbWorldPosition.xz:(cbPlane.x>cbPlane.z?cbWorldPosition.zy:cbWorldPosition.xy);
 diffuseColor*=texture2D(map,cbUV*cbSurfaceScale);
#endif
`;
function configureToon(material,profile){
 material.userData.colorbeat={style:COLORBEAT_STYLE.id,specular:profile.specular||0,period:profile.period||0};
 material.customProgramCacheKey=()=> 'aurora-colorbeat-081-toon-v1';
 material.onBeforeCompile=shader=>{
  shader.uniforms.cbSpecular={value:profile.specular||0};shader.uniforms.cbSurfaceScale={value:1/(profile.period||1)};
  shader.vertexShader='varying vec3 cbWorldPosition;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
   vec4 cbPosition=vec4(transformed,1.);
   #ifdef USE_BATCHING
    cbPosition=batchingMatrix*cbPosition;
   #endif
   #ifdef USE_INSTANCING
    cbPosition=instanceMatrix*cbPosition;
   #endif
   cbWorldPosition=(modelMatrix*cbPosition).xyz;`);
  shader.fragmentShader='varying vec3 cbWorldPosition;\nuniform float cbSpecular;\nuniform float cbSurfaceScale;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <gradientmap_pars_fragment>',GRADIENT).replace('#include <map_fragment>',MAP);
  const lights=THREE.ShaderChunk.lights_toon_pars_fragment.replace('vec3 irradiance =',`if(cbSpecular>0.){
   vec3 cbHalfVector=directLight.direction+geometryViewDir;
   vec3 cbHalf=cbHalfVector*inversesqrt(max(dot(cbHalfVector,cbHalfVector),.000001));
   float cbLobe=pow(max(dot(geometryNormal,cbHalf),0.),24.);
   float cbAA=max(fwidth(cbLobe),.008);
   reflectedLight.directSpecular+=smoothstep(.65-cbAA,.65+cbAA,cbLobe)*cbSpecular*directLight.color*max(dot(geometryNormal,directLight.direction),0.);
  }
  vec3 irradiance =`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <lights_toon_pars_fragment>',lights).replace('reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance','reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + totalEmissiveRadiance');
 };
}

// One owner for GPU materials/maps. School and GLB consumers only borrow them.
export class ColorbeatMaterials {
 constructor({gradient=null}={}){this.materials=new Map();this.textures=new Map();this.gradientMap=gradient;this.borrowedGradient=!!gradient;this.disposed=false;}
 gradient(){
  if(this.disposed)throw Error('Colorbeat resources disposed');
  if(!this.gradientMap){const ramp=new THREE.DataTexture(new Uint8Array([64,64,64,255,148,148,148,255,255,255,255,255]),3,1,THREE.RGBAFormat);ramp.minFilter=ramp.magFilter=THREE.NearestFilter;ramp.generateMipmaps=false;ramp.needsUpdate=true;this.gradientMap=ramp;this.textures.set('toon-ramp',ramp);}
  return this.gradientMap;
 }
 texture(kind){
  if(this.disposed)throw Error('Colorbeat resources disposed');if(this.textures.has(kind))return this.textures.get(kind);
  const size=64,data=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const noise=((x*37+y*67+x*y*3)%17)/17;let v=250-noise*5;
   if(kind==='wood')v=246+Math.sin(y*.72+Math.sin(x*.12)*1.4)*4-noise*3-(y%32===0?10:0);
   if(kind==='tile')v=x%32===0||y%32===0?224:250-noise*3;
   if(kind==='cloth')v=248-((x+y)%3===0?6:0)-noise*3;
   if(kind==='concrete')v=246-noise*9;
   const i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=Math.round(v);data[i+3]=255;
  }
  const map=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.magFilter=THREE.LinearFilter;map.minFilter=THREE.LinearMipmapLinearFilter;map.generateMipmaps=true;map.needsUpdate=true;this.textures.set(kind,map);return map;
 }
 get(color,kind='plain',{vertexColors=false}={}){
  if(this.disposed)throw Error('Colorbeat resources disposed');kind=PROFILES[kind]?kind:'plain';const supplied=new THREE.Color(color),original='#'+supplied.getHexString(),tint=vertexColors?original:(PALETTE[original]||original),key=`${tint}:${kind}:${vertexColors}`;
  if(this.materials.has(key))return this.materials.get(key);
  let material;
  if(kind==='glass')material=new THREE.MeshStandardMaterial({color:tint,vertexColors,transparent:true,opacity:.42,roughness:.3,metalness:0,depthWrite:false});
  else if(kind==='emissive')material=new THREE.MeshBasicMaterial({color:tint,vertexColors,toneMapped:false});
  else{material=new THREE.MeshToonMaterial({color:tint,vertexColors,gradientMap:this.gradient(),map:PROFILES[kind].period?this.texture(kind):null});configureToon(material,PROFILES[kind]);}
  material.name=`Colorbeat ${kind}`;material.userData.colorbeatKind=kind;this.materials.set(key,material);return material;
 }
 dispose(){if(this.disposed)return;this.disposed=true;this.materials.forEach(m=>m.dispose());this.textures.forEach(t=>t.dispose());this.materials.clear();this.textures.clear();this.gradientMap=null;}
}
