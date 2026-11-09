import * as THREE from 'three';
export const PRESETS = { low: { ratio: 1, shadow: 0 }, medium: { ratio: 1.35, shadow: 1024 }, high: { ratio: 1.75, shadow: 2048 } };
export class Quality {
  constructor(renderer, sun, settings) { this.renderer = renderer; this.sun = sun; this.settings = settings; this.scale = 1; this.frames = 0; this.seconds = 0; this.fps = 60; this.shadowSignature = null; this.apply(); }
  apply(reset = true) {
    if (reset) this.scale = 1;
    const preset = PRESETS[this.settings.quality];
    const shadows = this.settings.shadows && preset.shadow > 0;
    const signature = `${shadows}:${preset.shadow}`;
    if (signature !== this.shadowSignature) {
      this.renderer.shadowMap.enabled = shadows; this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.sun.castShadow = shadows;
      this.sun.shadow.map?.dispose(); this.sun.shadow.map = null;
      this.sun.shadow.mapSize.set(preset.shadow || 512, preset.shadow || 512);
      this.renderer.shadowMap.needsUpdate = true; this.shadowSignature = signature;
    }
    this.resetSample(); this.resize();
  }
  resetSample() { this.frames = this.seconds = 0; }

  resize() { this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, PRESETS[this.settings.quality].ratio) * this.scale); this.renderer.setSize(innerWidth, innerHeight, false); }
  sample(dt) {
    if (!Number.isFinite(dt) || dt <= 0 || dt > 2) { this.resetSample(); return; }
    this.frames++; this.seconds += dt;
    if (this.seconds < 3) return;
    this.fps = this.frames / this.seconds;
    if (this.settings.adaptive) {
      const before = this.scale;
      if (this.fps < 32) this.scale = Math.max(.55, this.scale - .1);
      else if (this.fps > 55) this.scale = Math.min(1, this.scale + .05);
      if (before !== this.scale) this.resize();
    }
    this.frames = this.seconds = 0;
  }
}
