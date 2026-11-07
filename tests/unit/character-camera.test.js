import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Character } from '../../src/systems/character.js';
import { Resources } from '../../src/systems/resources.js';
import { FollowCamera } from '../../src/systems/camera.js';

test('humanoid states blend continuously and articulate joints', () => {
  const resources = new Resources(), actor = new Character(resources);
  actor.update(.05, 3.5); assert.equal(actor.state, 'walk'); assert(actor.weights.walk > 0 && actor.weights.walk < 1); assert(actor.weights.idle > 0);
  assert.notEqual(actor.joints['hip1'].rotation.x, 0);
  for (let i = 0; i < 20; i++) actor.update(.05, 6); assert.equal(actor.state, 'run'); assert(actor.weights.run > .9);
  actor.update(.05, 0, true); assert.equal(actor.state, 'talk'); assert(actor.weights.talk > 0);
  actor.update(.05, 0, false, true); assert.equal(actor.state, 'interact');
  for (let i = 0; i < 20; i++) actor.update(.05, 0); assert.equal(actor.state, 'idle'); assert(actor.weights.idle > .9);
  let meshes = 0; actor.root.traverse(m => { if (m.isMesh) meshes++; }); assert(meshes < 35);
  actor.dispose(); resources.dispose();
});
test('follow camera rotates both axes, clamps pitch and recovers distance smoothly', () => {
  const camera = new THREE.PerspectiveCamera(52, 2, .06, 140);
  const obstacle = { minX: -3, maxX: 3, minY: 0, maxY: 5, minZ: 2, maxZ: 2.3 };
  const orbit = new FollowCamera(camera, [obstacle]); orbit.update({ x: 0, z: 0 }, .016, true);
  assert(orbit.actualDistance < 2); assert(camera.position.z < 2);
  obstacle.enabled = false; const short = orbit.actualDistance; orbit.update({ x: 0, z: 0 }, .016); assert(orbit.actualDistance > short && orbit.actualDistance < 7);
  orbit.rotate(1, 20); assert.equal(orbit.pitch, 1.15); assert.equal(orbit.yaw, 1);
  orbit.rotate(0, -30); assert.equal(orbit.pitch, .08);
});
