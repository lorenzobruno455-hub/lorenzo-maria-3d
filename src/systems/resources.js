import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import * as THREE from 'three';

export class Resources {
  constructor() { this.geometries = new Map(); this.materials = new Map(); this.textures = new Map(); this.toonGradient = null; }
  geometry(kind) {
    if (!this.geometries.has(kind)) {
      const geometry = kind === 'rounded' ? new RoundedBoxGeometry(1,1,1,2,.06) : kind === 'box' ? new THREE.BoxGeometry(1, 1, 1) : kind === 'sphere' ? new THREE.SphereGeometry(1, 12, 8) : kind === 'leaf' ? new THREE.IcosahedronGeometry(1, 1) : new THREE.CylinderGeometry(1, 1, 1, 12);
      if(!geometry.index)geometry.setIndex(Array.from({length:geometry.attributes.position.count},(_,i)=>i));
      this.geometries.set(kind, geometry);
    }
    return this.geometries.get(kind);
  }
  texture(kind) {
    if (this.textures.has(kind)) return this.textures.get(kind);
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const ctx = c.getContext('2d'); ctx.fillStyle = '#e8e5dc'; ctx.fillRect(0, 0, 128, 128);
    // Deterministic procedural textures, available offline without external assets.
    for (let i = 0; i < 70; i++) {
      const x = (i * 37) % 128, y = (i * 61 + Math.floor(i / 128) * 13) % 128;
      ctx.fillStyle = i % 2 ? '#ffffff10' : '#26243f0b'; ctx.fillRect(x, y, 2, 2);
    }
    if (kind === 'cloth') {
      ctx.strokeStyle='#5d688012';ctx.lineWidth=.6;
      for(let i=0;i<128;i+=8){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,128);ctx.moveTo(0,i);ctx.lineTo(128,i);ctx.stroke();}
    } else if (kind === 'tile') {
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
  toonRamp() {
    if (!this.textures.has('toon-ramp')) {
      const ramp = new THREE.DataTexture(new Uint8Array([0,0,0,255,158,158,158,255,255,255,255,255]), 3, 1, THREE.RGBAFormat);
      ramp.minFilter = ramp.magFilter = THREE.NearestFilter; ramp.generateMipmaps = false; ramp.needsUpdate = true;
      this.textures.set('toon-ramp', ramp);this.toonGradient=ramp;
    }
    return this.textures.get('toon-ramp');
  }
  gradient() { return this.toonRamp(); }
  material(color, kind = 'plain') {
    const key = `${color}:${kind}`;
    const palette = { '#eadfc8':'#fff1ce', '#c9c1ad':'#e4ca88', '#b8b0a0':'#e7d9ac', '#557b73':'#138a91', '#31564a':'#175d68', '#64766b':'#40577b', '#b99b70':'#d49c4b', '#bc9a63':'#dfa24e', '#8d6e52':'#9f633d', '#62867a':'#228e90', '#698756':'#74a942', '#7b684f':'#a87643', '#dbdbcf':'#fff5dc', '#8faaa0':'#50adb4', '#56656b':'#344966', '#414c4d':'#202b43' };
    if (!this.materials.has(key)) {
      const tint=palette[color.toLowerCase?.()]||color;
      const material=kind==='glass'||kind==='metal'
        ? new THREE.MeshStandardMaterial({color:tint,roughness:kind==='glass'?.25:.72,metalness:kind==='metal'?.5:0})
        : new THREE.MeshToonMaterial({color:tint,gradientMap:this.toonRamp(),map:['tile','plaster','wood','cloth'].includes(kind)?this.texture(kind):null});
      this.materials.set(key,material);
    }
    return this.materials.get(key);
  }
  mesh(kind, color, scale, texture = 'plain') {
    const mesh = new THREE.Mesh(this.geometry(kind), this.material(color, texture));
    mesh.scale.set(...scale); mesh.castShadow = mesh.receiveShadow = true; return mesh;
  }
  dispose() {
    for (const map of [this.geometries, this.materials, this.textures]) { for (const resource of map.values()) resource.dispose(); map.clear(); }
    this.toonGradient = null;
  }
}
