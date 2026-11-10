import * as THREE from 'three';
import {SCHOOL_ORIGIN} from './world-coordinates.js';
import {createComicCanopies} from './comic-overdrive-nature.js';
export const P0_PALETTE=Object.freeze({sky:'#02B9FF',cobalt:'#2352FF',sun:'#FFE238',orange:'#FF8A28',coral:'#FF5A4B',pink:'#FF3D9A',violet:'#9655F5',lime:'#75E83D',emerald:'#22CC79',turquoise:'#18D6CC',night:'#19264D',ink:'#131A2A',paper:'#FFF3D7',light:'#FFFDF3'});
export function createP0Areas(layout){
 const f=layout.floors[0],room=f.rooms.find(r=>r.id==='sj-f1-01'),top=layout.floors.at(-1).baseY+3.8;
 return[{id:'campus-sample',min:new THREE.Vector3(-14,-1,8),max:new THREE.Vector3(14,9,26)},
 {id:'connection-facade',min:new THREE.Vector3(40,-1,18.6),max:new THREE.Vector3(74,top,26)},
 {id:room.id,min:new THREE.Vector3(SCHOOL_ORIGIN.x+room.x1-.1,f.baseY-.5,room.z1),max:new THREE.Vector3(SCHOOL_ORIGIN.x+room.x2+.1,f.baseY+3.55,room.z2)}];
}
export function insideP0Area(p,areas){return areas.some(a=>p.x>=a.min.x&&p.x<=a.max.x&&p.y>=a.min.y&&p.y<=a.max.y&&p.z>=a.min.z&&p.z<=a.max.z);}
const color=name=>new THREE.Color(P0_PALETTE[name]);
const GLSL=/* glsl */`
uniform vec3 coAreaMin[3];uniform vec3 coAreaMax[3];uniform float coFamily;
uniform vec3 coLime;uniform vec3 coEmerald;uniform vec3 coTurquoise;uniform vec3 coSun;uniform vec3 coOrange;uniform vec3 coCobalt;uniform vec3 coViolet;uniform vec3 coPaper;uniform vec3 coInk;
float coScope(vec3 p){float mask=0.;for(int i=0;i<3;i++){vec3 a=smoothstep(coAreaMin[i],coAreaMin[i]+vec3(.45),p);vec3 b=vec3(1.)-smoothstep(coAreaMax[i]-vec3(.45),coAreaMax[i],p);mask=max(mask,a.x*a.y*a.z*b.x*b.y*b.z);}return mask;}
vec3 coPigment(vec3 base,vec3 p){
 float hi=max(max(base.r,base.g),base.b),lo=min(min(base.r,base.g),base.b);
 if(base.g>base.r*1.15&&base.g>base.b*1.06){
  if(base.b>base.g*.7)return coTurquoise;
  float coPatch=step(.46,fract(sin(dot(floor(p.xz/3.),vec2(17.13,7.91)))*231.17));
  return p.y<.3?mix(coLime,coEmerald,coPatch*.22):mix(coEmerald,coLime,step(.45,fract(p.y*.47+p.x*.11+p.z*.08)));
 }
 if(coFamily==1.)return mix(coOrange,coSun,clamp((hi-.08)*1.4,0.,.64));
 if(hi-lo<.17&&hi>.42)return coPaper;
 // Preserve hue/identity of skin, uniforms and objects outside explicit families.
 return clamp(mix(base,base/max(hi,.08)*min(hi*1.3,.95),.4),0.,1.);
}
`;
function worldVarying(shader){
 if(shader.vertexShader.includes('varying vec3 cbWorldPosition;'))return;
 shader.vertexShader='varying vec3 cbWorldPosition;\n'+shader.vertexShader;
 const chunk=shader.vertexShader.includes('#include <worldpos_vertex>')?'#include <worldpos_vertex>':'#include <project_vertex>';
 shader.vertexShader=shader.vertexShader.replace(chunk,`${chunk}
 vec4 coWorld=vec4(transformed,1.);
 #ifdef USE_BATCHING
 coWorld=batchingMatrix*coWorld;
 #endif
 #ifdef USE_INSTANCING
 coWorld=instanceMatrix*coWorld;
 #endif
 cbWorldPosition=(modelMatrix*coWorld).xyz;`);
}
export function decorateOverdriveMaterial(material,areas,{global=false}={}){
 if(!material.isMeshToonMaterial&&!material.isMeshBasicMaterial&&!material.isLineBasicMaterial&&!(global&&material.isMeshStandardMaterial))return()=>{};
 const oldCompile=material.onBeforeCompile,oldKey=material.customProgramCacheKey;
 const kind=material.userData.colorbeatKind,family={wood:1,tile:2,concrete:2,plaster:3,fabric:4,cloth:4}[kind]||0;
 material.customProgramCacheKey=()=>oldKey.call(material)+(global?':comic-overdrive-global-v1':':comic-overdrive-p0-v1');
 material.onBeforeCompile=shader=>{
  oldCompile.call(material,shader);worldVarying(shader);
  Object.assign(shader.uniforms,{coAreaMin:{value:areas.map(a=>a.min)},coAreaMax:{value:areas.map(a=>a.max)},coFamily:{value:family}});
  for(const name of['Lime','Emerald','Turquoise','Sun','Orange','Cobalt','Violet','Paper','Ink'])shader.uniforms['co'+name]={value:color(name.toLowerCase())};
  if(!shader.fragmentShader.includes('varying vec3 cbWorldPosition;'))shader.fragmentShader='varying vec3 cbWorldPosition;\n'+shader.fragmentShader;
  let profile=GLSL;
  if(global)profile=profile.replace('uniform vec3 coAreaMin[3];uniform vec3 coAreaMax[3];','').replace(/float coScope\(vec3 p\)\{.*?return mask;\}/,'float coScope(vec3 p){return 1.;}').replace('step(.46,fract(sin(dot(floor(p.xz/3.),vec2(17.13,7.91)))*231.17))','mod(floor(p.x/3.)+floor(p.z/3.),2.)').replace('base.g>base.r*1.15&&base.g>base.b*1.06','base.g>base.r*1.04&&base.g>base.b*1.12');
  shader.fragmentShader=profile+'\n'+shader.fragmentShader;
  const effect=material.isMeshToonMaterial?/* glsl */`
   float coMask=coScope(cbWorldPosition);
   if(coMask>.001){
    vec3 coBase=diffuseColor.rgb;float coLum=dot(coBase,vec3(.2126,.7152,.0722));
    float coEnergy=dot(reflectedLight.directDiffuse,vec3(.2126,.7152,.0722))/max(coLum,.008);
    float coBand=step(.18,coEnergy)+step(.46,coEnergy);
    vec3 pigment=coPigment(coBase,cbWorldPosition);
    vec3 shadow=mix(pigment*.44,coCobalt*.58,.4);
    vec3 middle=mix(pigment*.83,coTurquoise*.55,.09);
    vec3 bright=pigment*1.2;
    // Warm plain surfaces include skin: keep its hue across the three bands.
    if(coFamily==0.&&coBase.r>coBase.g*1.18&&coBase.g>coBase.b*1.05){shadow=pigment*.55;middle=pigment*.9;bright=pigment*1.15;}
    vec3 graphic=coBand<.5?shadow:(coBand<1.5?middle:bright);
    if(coBand<.5&&coFamily>0.&&coFamily<4.){
     float stripe=abs(fract((cbWorldPosition.x+cbWorldPosition.z+cbWorldPosition.y)*3.2)-.5);
     float aa=max(fwidth(stripe),.015);graphic*=1.-.16*(1.-smoothstep(.04,.04+aa,stripe));
    }
    outgoingLight=mix(outgoingLight,graphic,coMask*smoothstep(.008,.045,coLum));
   }
  `:material.isMeshStandardMaterial?/* glsl */`
   // Graphic glazing keeps its existing alpha, depth and sorting semantics.
   float coRim=step(.65,1.-abs(dot(normalize(vViewPosition),normal)));
   outgoingLight=mix(coTurquoise*.58,coPaper*.9,coRim);
  `:material.isLineBasicMaterial?/* glsl */`
   diffuseColor.a=mix(diffuseColor.a,.95,coScope(cbWorldPosition));
  `:/* glsl */`
   float coMask=coScope(cbWorldPosition);float coLum=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));
   if(coMask>.001){vec3 c=diffuseColor.rgb;
    if(coLum>.72)c=coPaper;
    else if(c.b>c.r*1.3&&c.b>.12)c=coCobalt;
    else if(c.r>c.b*1.5&&c.g>c.b*1.5)c=coSun;
    diffuseColor.rgb=mix(diffuseColor.rgb,c,coMask);
    outgoingLight=diffuseColor.rgb;
   }
  `;
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',effect+'\n#include <opaque_fragment>');
 };
 material.needsUpdate=true;let restored=false;
 return()=>{if(restored)return;restored=true;material.onBeforeCompile=oldCompile;material.customProgramCacheKey=oldKey;material.needsUpdate=true;};
}
function cloudAtlas(){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const c=canvas.getContext('2d');
 for(let cell=0;cell<3;cell++){c.save();c.translate(cell*128,0);const p=new Path2D();
  if(cell===0){p.moveTo(17,89);p.quadraticCurveTo(1,76,21,64);p.quadraticCurveTo(16,39,41,41);p.quadraticCurveTo(61,6,82,43);p.quadraticCurveTo(108,36,109,63);p.quadraticCurveTo(133,79,111,91);}
  else if(cell===1){p.moveTo(13,87);p.quadraticCurveTo(0,62,28,61);p.quadraticCurveTo(31,21,60,45);p.quadraticCurveTo(84,19,96,55);p.quadraticCurveTo(126,46,119,83);p.lineTo(105,93);}
  else{p.moveTo(14,82);p.quadraticCurveTo(4,54,35,58);p.quadraticCurveTo(33,27,57,37);p.quadraticCurveTo(87,6,99,59);p.quadraticCurveTo(127,68,114,90);}
  p.closePath();c.fillStyle=P0_PALETTE.light;c.fill(p);c.save();c.clip(p);c.fillStyle=cell===1?P0_PALETTE.turquoise:P0_PALETTE.violet;c.beginPath();c.moveTo(0,79);c.lineTo(32,79);c.lineTo(44,66);c.lineTo(73,81);c.lineTo(104,72);c.lineTo(128,78);c.lineTo(128,112);c.lineTo(0,112);c.closePath();c.fill();c.restore();c.lineWidth=3;c.strokeStyle=P0_PALETTE.ink;c.stroke(p);c.restore();
 }
 c.save();c.translate(448,64);c.beginPath();for(let i=0;i<24;i++){const r=i%2?36:52,a=i*Math.PI/12;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();c.fillStyle=P0_PALETTE.sun;c.strokeStyle=P0_PALETTE.ink;c.lineWidth=3;c.fill();c.stroke();c.fillStyle=P0_PALETTE.light;c.beginPath();c.ellipse(-10,-13,9,14,.7,0,Math.PI*2);c.fill();c.restore();
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=texture.magFilter=THREE.LinearFilter;return texture;
}
function makeSky(scene,resources,owned){
 const group=new THREE.Group();group.name='Comic Overdrive P0 sky';scene.add(group);
 const skyMaterial=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,depthTest:false,toneMapped:false,uniforms:{horizon:{value:new THREE.Color('#74E5FF')},sky:{value:color('sky')},high:{value:color('cobalt')}},vertexShader:'varying vec3 direction;void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 direction;uniform vec3 horizon;uniform vec3 sky;uniform vec3 high;void main(){float h=normalize(direction).y;vec3 c=h<.06?horizon:(h<.25?sky:high);gl_FragColor=vec4(c,1.);#include <colorspace_fragment>\n}'});
 // Shader includes must start on their own line.
 skyMaterial.fragmentShader=skyMaterial.fragmentShader.replace(');#include',');\n#include');
 const sky=new THREE.Mesh(resources.geometry('sphere'),skyMaterial);sky.scale.setScalar(110);sky.renderOrder=-100;sky.frustumCulled=false;group.add(sky);owned.push(skyMaterial);
 const atlas=cloudAtlas(),geo=new THREE.PlaneGeometry(1,1),cells=new Float32Array(13);for(let i=0;i<12;i++)cells[i]=i%3;cells[12]=3;geo.setAttribute('coCell',new THREE.InstancedBufferAttribute(cells,1));
 const mat=new THREE.ShaderMaterial({depthWrite:false,toneMapped:false,uniforms:{atlas:{value:atlas}},vertexShader:'attribute float coCell;varying vec2 coUV;void main(){coUV=vec2((coCell+.03+uv.x*.94)*.25,.03+uv.y*.94);vec4 p=modelViewMatrix*instanceMatrix*vec4(0.,0.,0.,1.);p.xy+=position.xy*vec2(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz));gl_Position=projectionMatrix*p;}',fragmentShader:'uniform sampler2D atlas;varying vec2 coUV;void main(){vec4 c=texture2D(atlas,coUV);if(c.a<.3)discard;gl_FragColor=vec4(c.rgb,1.);\n#include <colorspace_fragment>\n}'});
 // Canvas colors are sRGB; ShaderMaterial samples need explicit linearization.
 mat.fragmentShader=mat.fragmentShader.replace('vec4 c=texture2D(atlas,coUV);','vec4 c=sRGBTransferEOTF(texture2D(atlas,coUV));');
 const clouds=new THREE.InstancedMesh(geo,mat,13),dummy=new THREE.Object3D();clouds.renderOrder=-90;clouds.frustumCulled=false;
 for(let i=0;i<13;i++){const a=i===12?.58:i*Math.PI/6+.1,r=i===12?78:72+(i%3)*5;dummy.position.set(Math.sin(a)*r,i===12?11:11+(i%4)*2,-Math.cos(a)*r);const w=i===12?9:15+(i%3)*4;dummy.scale.set(w,i===12?9:w*.6,1);dummy.updateMatrix();clouds.setMatrixAt(i,dummy.matrix);}group.add(clouds);owned.push(clouds,atlas,geo,mat);return group;
}
function makeSampleTree(scene,resources,owned){
 const saved=[],matrix=new THREE.Matrix4(),position=new THREE.Vector3(),hidden=new THREE.Matrix4().makeScale(.00001,.00001,.00001);
 scene.traverse(m=>{if(!m.isInstancedMesh||m.geometry!==resources.geometry('leaf'))return;for(let i=0;i<m.count;i++){m.getMatrixAt(i,matrix);position.setFromMatrixPosition(matrix);if(position.y>3&&Math.hypot(position.x-10,position.z-13)<2.3){saved.push({mesh:m,index:i,matrix:matrix.clone()});m.setMatrixAt(i,hidden);m.instanceMatrix.needsUpdate=true;}}});
 const group=new THREE.Group();group.name='P0 one-tree silhouette';group.position.set(10,4.5,13);scene.add(group);
 const geometry=resources.geometry('leaf'),material=resources.material('#ffffff'),ink=new THREE.MeshBasicMaterial({color:P0_PALETTE.ink,side:THREE.BackSide,toneMapped:false}),leaves=new THREE.InstancedMesh(geometry,material,3),outline=new THREE.InstancedMesh(geometry,ink,3),dummy=new THREE.Object3D();
 for(const[i,p]of [[0,[-1,-.1,0,1.65,1.35,1.65]],[1,[.7,.2,-.15,1.75,1.55,1.65]],[2,[0,.7,.5,1.35,1.25,1.45]]]){dummy.position.set(...p.slice(0,3));dummy.scale.set(...p.slice(3));dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);leaves.setColorAt(i,color(['emerald','lime','turquoise'][i]));dummy.scale.multiplyScalar(1.025);dummy.updateMatrix();outline.setMatrixAt(i,dummy.matrix);}
 leaves.receiveShadow=true;outline.renderOrder=1;group.add(outline,leaves);owned.push(leaves,outline,ink);
 const shadowGeo=new THREE.CircleGeometry(2.5,14),shadowMat=new THREE.MeshBasicMaterial({color:P0_PALETTE.cobalt,transparent:true,opacity:.38,depthWrite:false,toneMapped:false}),shadow=new THREE.Mesh(shadowGeo,shadowMat);shadow.rotation.x=-Math.PI/2;shadow.position.set(10,.008,13);shadow.scale.set(1,.65,1);scene.add(shadow);owned.push(shadowGeo,shadowMat);
 return{group,shadow,saved,restore(){for(const s of saved){s.mesh.setMatrixAt(s.index,s.matrix);s.mesh.instanceMatrix.needsUpdate=true;}group.removeFromParent();shadow.removeFromParent();}};
}
export function createComicOverdriveP0({scene,resources,school,ink,global=false}){
 const areas=global?[]:createP0Areas(school.layout),owned=[],restores=[],seen=new WeakSet(),models=new WeakSet(),oldDecorator=resources.colorbeat.decorate,oldFog=scene.fog.color.clone(),oldInkLimit=ink.actorMaterial.userData.inkUniforms.cbInkWorldLimit.value;
 const decorate=m=>{if(!m||seen.has(m)||m.userData.inkUniforms)return;seen.add(m);restores.push(decorateOverdriveMaterial(m,areas,{global}));};
 const scan=root=>root.traverse(o=>{if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])decorate(m);});
 resources.colorbeat.decorate=m=>{oldDecorator?.(m);decorate(m);};resources.colorbeat.materials.forEach(decorate);scan(scene);
 const tree=global?createComicCanopies(scene,resources,owned):makeSampleTree(scene,resources,owned),sky=makeSky(scene,resources,owned),worldPosition=new THREE.Vector3();scene.fog.color.set(P0_PALETTE.sky);if(!global)document.body.classList.add('comic-overdrive-p0');let disposed=false;
 return{areas,update(camera){if(disposed)return;sky.position.copy(camera.getWorldPosition(worldPosition));for(const[,lease]of school.leases)if(!models.has(lease.model)){models.add(lease.model);scan(lease.model);}if(!global){const u=ink.actorMaterial.userData.inkUniforms;u.cbInkPixels.value=1.8;u.cbInkWorldLimit.value=.032;}},state(){return{id:global?'comic-overdrive-p1-p2':'comic-overdrive-p0',areas:global?['all-exteriors','all-school-floors']:areas.map(a=>a.id),treeInstancesReplaced:global?tree.saved.reduce((n,s)=>n+s.count,0):tree.saved.length,trees:tree.trees??1,cloudCards:13,shadowBands:3};},dispose(){if(disposed)return;disposed=true;resources.colorbeat.decorate=oldDecorator;restores.reverse().forEach(fn=>fn());tree.restore();sky.removeFromParent();owned.forEach(r=>r.dispose());scene.fog.color.copy(oldFog);ink.actorMaterial.userData.inkUniforms.cbInkWorldLimit.value=oldInkLimit;document.body.classList.remove('comic-overdrive-p0');}};
}
