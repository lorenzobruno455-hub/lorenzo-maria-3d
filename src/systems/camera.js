import * as THREE from 'three';
import { clamp, cameraFraction } from './physics.js';

export class FollowCamera {
  constructor(camera, obstacles, yaw = 0, pitch = .38) {
    this.camera = camera; this.obstacles = obstacles; this.yaw = yaw; this.pitch = pitch;
    this.distance = 7; this.actualDistance = 7; this.focus = new THREE.Vector3(); this.desired = new THREE.Vector3(); this.position = new THREE.Vector3(); this.initialized = false;
  }
  rotate(x, y) { this.yaw = (this.yaw + x) % (Math.PI * 2); this.pitch = clamp(this.pitch + y, .08, 1.15); }
  update(player, dt, snap = false) {
    const target = new THREE.Vector3(this.focusObject?.x ?? player.x, this.focusObject?.y ?? 1.42, this.focusObject?.z ?? player.z);
    if (!this.initialized || snap) this.focus.copy(target); else this.focus.lerp(target, 1 - Math.exp(-dt * 12));
    // Never interpolate the focus through a wall when the player turns a corner.
    if (cameraFraction(target, this.focus, this.obstacles, .08) < 1) this.focus.copy(target);
    const distance = this.focusObject ? 3.2 : this.conversation ? 3.8 : this.distance;
    this.desired.set(Math.sin(this.yaw) * Math.cos(this.pitch), Math.sin(this.pitch), Math.cos(this.yaw) * Math.cos(this.pitch)).multiplyScalar(distance).add(this.focus);
    const allowed = distance * cameraFraction(this.focus, this.desired, this.obstacles, .28);
    this.actualDistance = allowed < this.actualDistance || snap ? allowed : THREE.MathUtils.damp(this.actualDistance, allowed, 5, dt);
    this.position.copy(this.desired).sub(this.focus).normalize().multiplyScalar(this.actualDistance).add(this.focus);
    // Resolve after smoothing too. Padding covers the camera near plane, including screen edges.
    const fraction = cameraFraction(target, this.position, this.obstacles, .2);
    if (fraction < 1) this.position.lerpVectors(target, this.position, fraction);
    this.camera.position.copy(this.position); this.camera.lookAt(this.focus); this.initialized = true;
  }
}
