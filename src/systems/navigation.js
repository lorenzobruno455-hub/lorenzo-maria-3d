import { blocked, BOUNDS } from './physics.js';
const key = (x, z) => `${x},${z}`;
export function clearSegment(a, b, obstacles, radius = .31) {
  const count = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / .2));
  for (let i = 0; i <= count; i++) if (blocked(a.x + (b.x - a.x) * i / count, a.z + (b.z - a.z) * i / count, obstacles, radius)) return false;
  return true;
}
function freeNode(point, obstacles) {
  const x = Math.round(point.x), z = Math.round(point.z);
  for (let r = 0; r <= 3; r++) for (let dx = -r; dx <= r; dx++) for (let dz = -r; dz <= r; dz++) {
    const p = { x: x + dx, z: z + dz }; if (!blocked(p.x, p.z, obstacles, .31) && clearSegment(point, p, obstacles)) return p;
  }
  return null;
}
// Connected one-metre waypoints with A*. Diagonals require both adjoining lanes.
export function findPath(from, to, obstacles) {
  if (clearSegment(from, to, obstacles)) return [{ x: to.x, z: to.z }];
  const start = freeNode(from, obstacles), end = freeNode(to, obstacles); if (!start || !end) return [];
  const startKey = key(start.x, start.z), endKey = key(end.x, end.z);
  const open = [{ ...start, key: startKey, g: 0, f: 0 }], costs = new Map([[startKey, 0]]), parents = new Map(), visited = new Set();
  let iterations = 0;
  while (open.length && iterations++ < 7000) {
    let index = 0; for (let i = 1; i < open.length; i++) if (open[i].f < open[index].f) index = i;
    const n = open.splice(index, 1)[0]; if (visited.has(n.key)) continue; visited.add(n.key);
    if (n.key === endKey) {
      const path = [{ x: end.x, z: end.z }]; let current = endKey;
      while (parents.has(current)) { const p = parents.get(current); path.unshift({ x: p.x, z: p.z }); current = p.key; }
      if (clearSegment(path.at(-1), to, obstacles)) path.push({ x: to.x, z: to.z }); return path;
    }
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const x = n.x + dx, z = n.z + dz; if (x < BOUNDS.minX || x > BOUNDS.maxX || z < BOUNDS.minZ || z > BOUNDS.maxZ) continue;
      const k = key(x, z); if (visited.has(k) || !clearSegment(n, { x, z }, obstacles)) continue;
      if (dx && dz && (blocked(n.x + dx, n.z, obstacles) || blocked(n.x, n.z + dz, obstacles))) continue;
      const g = n.g + Math.hypot(dx, dz); if (g >= (costs.get(k) ?? Infinity)) continue;
      costs.set(k, g); parents.set(k, n); open.push({ x, z, key: k, g, f: g + Math.hypot(x - end.x, z - end.z) });
    }
  }
  return [];
}
