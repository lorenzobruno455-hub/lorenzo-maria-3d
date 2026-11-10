import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import * as THREE from'three';
import{Resources}from'../../src/systems/resources.js';import{P0_PALETTE,createP0Areas,insideP0Area,decorateOverdriveMaterial}from'../../src/systems/comic-overdrive-p0.js';
const layout=JSON.parse(fs.readFileSync('src/data/sao-jorge.json'));
test('P0 covers its three samples while leaving the upper classrooms and outer forest alone',()=>{
 const areas=createP0Areas(layout);assert.equal(areas.length,3);for(const p of[{x:4,y:1,z:20},{x:60,y:2,z:19},{x:53.5,y:1.5,z:15.5}])assert.equal(insideP0Area(p,areas),true);
 for(const p of[{x:-32,y:4,z:13},{x:53.5,y:7.5,z:15.5},{x:53.5,y:1,z:-14}])assert.equal(insideP0Area(p,areas),false);
});
test('P0 composes with the real toon shader and restores borrowed materials without disposing them',()=>{
 const r=new Resources(),m=r.material('#74a942'),ramp=m.gradientMap,old=m.onBeforeCompile,key=m.customProgramCacheKey();let disposed=0;m.addEventListener('dispose',()=>disposed++);const restore=decorateOverdriveMaterial(m,createP0Areas(layout));
 const shader={uniforms:{},vertexShader:THREE.ShaderLib.toon.vertexShader,fragmentShader:THREE.ShaderLib.toon.fragmentShader};m.onBeforeCompile(shader);assert.ok(shader.uniforms.coAreaMin);assert.ok(shader.vertexShader.includes('#include <skinning_vertex>'));assert.ok(shader.vertexShader.includes('instanceMatrix'));assert.equal(m.gradientMap,ramp);assert.equal(m.isMeshToonMaterial,true);assert.notEqual(m.customProgramCacheKey(),key);
 restore();restore();assert.equal(m.onBeforeCompile,old);assert.equal(m.customProgramCacheKey(),key);assert.equal(disposed,0);r.dispose();
});
test('P0 HUD token pairs retain readable text contrast',()=>{
 const lum=hex=>{const c=new THREE.Color(hex);return c.r*.2126+c.g*.7152+c.b*.0722;};for(const[a,b]of[['paper','ink'],['sun','ink'],['turquoise','ink'],['paper','cobalt']]){const x=lum(P0_PALETTE[a]),y=lum(P0_PALETTE[b]);assert.ok((Math.max(x,y)+.05)/(Math.min(x,y)+.05)>=4.5,`${a}/${b}`);}
});
