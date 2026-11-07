import { findPath, clearSegment } from './navigation.js';
import { moveWithCollisions } from './physics.js';
export class RoutineAgent {
  constructor(definition) {
    this.id = definition.id; this.definition = definition; this.position = { ...definition.start }; this.rotation = 0;
    this.index = 0; this.path = []; this.timer = 0; this.stall = 0; this.replan = 0; this.attention = 0; this.state = 'idle'; this.speed = 0; this.distanceWalked = 0; this.transitions = 0; this.forcedKey = '';
  }
  update(dt, { obstacles, planningObstacles = obstacles, others = [], player, speaking = false, hold = false, forcedGoal = null }) {
    this.speed = 0; this.replan -= dt;
    const distance = player ? Math.hypot(player.x - this.position.x, player.z - this.position.z) : Infinity;
    if (distance > 3.5) this.attention = 0;
    if (speaking) { this.state = 'talk'; this.face(player, dt); return; }
    if (hold) { this.state = 'observe'; return; }
    if (!forcedGoal && distance < 2.1 && this.attention < 2.5 && clearSegment(this.position, player, obstacles)) {
      this.attention += dt; this.state = this.attention < .9 ? 'wave' : 'observe'; this.face(player, dt); return;
    }
    const goal = forcedGoal || this.definition.route[this.index], forcedKey = forcedGoal ? `${goal.x},${goal.z}` : '';
    if (forcedKey !== this.forcedKey) { this.path = []; this.timer = 0; this.forcedKey = forcedKey; this.replan = 0; }
    const remaining = Math.hypot(this.position.x - goal.x, this.position.z - goal.z);
    if (remaining < .18) {
      this.path = []; this.timer += dt; this.state = forcedGoal ? 'idle' : goal.state || 'idle';
      if (goal.yaw !== undefined) this.face({ x: this.position.x + Math.sin(goal.yaw), z: this.position.z + Math.cos(goal.yaw) }, dt);
      if (!forcedGoal && this.timer >= (goal.duration || 6)) { this.index = (this.index + 1) % this.definition.route.length; this.timer = 0; this.state = this.state === 'sit' ? 'stand' : 'turn'; this.transitions++; }
      return;
    }
    // A short standing transition occurs before leaving a seat.
    if (this.state === 'stand' && this.timer < .65) { this.timer += dt; return; }
    if (!this.path.length && this.replan <= 0) { this.path = findPath(this.position, goal, planningObstacles); this.replan = 1.2; }
    while (this.path.length && Math.hypot(this.path[0].x - this.position.x, this.path[0].z - this.position.z) < .12) this.path.shift();
    const point = this.path[0]; if (!point) { this.state = 'observe'; return; }
    const dx = point.x - this.position.x, dz = point.z - this.position.z, length = Math.hypot(dx, dz), amount = Math.min(length, 1.45 * dt);
    const delta = { x: dx / length * amount, z: dz / length * amount };
    const crowd = [...others, ...(player ? [{ position: player, id: 'player' }] : [])].filter(a => a.id !== this.id);
    const crowded = crowd.some(a => Math.hypot(this.position.x + delta.x - a.position.x, this.position.z + delta.z - a.position.z) < .72);
    let moved = 0;
    if (!crowded) moved = moveWithCollisions(this.position, delta, obstacles);
    else {
      // Step to the side rather than pushing another actor or stacking in a doorway.
      const sign = this.id.localeCompare(crowd[0]?.id || '') < 0 ? 1 : -1;
      for (const side of [sign, -sign]) {
        const offset = { x: -delta.z * side, z: delta.x * side };
        if (crowd.every(a => Math.hypot(this.position.x + offset.x - a.position.x, this.position.z + offset.z - a.position.z) > .72)) { moved = moveWithCollisions(this.position, offset, obstacles); if (moved) break; }
      }
    }
    this.speed = moved / Math.max(.001, dt); this.distanceWalked += moved;
    this.state = moved > .001 ? 'walk' : 'idle'; if (moved) this.face(point, dt);
    this.stall = moved < .001 ? this.stall + dt : 0;
    if (this.stall > 1.5 || (this.path.length && !clearSegment(this.position, point, obstacles))) { this.path = []; this.replan = Math.min(this.replan, .3); this.stall = 0; }
  }
  face(point, dt) {
    if (!point) return; const angle = Math.atan2(point.x - this.position.x, point.z - this.position.z);
    const difference = Math.atan2(Math.sin(angle - this.rotation), Math.cos(angle - this.rotation)); this.rotation += difference * (1 - Math.exp(-dt * 8));
  }
}
