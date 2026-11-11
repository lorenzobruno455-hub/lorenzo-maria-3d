import * as THREE from 'three';
import {COLORBEAT_STYLE} from './colorbeat-materials.js';

// Pixel width uses CSS viewport units; adaptive buffers retain the same visual
// weight. A world-space cap prevents distant silhouettes from becoming halos.
// Three's morph/skin chunks run before projection, including the normal path.
export function createActorInkMaterial({instanced=false}={}) {
 const material=new THREE.MeshBasicMaterial({color:COLORBEAT_STYLE.ink,side:THREE.BackSide,depthWrite:false,toneMapped:false});
 const uniforms={cbInkViewport:{value:new THREE.Vector2(800,450)},cbInkPixels:{value:1.15},cbInkWorldLimit:{value:.018}};
 material.userData.inkUniforms=uniforms;
 material.customProgramCacheKey=()=> 'aurora-colorbeat-081-actor-ink-v2'+(instanced?':instanced-normal':'');
 material.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,uniforms);
  shader.vertexShader='uniform vec2 cbInkViewport;\nuniform float cbInkPixels;\nuniform float cbInkWorldLimit;\n'+shader.vertexShader;
  // Basic material normally computes normals only for skinning/envmaps. Enable
  // the same path for rigid fallback meshes too, without a second normal pass.
  shader.vertexShader=shader.vertexShader.replace('#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )','#if 1');
  shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
   // BackSide enables FLIP_SIDED in defaultnormal_vertex; undo it for outward extrusion.
   vec3 cbInkNormal=normalize(${instanced?'-transformedNormal':'normalMatrix*objectNormal'});
   vec2 cbInkOffset=cbInkNormal.xy/max(length(cbInkNormal.xy),.0001);
   float cbInkCap=cbInkWorldLimit*projectionMatrix[1][1]*cbInkViewport.y/(2.*max(-mvPosition.z,.01));
   gl_Position.xy+=cbInkOffset*2.*min(cbInkPixels,cbInkCap)/cbInkViewport*gl_Position.w;`);
 };
 return material;
}
