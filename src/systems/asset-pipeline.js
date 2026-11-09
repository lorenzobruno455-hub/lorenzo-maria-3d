import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';

// Template owns GPU data; leases own only cloned skeletons. No consumer may
// dispose shared geometries/materials. A disposed pool also cleans late loads.
export class GLBAssets {
  constructor(resources, {load = async url => { const {GLTFLoader} = await import('three/addons/loaders/GLTFLoader.js'); return new GLTFLoader().loadAsync(url); }} = {}) {
    this.resources = resources; this.load = load; this.entries = new Map(); this.templates = new Set(); this.materials = new Map(); this.disposed = false;
  }
  async acquire(url, {height = 1.82, palette = {}} = {}) {
    if (this.disposed) throw new Error('Asset cache disposed');
    if (!Number.isFinite(height) || height < .1 || height > 10) throw new Error('Altura alvo inválida');
    if (!this.entries.has(url)) {
      const pending = this.load(url).then(gltf => {
        const template = gltf.scene;
        this.compactSkins(template);
        const bounds = new THREE.Box3().setFromObject(template), size = bounds.getSize(new THREE.Vector3());
        if (this.disposed || !Number.isFinite(size.y) || size.y < .01 || size.y > 10000) {
          this.disposeTemplate(template);
          throw new Error(this.disposed ? 'Asset cache disposed' : 'Modelo sem altura válida');
        }
        this.templates.add(template);
        return {template, animations:gltf.animations, bounds};
      }).catch(error => {this.entries.delete(url); throw error;});
      this.entries.set(url,pending);
    }
    const entry = await this.entries.get(url);
    if (this.disposed) throw new Error('Asset cache disposed');
    const model = new THREE.Group(); model.name = 'Aurora normalized asset';
    const instance = clone(entry.template), size = entry.bounds.getSize(new THREE.Vector3()), scale = height / size.y;
    const normalized=new THREE.Group();normalized.scale.setScalar(scale);
    normalized.position.set(-(entry.bounds.min.x+entry.bounds.max.x)*scale/2,-entry.bounds.min.y*scale,-(entry.bounds.min.z+entry.bounds.max.z)*scale/2);
    normalized.add(instance);
    instance.traverse(mesh => {
      if (!mesh.isMesh) return;
      const convert = material => {
        const color = palette[material.name] || `#${material.color?.getHexString() || 'ffffff'}`;
        const kind = /metal|glass/i.test(material.name) ? material.name.toLowerCase().includes('glass') ? 'glass':'metal' : 'plain';
        const key = `${color}:${kind}`;
        if(!this.materials.has(key))this.materials.set(key,this.resources.material(color,kind));
        return this.materials.get(key);
      };
      const original=Array.isArray(mesh.material)?mesh.material:[mesh.material];
      mesh.userData.inkGroups=original.map(m=>/^(hair|shirt|pants|shoe)$/i.test(m.name));
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(convert) : convert(mesh.material);
      mesh.castShadow = true; mesh.receiveShadow = false;
      if(mesh.isSkinnedMesh) mesh.frustumCulled = false;
    });
    model.add(normalized); model.userData.assetURL = url; model.userData.height = height;
    let released = false;
    return {model, animations:entry.animations, release() {
      if (released) return; released = true; model.removeFromParent();
      const skeletons = new Set(); model.traverse(m=>{if(m.skeleton)skeletons.add(m.skeleton);});
      skeletons.forEach(s=>s.dispose()); model.clear();
    }};
  }
  compactSkins(template) {
    // glTF exports material primitives as separate meshes. Merge only siblings
    // with identical transforms, bind matrices, attributes and bones.
    const groups=new Map();template.traverse(m=>{if(!m.isSkinnedMesh||Array.isArray(m.material))return;
      const key=[m.parent.uuid,...m.matrix.elements,...m.bindMatrix.elements,...m.skeleton.bones.map(b=>b.uuid)].join(':');
      if(!groups.has(key))groups.set(key,[]);groups.get(key).push(m);
    });
    for(const meshes of groups.values()) {
      if(meshes.length<2)continue;
      const attrs=Object.keys(meshes[0].geometry.attributes).sort().join(',');
      if(meshes.some(m=>Object.keys(m.geometry.attributes).sort().join(',')!==attrs))continue;
      const geometry=mergeGeometries(meshes.map(m=>m.geometry),true);if(!geometry)continue;
      const first=meshes[0],merged=new THREE.SkinnedMesh(geometry,meshes.map(m=>m.material));
      merged.name=first.name;merged.position.copy(first.position);merged.quaternion.copy(first.quaternion);merged.scale.copy(first.scale);merged.bindMode=first.bindMode;merged.bind(first.skeleton,first.bindMatrix);first.parent.add(merged);
      const retired=new Set();for(const m of meshes){retired.add(m.geometry);m.removeFromParent();}retired.forEach(g=>g.dispose());
    }
  }
  disposeTemplate(template) {
    const geometries = new Set(), materials = new Set(), textures = new Set(), skeletons = new Set();
    template.traverse(m=>{if(m.geometry)geometries.add(m.geometry);if(m.skeleton)skeletons.add(m.skeleton);for(const mat of m.material?(Array.isArray(m.material)?m.material:[m.material]):[]){materials.add(mat);Object.values(mat).forEach(v=>{if(v?.isTexture)textures.add(v);});}});
    geometries.forEach(g=>g.dispose()); materials.forEach(m=>m.dispose()); textures.forEach(t=>t.dispose()); skeletons.forEach(s=>s.dispose());
  }
  dispose() {
    if(this.disposed)return;this.disposed=true;
    for(const template of this.templates)this.disposeTemplate(template);
    this.templates.clear();this.materials.clear();
    this.entries.clear();
  }
}
