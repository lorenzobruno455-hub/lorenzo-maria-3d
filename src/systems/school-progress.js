import { clamp } from './physics.js';

// Separate visit coordinates from the existing campaign's campus coordinates.
export function freshSchoolVisit() {
  return { active: false, floor: 0, position: { x: 0, z: 14.5 }, yaw: 0, pitch: .38 };
}
export function validateSchoolVisit(raw) {
  const visit = freshSchoolVisit();
  if (!raw || typeof raw !== 'object') return visit;
  visit.active = raw.active === true;
  visit.floor = Number.isInteger(raw.floor) && raw.floor >= 0 && raw.floor <= 2 ? raw.floor : 0;
  const { x, z } = raw.position || {};
  // Invalid coordinates return to the corridor; clamping could place a player inside a wall.
  if (Number.isFinite(x) && Number.isFinite(z) && Math.abs(x) <= 10.8 && Math.abs(z) <= 18.8) visit.position = { x, z };
  visit.yaw = Number.isFinite(raw.yaw) ? raw.yaw % (2 * Math.PI) : 0;
  visit.pitch = Number.isFinite(raw.pitch) ? clamp(raw.pitch, .08, 1.15) : .38;
  return visit;
}
