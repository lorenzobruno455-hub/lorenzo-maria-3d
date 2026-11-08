import * as THREE from 'three';
import { batchMeshes } from './batching.js';

// Neutral study mannequins: no claim about either person's actual appearance.
// Named joint pivots support continuous blended procedural animation.
export class Character {
  constructor(resources, uniform = '#d6d9d2', { simple = false } = {}) {
    this.root = new THREE.Group(); this.root.userData.inkActor=true; this.body = new THREE.Group(); this.root.add(this.body); this.body.name = 'body';
    this.resources = resources; this.time = 0; this.state = 'idle'; this.weights = { idle: 1, walk: 0, run: 0, talk: 0, interact: 0, turn: 0, sit: 0, stand: 0, wave: 0, observe: 0, react: 0 };
    this.owned = []; this.joints = {}; this.custom = null; this.mixer = null; this.actions = {};
    const mesh = (kind, color, scale, parent, position = [0, 0, 0]) => {
      if (simple) { if (parent === this.body && color !== '#56656b') color = uniform; if (parent.name.startsWith('shoulder')) color = uniform; if (color === '#414c4d') color = '#56656b'; }
      const m = resources.mesh(kind, color, scale); m.position.set(...position); parent.add(m); return m;
    };
    const joint = (name, parent, pos) => { const j = new THREE.Group(); j.name = name; j.position.set(...pos); parent.add(j); this.joints[name] = j; return j; };
    const neutral = '#b8bab2', trousers = '#56656b', shoe = '#414c4d';
    // Lathed torso follows shoulders, waist and hip instead of a single capsule.
    const torsoGeo = new THREE.LatheGeometry([new THREE.Vector2(.16, 0), new THREE.Vector2(.18, .07), new THREE.Vector2(.16, .22), new THREE.Vector2(.22, .44), new THREE.Vector2(.24, .51), new THREE.Vector2(.11, .56)], 16);
    const torso = new THREE.Mesh(torsoGeo, resources.material(uniform)); torso.position.y = .91; torso.scale.z = .62; torso.castShadow = true; this.body.add(torso); this.owned.push(torsoGeo);
    mesh('sphere', trousers, [.185, .14, .12], this.body, [0, .94, 0]);
    mesh('cylinder', neutral, [.075, .12, .075], this.body, [0, 1.49, 0]);
    const head = joint('head', this.body, [0, 1.64, 0]);
    mesh('sphere', neutral, [.13, .18, .135], head);
    // Subtle neutral anatomical landmarks, without specific personal features.
    mesh('sphere', neutral, [.09, .085, .095], head, [0, -.095, .03]);
    mesh('sphere', neutral, [.028, .044, .04], head, [0, -.015, .128]);
    for (const side of [-1, 1]) {
      mesh('sphere', neutral, [.025, .05, .035], head, [side * .128, -.015, 0]);
      const hip = joint(`hip${side}`, this.body, [side * .105, .94, 0]);
      mesh('sphere', trousers, [.092, .21, .095], hip, [0, -.18, 0]);
      const knee = joint(`knee${side}`, hip, [0, -.41, 0]);
      mesh('sphere', trousers, [.075, .21, .08], knee, [0, -.18, 0]);
      mesh('sphere', shoe, [.085, .065, .15], knee, [0, -.43, .055]);
      const shoulder = joint(`shoulder${side}`, this.body, [side * .245, 1.39, 0]);
      mesh('sphere', uniform, [.082, .14, .083], shoulder, [0, -.09, 0]);
      mesh('sphere', neutral, [.061, .135, .06], shoulder, [0, -.18, 0]);
      const elbow = joint(`elbow${side}`, shoulder, [0, -.28, 0]);
      mesh('sphere', neutral, [.052, .145, .05], elbow, [0, -.12, 0]);
      mesh('sphere', neutral, [.052, .08, .027], elbow, [0, -.3, .01]);
      // Four finger ridges and thumb give the placeholder hands a readable silhouette.
      for (let f = 0; f < 4; f++) mesh('sphere', neutral, [.009, .035, .013], elbow, [side * (.03 - f * .019), -.36, .01]);
      mesh('sphere', neutral, [.017, .04, .017], elbow, [side * .055, -.29, .025]);
      shoulder.rotation.z = side * .08;
    }
    // Collar, seams and plain shoes suggest school clothes without defining identity.
    mesh('box', '#eeeae0', [.08, .035, .12], this.body, [0, 1.425, .105]);
    mesh('box', '#929d94', [.065, .085, .01], this.body, [-.11, 1.27, .126]);
    mesh('box', '#727e7e', [.33, .025, .22], this.body, [0, .99, 0]);
    for (const parent of [this.body, ...Object.values(this.joints)]) {
      batchMeshes(parent, parent.children.filter(m => m.isMesh), this.owned);
      parent.children.filter(m => m.isMesh).forEach((m, i) => {
        const key = `humanoid:${simple ? 'npc' : 'full'}:${parent.name}:${i}`, cached = resources.geometries.get(key);
        this.owned = this.owned.filter(g => g !== m.geometry);
        if (cached) { m.geometry.dispose(); m.geometry = cached; } else resources.geometries.set(key, m.geometry);
      });
    }
    this.gait = 0;this.body.updateMatrixWorld(true);this.soleHeight=new THREE.Box3().setFromObject(this.body).min.y;
  }
  update(dt, speed = 0, talking = false, interacting = false, pose = {}) {
    this.time += dt;
    const next = pose.state || (interacting ? 'interact' : talking ? 'talk' : speed > 4 ? 'run' : speed > .12 ? 'walk' : 'idle');
    if (this.state !== next) {
      const previous = this.actions[this.state], action = this.actions[next] || this.actions.idle;
      if (action && action !== previous) { action.reset().play(); if (previous) action.crossFadeFrom(previous, .22, false); }
      this.state = next;
    }
    for (const name in this.weights) this.weights[name] = THREE.MathUtils.damp(this.weights[name], name === next ? 1 : 0, 10, dt);
    if (this.mixer) { this.mixer.update(dt); return; }
    this.gait += speed * dt * 2.7;
    const w = this.weights, stride = Math.sin(this.gait);
    this.body.position.y = -this.soleHeight + Math.abs(stride) * (.012 * w.walk + .025 * w.run);
    this.body.position.y -= .5 * w.sit;
    this.body.rotation.x = -.06 * w.run - .08 * w.observe + .07 * w.react;
    this.joints.head.rotation.y = Math.sin(this.time * 1.4) * (.04 * w.idle + .12 * w.talk);
    this.joints.head.rotation.x = Math.sin(this.time * 3) * .05 * w.talk + .2 * w.observe - .12 * w.react;
    for (const side of [-1, 1]) {
      const swing = stride * side;
      this.joints[`hip${side}`].rotation.x = swing * (.5 * w.walk + .85 * w.run) - 1.45 * w.sit;
      this.joints[`knee${side}`].rotation.x = Math.max(0, -swing) * (.6 * w.walk + 1.1 * w.run) + 1.45 * w.sit;
      this.joints[`shoulder${side}`].rotation.x = -swing * (.4 * w.walk + .7 * w.run) - (side === -1 ? .25 + Math.sin(this.time * 3) * .25 : .1) * w.talk - .9 * w.interact - (side === 1 ? 1.8 : .1) * w.wave - .25 * w.observe;
      this.joints[`shoulder${side}`].rotation.z = side * (.07 + .08 * w.talk + (side === 1 ? .3 + Math.sin(this.time * 5) * .12 : 0) * w.wave);
      this.joints[`elbow${side}`].rotation.x = -.12 - .65 * w.run - (.5 + Math.sin(this.time * 2) * .12) * w.talk - .2 * w.interact - .8 * w.sit - .3 * w.react;
    }
  }
  async loadGLB(url, clipNames = {}, pipeline, options = {}) {
    // A newer request always wins, including completion after teardown.
    const request = this.loadRequest = (this.loadRequest || 0) + 1;
    let lease;
    if (pipeline) lease = await pipeline.acquire(url, options);
    else {
      const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
      const gltf = await new GLTFLoader().loadAsync(url);
      const bounds = new THREE.Box3().setFromObject(gltf.scene), height = bounds.max.y - bounds.min.y;
      if (!Number.isFinite(height) || height < .01) { this.disposeModel(gltf.scene); throw new Error('Modelo sem altura válida'); }
      const scale = 1.82 / height; gltf.scene.scale.multiplyScalar(scale);
      gltf.scene.position.set(-(bounds.min.x+bounds.max.x)*scale/2,-bounds.min.y*scale,-(bounds.min.z+bounds.max.z)*scale/2);
      lease = { model: gltf.scene, animations:gltf.animations, release:()=>{gltf.scene.removeFromParent();this.disposeModel(gltf.scene);} };
    }
    if (this.disposed || request !== this.loadRequest) { lease.release(); return {animations:[],superseded:true}; }
    if(this.mixer) {this.mixer.stopAllAction();this.mixer.uncacheRoot(this.custom);}
    this.modelLease?.release();
    this.modelLease=lease;this.custom=lease.model;this.actions={};
    this.body.visible=false;this.root.add(this.custom);this.mixer=new THREE.AnimationMixer(this.custom);
    for(const state of Object.keys(this.weights)) {
      const clip=lease.animations.find(c=>c.name.toLowerCase()===(clipNames[state]||state).toLowerCase());
      if(clip)this.actions[state]=this.mixer.clipAction(clip);
    }
    (this.actions[this.state]||this.actions.idle)?.play();
    return {animations:Object.keys(this.actions)};
  }
  disposeModel(model) { model.traverse(m => { if (m.isMesh) { m.geometry.dispose(); for (const mat of Array.isArray(m.material) ? m.material : [m.material]) { for (const value of Object.values(mat)) if (value?.isTexture) value.dispose(); mat.dispose(); } } }); }
  dispose() { this.disposed = true; this.owned.forEach(g => g.dispose()); if (this.custom) { this.mixer?.stopAllAction(); this.mixer?.uncacheRoot(this.custom); this.modelLease?.release(); } }
}
