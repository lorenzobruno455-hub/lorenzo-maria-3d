import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Resources } from '../../src/systems/resources.js';
import { Character } from '../../src/systems/character.js';
import { OutlineManager } from '../../src/systems/outline-manager.js';

test('Colorbeat surfaces use an efficient shared three-band toon ramp', () => {
  const resources = new Resources();
  const paper = resources.material('#fff5dc');
  const wood = resources.material('#805940');
  const metal = resources.material('#52606a', 'metal');
  assert(paper instanceof THREE.MeshToonMaterial);
  assert(wood instanceof THREE.MeshToonMaterial);
  assert.equal(paper.gradientMap, wood.gradientMap);
  assert.equal(paper.gradientMap.image.width, 3);
  assert.equal(paper.gradientMap.image.height, 1);
  assert.equal(paper.gradientMap.magFilter, THREE.NearestFilter);
  assert(metal instanceof THREE.MeshToonMaterial);
  assert(metal.userData.colorbeat.specular>0);
  resources.dispose();
  assert.equal(resources.toonGradient, null);
});

test('Colorbeat outlines follow humanoid pivots without adding shadows or collisions', () => {
  const resources = new Resources(), lorenzo = new Character(resources), maria = new Character(resources, '#97a9b3');
  const outlines = new OutlineManager();
  const total = outlines.attach(lorenzo) + outlines.attach(maria);
  assert(total > 0);
  assert.equal(outlines.shells.length, total);
  assert(outlines.shells.every(mesh => !mesh.castShadow && !mesh.receiveShadow));
  assert(outlines.shells.every(mesh => mesh.material.side === THREE.BackSide));
  assert(outlines.shells.every(mesh => mesh.parent?.isMesh));
  outlines.setQuality('low');
  assert(outlines.shells.every(mesh => !mesh.visible));
  outlines.setQuality('high');
  assert(outlines.shells.every(mesh => mesh.visible));
  lorenzo.update(.05, 4);
  const first = outlines.shells[0];
  assert(first.parent);
  outlines.dispose();
  assert(!first.parent);
  lorenzo.dispose(); maria.dispose(); resources.dispose();
});
