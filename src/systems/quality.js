import * as THREE from 'three';
export const PRESETS = { low: { ratio: 1, shadow: 0 }, medium: { ratio: 1.35, shadow: 1024 }, high: { ratio: 1.75, shadow: 2048 } };
export class Quality {
  constructor(renderer, sun, settings) { this.renderer = renderer; this.sun = sun; this.settings = settings; this.scale = 1; this.frames = 0; this.seconds = 0; this.fps = 60; this.shadowSignature = null;this.bufferSignature=null;this.fastSeconds=0; this.apply(); }
  apply(reset = true) {
    if (reset){this.scale = 1;this.fastSeconds=0;}
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

  resize() {const ratio=Math.min(devicePixelRatio || 1,PRESETS[this.settings.quality].ratio)*this.scale,signature=`${innerWidth}:${innerHeight}:${ratio}`;if(signature===this.bufferSignature)return false;this.bufferSignature=signature;if(this.renderer.setDrawingBufferSize)this.renderer.setDrawingBufferSize(innerWidth,innerHeight,ratio);else{this.renderer.setPixelRatio(ratio);this.renderer.setSize(innerWidth,innerHeight,false);}return true;}
  sample(dt) {
    if (!Number.isFinite(dt) || dt <= 0 || dt > 2) { this.resetSample(); return; }
    this.frames++; this.seconds += dt;
    if (this.seconds < 3) return;
    this.fps = this.frames / this.seconds;
    if (this.settings.adaptive) {
      const before = this.scale;
      this.fastSeconds=this.fps>55?this.fastSeconds+this.seconds:0;
      if(this.fps<32)this.scale=Math.max(.55,Math.min(this.scale-.1,this.scale*Math.sqrt(this.fps/40)));
      else if(this.fps>55&&this.fastSeconds>=15){this.scale=Math.min(1,this.scale+.05);this.fastSeconds=0;}
      if (before !== this.scale) this.resize();
    }
    this.frames = this.seconds = 0;
  }
}
