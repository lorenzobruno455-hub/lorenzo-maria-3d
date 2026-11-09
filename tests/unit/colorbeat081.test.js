import {test} from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {Resources} from '../../src/systems/resources.js';import {SchoolMaterials} from '../../src/systems/school-materials.js';

test('campus and school borrow the exact same Colorbeat materials and dispose them once',()=>{
 const resources=new Resources(),school=new SchoolMaterials(resources),a=resources.material('#5b616b','metal'),b=school.get('#5B616B','metal');assert.equal(a,b);
 const wood=resources.material('#8b6a4e','wood');assert.equal(wood,school.get('#8B6A4E','wood'));assert.equal(wood.map,school.texture('wood'));assert(wood.map.isDataTexture);
 let disposed=0;wood.addEventListener('dispose',()=>disposed++);school.dispose();assert.equal(disposed,0);assert.equal(resources.material('#8b6a4e','wood'),wood);resources.dispose();resources.dispose();assert.equal(disposed,1);
});

test('shared toon shader keeps skinning and vertex colors and uses bounded material highlights',()=>{
 const r=new Resources(),matte=r.material('#fff5dc','cloth',{vertexColors:true}),metal=r.material('#586b68','metal'),plastic=r.material('#2d5fa8','plastic');
 assert(matte.vertexColors);assert.equal(matte.gradientMap,metal.gradientMap);assert.equal(matte.userData.colorbeat.specular,0);assert(metal.userData.colorbeat.specular>plastic.userData.colorbeat.specular);assert(plastic.userData.colorbeat.specular<.1);
 const shader={vertexShader:THREE.ShaderLib.toon.vertexShader,fragmentShader:THREE.ShaderLib.toon.fragmentShader,uniforms:{}};metal.onBeforeCompile(shader);
 assert(shader.vertexShader.includes('#include <skinning_vertex>'));assert(shader.fragmentShader.includes('fwidth'));assert(shader.fragmentShader.includes('cbWorldPosition'));assert(shader.fragmentShader.includes('directSpecular'));assert.equal(metal.customProgramCacheKey(),plastic.customProgramCacheKey());
 const glass=r.material('#a9ced5','glass');assert(glass.transparent);assert.equal(glass.depthWrite,false);assert(glass.opacity<.6);r.dispose();
});

test('lighting shares exposure across locations, transitions smoothly and yields to cinematics',async()=>{
 const {updateColorbeatLighting}=await import('../../src/systems/colorbeat-lighting.js'),renderer={toneMappingExposure:1.16},sun=new THREE.DirectionalLight('#ffffff',2.1),hemisphere=new THREE.HemisphereLight('#fff','#888',.95);
 updateColorbeatLighting({renderer,sun,hemisphere,indoors:true,dt:.1});assert(renderer.toneMappingExposure<1.16&&renderer.toneMappingExposure>1);assert(sun.intensity<2.1&&sun.intensity>1.35);
 updateColorbeatLighting({renderer,sun,hemisphere,indoors:true,dt:10});const indoor=renderer.toneMappingExposure;updateColorbeatLighting({renderer,sun,hemisphere,indoors:false,dt:10});assert(Math.abs(renderer.toneMappingExposure-indoor)<.001);
 sun.intensity=.3;updateColorbeatLighting({renderer,sun,hemisphere,indoors:true,dt:1,cinematic:true});assert.equal(sun.intensity,.3);
});

test('environment wood/paint resolve coherently without reclassifying character materials',async()=>{
 const {environmentFinish}=await import('../../src/systems/colorbeat-materials.js');const r=new Resources(),s=new SchoolMaterials(r);
 assert.equal(environmentFinish('#b99b70'),'wood');assert.equal(environmentFinish('#586b68'),'metal');assert.equal(environmentFinish('#586b68','cloth'),'cloth');
 assert.equal(r.material('#b99b70','wood'),s.get('#c49b70','wood'));assert.equal(r.material('#b99b70').userData.colorbeatKind,'plain');assert.equal(r.material('#eadfc8','plaster').color.getHexString(),'f4f0e7');s.dispose();r.dispose();
});

test('school glass uses the shared transparent material without casting opaque panel shadows',async()=>{
 const fs=await import('node:fs'),{createSchoolArchitecture}=await import('../../src/systems/school-architecture.js'),floor=JSON.parse(fs.readFileSync('src/data/sao-jorge.json')).floors[0],r=new Resources(),s=new SchoolMaterials(r),a=createSchoolArchitecture({resources:r,materials:s,floor});
 const glass=a.group.children.filter(m=>m.material?.userData.colorbeatKind==='glass');assert(glass.length);assert(glass.every(m=>m.material.transparent&&!m.material.depthWrite&&!m.castShadow));a.dispose();s.dispose();r.dispose();
});
