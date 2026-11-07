import * as THREE from 'three';

export class Resources {
  constructor() { this.geometries = new Map(); this.materials = new Map(); this.textures = new Map(); }
  geometry(kind) {
    if (!this.geometries.has(kind)) {
      const geometry = kind === 'box' ? new THREE.BoxGeometry(1, 1, 1) : kind === 'sphere' ? new THREE.SphereGeometry(1, 12, 8) : kind === 'leaf' ? new THREE.IcosahedronGeometry(1, 1) : new THREE.CylinderGeometry(1, 1, 1, 12);
      this.geometries.set(kind, geometry);
    }
    return this.geometries.get(kind);
  }
  texture(kind) {
    if (this.textures.has(kind)) return this.textures.get(kind);
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const ctx = c.getContext('2d'); ctx.fillStyle = '#e8e5dc'; ctx.fillRect(0, 0, 128, 128);
    // Deterministic procedural textures, available offline without external assets.
    for (let i = 0; i < 600; i++) {
      const x = (i * 37) % 128, y = (i * 61 + Math.floor(i / 128) * 13) % 128;
      ctx.fillStyle = i % 2 ? '#ffffff10' : '#25282009'; ctx.fillRect(x, y, 2, 2);
    }
    if (kind === 'tile') {
      ctx.strokeStyle = '#a5a598'; ctx.lineWidth = .6;
      for (let i = 0; i <= 128; i += 32) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 128); ctx.moveTo(0, i); ctx.lineTo(128, i); ctx.stroke(); }
    } else if (kind === 'wood') {
      ctx.strokeStyle = '#66513316';
      for (let i = 0; i < 30; i++) { ctx.beginPath(); ctx.moveTo(0, i * 5); ctx.bezierCurveTo(30, i * 5 - 3, 70, i * 5 + 4, 128, i * 5); ctx.stroke(); }
    }
    const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(kind === 'tile' ? 4 : 2, kind === 'tile' ? 4 : 2);
    this.textures.set(kind, texture); return texture;
  }
  material(color, kind = 'plain') {
    const key = `${color}:${kind}`;
    if (!this.materials.has(key)) this.materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: kind === 'glass' ? .25 : .88, metalness: kind === 'metal' ? .5 : 0, map: ['tile', 'plaster', 'wood'].includes(kind) ? this.texture(kind) : null }));
    return this.materials.get(key);
  }
  mesh(kind, color, scale, texture = 'plain') {
    const mesh = new THREE.Mesh(this.geometry(kind), this.material(color, texture));
    mesh.scale.set(...scale); mesh.castShadow = mesh.receiveShadow = true; return mesh;
  }
  dispose() {
    for (const map of [this.geometries, this.materials, this.textures]) { for (const resource of map.values()) resource.dispose(); map.clear(); }
  }
}
