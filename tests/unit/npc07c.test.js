import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { NPC_CHARACTER_ASSETS } from '../../src/character-assets.js';
import { NPC_DATA } from '../../src/systems/social.js';

for (const npc of NPC_DATA) test(`${npc.id}: original NPC model supports all routine and reaction states`, async () => {
  const asset = NPC_CHARACTER_ASSETS[npc.id];
  assert(asset && asset.height > 1.5 && asset.height < 2);
  const bytes = await readFile(`public${asset.url}`);
  assert(bytes.length < 1_000_000, 'NPC exceeds its download budget');
  const g = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString());
  assert.equal(g.skins[0].joints.length, 18);
  assert.equal(g.animations.length, 16);
  const clips = g.animations.map(a => a.name);
  for (const state of new Set(['idle', 'walk', 'talk', 'observe', 'react', ...npc.route.map(r => r.state)])) {
    assert(clips.includes(asset.clips[state]), state);
  }
  assert(g.meshes.every(m => m.primitives.every(p => p.attributes.JOINTS_0 !== undefined)));
  assert(g.nodes.some(n => n.extras?.fictional && n.extras?.license === 'CC0-1.0'));
});

test('NPC identities have distinct palettes', async () => {
  const identities = [];
  for (const { url } of Object.values(NPC_CHARACTER_ASSETS)) {
    const bytes = await readFile(`public${url}`);
    const g = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString());
    identities.push(JSON.stringify(g.materials.map(m => m.pbrMetallicRoughness.baseColorFactor)));
  }
  assert.equal(new Set(identities).size, 5);
});
