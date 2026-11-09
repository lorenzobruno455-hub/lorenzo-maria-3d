import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import * as THREE from 'three';
import {ColorbeatMaterials} from './colorbeat-materials.js';

export class Resources {
  constructor() { this.colorbeat=new ColorbeatMaterials();this.geometries = new Map();this.materials=this.colorbeat.materials;this.textures=this.colorbeat.textures; this.toonGradient = null; }
  geometry(kind) {
    if (!this.geometries.has(kind)) {
      const geometry = kind === 'rounded' ? new RoundedBoxGeometry(1,1,1,2,.06) : kind === 'box' ? new THREE.BoxGeometry(1, 1, 1) : kind === 'sphere' ? new THREE.SphereGeometry(1, 12, 8) : kind === 'leaf' ? new THREE.IcosahedronGeometry(1, 1) : new THREE.CylinderGeometry(1, 1, 1, 12);
      if(!geometry.index)geometry.setIndex(Array.from({length:geometry.attributes.position.count},(_,i)=>i));
      this.geometries.set(kind, geometry);
    }
    return this.geometries.get(kind);
  }
  texture(kind) { return this.colorbeat.texture(kind); }
  toonRamp() { this.toonGradient=this.colorbeat.gradient();return this.toonGradient; }
  gradient() { return this.toonRamp(); }
  material(color,kind='plain',options={}) { const material=this.colorbeat.get(color,kind,options);this.toonGradient=this.colorbeat.gradientMap;return material; }
  mesh(kind, color, scale, texture = 'plain') {
    const mesh = new THREE.Mesh(this.geometry(kind), this.material(color, texture));
    mesh.scale.set(...scale); mesh.castShadow=texture!=='glass';mesh.receiveShadow=true; return mesh;
  }
  dispose() {
    this.geometries.forEach(g=>g.dispose());this.geometries.clear();this.colorbeat.dispose();
    this.toonGradient = null;
  }
}
