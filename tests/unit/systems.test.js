import { test } from 'node:test';
import assert from 'node:assert/strict';
import { joystickVector, relativeMovement, moveWithCollisions, cameraFraction, segmentHit, blocked } from '../../src/systems/physics.js';
import { collect, freshProgress, mariaDialogue, objective, validateProgress, validateSettings, loadSave, saveProgress, SAVE_KEY } from '../../src/systems/progress.js';
const wall = { minX: -2, maxX: 2, minY: 0, maxY: 4, minZ: 0, maxZ: .15 };
const memory = () => { const data = new Map(); return { getItem: k => data.get(k), setItem: (k, v) => data.set(k, v) }; };

test('analogue movement is radial, proportional and capped', () => {
  assert.deepEqual(joystickVector(0, 0, 50), { x: 0, z: 0 });
  assert.deepEqual(joystickVector(3, 3, 50), { x: 0, z: 0 });
  const half = joystickVector(25, 0, 50), full = joystickVector(100, 0, 50);
  assert(half.x > 0 && half.x < full.x); assert.equal(full.x, 1);
  const diagonal = joystickVector(50, 50, 50); assert(Math.abs(Math.hypot(diagonal.x, diagonal.z) - 1) < 1e-9);
  const shallow = joystickVector(50, 2, 50); assert(shallow.z > 0);
});
test('diagonal speed is normalized; walk and run are camera relative', () => {
  assert(Math.abs(Math.hypot(...Object.values(relativeMovement(1, 1, 0, 3.5, 1))) - 3.5) < 1e-9);
  const forward = relativeMovement(0, -1, Math.PI / 2, 6, 1); assert(Math.abs(forward.x + 6) < 1e-9); assert(Math.abs(forward.z) < 1e-8);
  assert.equal(relativeMovement(.5, 0, 0, 3.5, 1).x, 1.75);
});
test('thin walls stop tunnelling at large delta and allow sliding', () => {
  const p = { x: 0, z: -3 }; moveWithCollisions(p, { x: 1, z: 8 }, [wall]);
  assert(p.z <= -.31); assert(p.x > .9); assert(!blocked(p.x, p.z, [wall]));
});
test('world bounds and disabled open obstacles', () => {
  assert(!blocked(39, 0, [])); assert(blocked(83, 0, [])); assert(!blocked(0, .1, [{ ...wall, enabled: false }]));
});
test('camera contracts before walls, ceilings and near-plane edges', () => {
  const from = { x: 0, y: 1.5, z: -3 }, to = { x: 0, y: 2.5, z: 4 };
  const f = cameraFraction(from, to, [wall]); assert(f > 0 && f < .4);
  assert.equal(cameraFraction(from, to, [{ ...wall, enabled: false }]), 1);
  assert.equal(segmentHit({ x: 5, y: 1, z: -2 }, { x: 5, y: 1, z: 2 }, wall), null);
  const roof = { minX: -5, maxX: 5, minY: 3, maxY: 3.3, minZ: -5, maxZ: 5 };
  assert(cameraFraction({ x: 0, y: 1, z: 0 }, { x: 0, y: 6, z: 0 }, [roof]) < .4);
});
test('entire initial chapter and all original dialogue branches', () => {
  const p = freshProgress(); assert.match(objective(p), /Maria/); assert.equal(collect(p, 'notebook'), false);
  const intro = mariaDialogue(p); assert.match(intro.text, /Espalhei três lembranças/); p.stage = intro.nextStage;
  assert.equal(collect(p, 'notebook'), true); assert.equal(collect(p, 'notebook'), false); assert.equal(collect(p, 'unknown'), false);
  assert.match(mariaDialogue(p).text, /Faltam 2/); collect(p, 'card'); collect(p, 'photo');
  assert.match(objective(p), /Volte/); const ending = mariaDialogue(p); assert.equal(ending.nextStage, 2); p.stage = ending.nextStage; assert.match(objective(p), /concluído/);
});
test('autosave roundtrip preserves mission, camera, doors and settings', () => {
  const p = freshProgress(); p.stage = 1; p.collected = ['card']; p.position = { x: 5, z: 6 }; p.yaw = 1; p.doors = [true, false];
  const s = memory(); assert(saveProgress(s, p, { quality: 'high', volume: .3 }));
  const loaded = loadSave(s); assert.equal(loaded.progress.collected[0], 'card'); assert.equal(loaded.progress.doors[0], true); assert.equal(loaded.settings.quality, 'high'); assert.equal(loaded.progress.position.x, 5);
});
test('bad saves, denied storage, duplicate IDs and invalid settings recover safely', () => {
  const s = memory(); s.setItem(SAVE_KEY, '{invalid'); assert.equal(loadSave(s).progress.stage, 0);
  assert.equal(loadSave(null).exists, false); assert.equal(saveProgress(null, freshProgress(), {}), false);
  const p = validateProgress({ stage: 2, collected: ['card', 'card', 'evil'], position: { x: Infinity, z: 3 }, pitch: -99 });
  assert.equal(p.stage, 1); assert.deepEqual(p.collected, ['card']); assert.equal(p.position.x, 0); assert.equal(p.pitch, .08);
  assert.equal(validateSettings({ quality: 'ultra', volume: 10 }).quality, 'medium'); assert.equal(validateSettings({ volume: 10 }).volume, 1);
});
