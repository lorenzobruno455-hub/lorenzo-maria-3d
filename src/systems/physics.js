export const PLAYER_RADIUS = .32;
export const BOUNDS = { minX: -38, maxX: 38, minZ: -27, maxZ: 29 };
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

// Radial dead zone preserves the direction, including shallow diagonals.
export function joystickVector(dx, dy, radius, deadZone = .12) {
  const length = Math.hypot(dx, dy), strength = clamp(length / radius, 0, 1);
  if (strength <= deadZone) return { x: 0, z: 0 };
  const magnitude = (strength - deadZone) / (1 - deadZone);
  return { x: dx / length * magnitude, z: dy / length * magnitude };
}

export function relativeMovement(x, z, yaw, speed, dt) {
  const length = Math.hypot(x, z), scale = length > 1 ? 1 / length : 1;
  return { x: (x * Math.cos(yaw) + z * Math.sin(yaw)) * scale * speed * dt,
    z: (-x * Math.sin(yaw) + z * Math.cos(yaw)) * scale * speed * dt };
}

export function blocked(x, z, obstacles, radius = PLAYER_RADIUS) {
  if (x < BOUNDS.minX || x > BOUNDS.maxX || z < BOUNDS.minZ || z > BOUNDS.maxZ) return true;
  return obstacles.some(b => b.enabled !== false &&
    x > b.minX - radius && x < b.maxX + radius && z > b.minZ - radius && z < b.maxZ + radius);
}

// Small steps prevent tunnelling through thin walls, even on slow frames.
export function moveWithCollisions(position, delta, obstacles) {
  const steps = Math.max(1, Math.ceil(Math.hypot(delta.x, delta.z) / .12));
  const before = { x: position.x, z: position.z };
  for (let i = 0; i < steps; i++) {
    const x = position.x + delta.x / steps, z = position.z + delta.z / steps;
    if (!blocked(x, position.z, obstacles)) position.x = x;
    if (!blocked(position.x, z, obstacles)) position.z = z;
  }
  return Math.hypot(position.x - before.x, position.z - before.z);
}

// Segment vs expanded AABB; shared by camera and interaction line of sight.
export function segmentHit(from, to, box, padding = 0) {
  let near = 0, far = 1;
  for (const axis of ['x', 'y', 'z']) {
    const lo = box[`min${axis.toUpperCase()}`] - padding;
    const hi = box[`max${axis.toUpperCase()}`] + padding;
    const d = to[axis] - from[axis];
    if (Math.abs(d) < 1e-8) { if (from[axis] < lo || from[axis] > hi) return null; }
    else {
      let a = (lo - from[axis]) / d, b = (hi - from[axis]) / d;
      if (a > b) [a, b] = [b, a];
      near = Math.max(near, a); far = Math.min(far, b);
      if (near > far) return null;
    }
  }
  return near;
}

export function cameraFraction(from, to, obstacles, padding = .24) {
  let fraction = 1;
  for (const box of obstacles) {
    if (box.enabled === false) continue;
    const hit = segmentHit(from, to, box, padding);
    if (hit !== null) fraction = Math.min(fraction, Math.max(.005, hit - .02));
  }
  return fraction;
}
