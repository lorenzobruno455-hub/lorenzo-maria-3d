import * as THREE from 'three';
import { clamp, cameraFraction } from './physics.js';

export class FollowCamera {
  constructor(camera, obstacles, yaw = 0, pitch = .38) {
    this.camera = camera; this.obstacles = obstacles; this.yaw = yaw; this.pitch = pitch;
    this.probe = new THREE.Vector3(); this.distance = 7; this.actualDistance = 7; this.focus = new THREE.Vector3(); this.desired = new THREE.Vector3(); this.position = new THREE.Vector3(); this.initialized = false;
  }
  rotate(x, y) { this.yaw = (this.yaw + x) % (Math.PI * 2); this.pitch = clamp(this.pitch + y, .08, 1.15); }
  update(player, dt, snap = false) {
    snap=!!(snap||(this.reducedMotion&&(this.focusObject||this.conversation||this.wasNarrative)));
    const floorY = Number.isFinite(player.y) ? player.y : 0;
    const focusY = Number.isFinite(this.focusObject?.y) ? this.focusObject.y : floorY + 1.42;
    const target = new THREE.Vector3(this.focusObject?.x ?? player.x, focusY, this.focusObject?.z ?? player.z);
    if (this.conversation && this.partner) target.set((player.x + this.partner.x) / 2, Number.isFinite(this.focusObject?.y) ? this.focusObject.y : floorY + 1.5, (player.z + this.partner.z) / 2);
    if (!this.initialized || snap) this.focus.copy(target); else this.focus.lerp(target, 1 - Math.exp(-dt * 12));
    // Never interpolate the focus through a wall when the player turns a corner.
    if (cameraFraction(target, this.focus, this.obstacles, .08) < 1) this.focus.copy(target);
    const distance = this.focusObject ? (this.focusObject.distance||3.2) : this.conversation ? 3.8 : (this.interiorDistance || this.distance);
    const viewYaw = this.focusObject?.yaw ?? (this.conversation && this.partner ? Math.atan2(this.partner.x - player.x, this.partner.z - player.z) + 1.1 : this.yaw);
    this.renderYaw = !this.initialized || snap ? viewYaw : this.renderYaw + Math.atan2(Math.sin(viewYaw - this.renderYaw), Math.cos(viewYaw - this.renderYaw)) * (1 - Math.exp(-dt * 12));
    const requestedPitch=this.focusObject?.pitch??this.pitch;
    this.renderPitch=!this.initialized||snap?requestedPitch:THREE.MathUtils.damp(this.renderPitch,requestedPitch,12,dt);
    const viewPitch=this.renderPitch;
    this.desired.set(Math.sin(this.renderYaw) * Math.cos(viewPitch), Math.sin(viewPitch), Math.cos(this.renderYaw) * Math.cos(viewPitch)).multiplyScalar(distance).add(this.focus);
    const probeDistance=Math.max(distance,this.actualDistance);
    this.probe.copy(this.desired).sub(this.focus).normalize().multiplyScalar(probeDistance).add(this.focus);
    const obstruction=cameraFraction(this.focus,this.probe,this.obstacles,.28);
    const limit=probeDistance*obstruction,allowed=Math.min(distance,limit);
    const collision=obstruction<1&&limit<this.actualDistance;
    this.actualDistance = snap||collision||(!this.focusObject&&allowed<this.actualDistance) ? allowed : THREE.MathUtils.damp(this.actualDistance, allowed, this.focusObject?8:5, dt);
    this.position.copy(this.desired).sub(this.focus).normalize().multiplyScalar(this.actualDistance).add(this.focus);
    // Resolve after smoothing too. Padding covers the camera near plane, including screen edges.
    const fraction = cameraFraction(target, this.position, this.obstacles, .2);
    if (fraction < 1) this.position.lerpVectors(target, this.position, fraction);
    this.camera.position.copy(this.position); this.worldFocus ||= new THREE.Vector3();this.worldFocus.copy(this.focus);this.camera.parent?.localToWorld(this.worldFocus);this.camera.lookAt(this.worldFocus); this.initialized = true;this.wasNarrative=!!(this.focusObject||this.conversation);
  }
}
