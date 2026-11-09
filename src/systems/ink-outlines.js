import * as THREE from 'three';
import {COLORBEAT_STYLE} from './colorbeat-materials.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Selected architectural edges share one draw. Actor shells reuse the animated
// mesh's geometry and transform, without copying collision or shadow geometry.
export class InkOutlines {
  constructor(scene, resources, actors) {
    this.actorInk = []; this.actors = actors;
    this.actorMaterial = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      uniforms: { thickness: { value: .012 }, ink: { value: new THREE.Color('#141824') } },
      vertexShader: 'uniform float thickness; void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position+normal*thickness,1.0);}',
      fragmentShader: 'uniform vec3 ink; void main(){gl_FragColor=vec4(ink,1.0); #include <colorspace_fragment> }'.replace('#include', '\n#include').replace('> }','>\n}'),
    });
    for (const actor of actors) actor.root.userData.inkActor = true;
    scene.updateMatrixWorld(true);
    const parts = [];
    scene.traverse(mesh => {
      if (!mesh.isMesh || mesh.isInstancedMesh || !mesh.userData.inkStatic) return;
      for (let p = mesh; p; p = p.parent) if (p.userData.inkActor || p.userData.inkDynamic) return;
      const edges = new THREE.EdgesGeometry(mesh.geometry, 38); edges.applyMatrix4(mesh.matrixWorld);
      if (edges.attributes.position.count) parts.push(edges); else edges.dispose();
    });
    const geometry = parts.length ? mergeGeometries(parts, false) : new THREE.BufferGeometry();
    parts.forEach(g => g.dispose());
    this.staticInk = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: COLORBEAT_STYLE.ink, transparent: true, opacity: COLORBEAT_STYLE.environmentInkOpacity, depthWrite: false }));
    this.staticInk.name = 'Aurora architectural ink'; scene.add(this.staticInk);
    this.skinnedMaterial = new THREE.MeshBasicMaterial({color:'#141824',side:THREE.BackSide,depthWrite:false});
    this.skinnedMaterial.onBeforeCompile = shader => {
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','vec3 transformed = vec3(position + normal * .006);');
    };
    this.skinnedMaterial.customProgramCacheKey=()=> 'aurora-skinned-ink-v1';
    this.hiddenInkMaterial=new THREE.MeshBasicMaterial({visible:false});
    for(const actor of actors)this.registerActor(actor);
    this.update('low', new THREE.Vector3());
  }
  registerActor(actor) {
    const previous=this.actorInk.find(item=>item.actor.root===actor.root);
    if(actor.player===undefined)actor.player=previous?.actor.player??false;
    this.actorInk=this.actorInk.filter(item=>{if(item.actor.root!==actor.root)return true;item.mesh.removeFromParent();return false;});
    const sources=[];
    (actor.custom||actor.body||actor.root).traverse(m=>{if(m.isMesh&&m.geometry.attributes.normal)sources.push(m);});
    const coreParents=new Set();
    for(const source of sources) {
      const name=source.parent.name;
      const core=source.isSkinnedMesh||((name==='body'||name==='head')&&!coreParents.has(name));
      if(core)coreParents.add(name);
      let mesh;
      if(source.isSkinnedMesh){const materials=source.userData.inkGroups?.map(enabled=>enabled?this.skinnedMaterial:this.hiddenInkMaterial)||this.skinnedMaterial;mesh=new THREE.SkinnedMesh(source.geometry,materials);mesh.bindMode=source.bindMode;mesh.bind(source.skeleton,source.bindMatrix);}
      else mesh=new THREE.Mesh(source.geometry,this.actorMaterial);
      mesh.name='Aurora silhouette';mesh.userData.inkShell=true;mesh.castShadow=mesh.receiveShadow=false;mesh.frustumCulled=false;
      source.add(mesh);this.actorInk.push({mesh,actor,core});
    }
  }
  update(quality, position) {
    for (const item of this.actorInk) {
      const distance = Math.hypot(item.actor.root.position.x - position.x, item.actor.root.position.z - position.z);
      item.mesh.castShadow = false;
      item.mesh.visible = item.actor.player ? (quality !== 'low' || item.core) : quality !== 'low' && item.core && distance < (quality === 'high' ? 25 : 14);
    }
  }
  dispose() {
    this.staticInk.removeFromParent(); this.staticInk.geometry.dispose(); this.staticInk.material.dispose();
    this.actorInk.forEach(item => item.mesh.removeFromParent()); this.actorMaterial.dispose(); this.skinnedMaterial.dispose(); this.hiddenInkMaterial.dispose(); this.actorInk.length = 0;
  }
}
