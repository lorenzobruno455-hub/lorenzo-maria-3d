import { createStoryWorld } from '../../src/systems/story-world.js';
import memories from '../../src/data/memories.json' with { type: 'json' };
import catalogue from '../../src/data/minigames.json' with { type: 'json' };
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { findPath, clearSegment } from '../../src/systems/navigation.js';
import { RoutineAgent } from '../../src/systems/npcs.js';
import { freshLiving, validateLiving, befriend, rememberLine, solveFriendActivity, NPC_DATA } from '../../src/systems/social.js';
import { eventAction } from '../../src/systems/events.js';
import { freshProgress, loadSave, saveProgress, SAVE_KEY, PREVIOUS_SAVE_KEY } from '../../src/systems/progress.js';
import { createWorld } from '../../src/systems/world.js';
import { Character } from '../../src/systems/character.js';
import { LivingSchool } from '../../src/systems/living.js';
import { blocked,BOUNDS } from '../../src/systems/physics.js';

test('waypoint path goes around walls and rejects disconnected destinations', () => {
  const wall = { minX: -1, maxX: 1, minY: 0, maxY: 4, minZ: -5, maxZ: 5 };
  const from = { x: -3, z: 0 }, to = { x: 3, z: 0 }, path = findPath(from, to, [wall]);
  assert(path.length > 2); let previous = from; for (const node of path) { assert(clearSegment(previous, node, [wall])); previous = node; }
  const sealed = { minX: -1, maxX: 1, minY: 0, maxY: 4, minZ: BOUNDS.minZ-1, maxZ: BOUNDS.maxZ+1 }; assert.equal(findPath(from, to, [sealed]).length, 0);
});
test('routine agent travels, sits, stands, resumes and reacts to proximity', () => {
  const agent = new RoutineAgent({ id: 'test', start: { x: 0, z: 0 }, route: [{ x: 3, z: 0, state: 'sit', duration: 1 }, { x: 0, z: 0, state: 'observe', duration: 1 }] });
  const states = new Set(); for (let i = 0; i < 160; i++) { agent.update(.1, { obstacles: [] }); states.add(agent.state); }
  assert(states.has('walk')); assert(states.has('sit')); assert(states.has('stand')); assert(agent.transitions >= 2);
  agent.update(.1, { obstacles: [], player: { x: agent.position.x, z: agent.position.z + 1 } }); assert.equal(agent.state, 'wave');
});
test('all three contextual events have requirements, branches and idempotent rewards', () => {
  const s = freshLiving();
  for (const id of ['lost-book', 'physics-question', 'familiar-music']) {
    assert.equal(eventAction(s, id, 'complete'), false); assert(eventAction(s, id, 'start'));
    if (id === 'physics-question') assert(eventAction(s, id, 'answer', 'heavy')); else assert(eventAction(s, id, 'find'));
    assert(eventAction(s, id, 'complete')); assert.equal(eventAction(s, id, 'complete'), false);
  }
  assert.equal(Object.keys(s.achievements).length, 3); assert.equal(s.reputation.bia, 2); assert.equal(s.decisions['physics-question'], 'heavy');
  assert.equal(befriend(s, 'maria', 'invalid'), false); assert.equal(befriend(s, 'lorenzo', 'invalid'), false);
  assert.equal(befriend(s, 'bia', 'event:lost-book'), false);
});
test('social history, free mode and v03 migration preserve narrative campaign', () => {
  const map = new Map(), store = { getItem: k => map.get(k), setItem: (k, v) => map.set(k, v) }, p = freshProgress(); p.stage = 1; p.collected = ['card']; p.campaign.talks = 9;
  const old = JSON.stringify({ version: 3, progress: p, settings: { quality: 'low', volume: .4 } }); store.setItem(PREVIOUS_SAVE_KEY, old);
  const saved = loadSave(store); saved.progress.living.mode = 'free'; rememberLine(saved.progress.living, { speaker: 'BIA', text: 'Uma conversa fictícia.', provenance: 'school-fiction' });
  assert(saveProgress(store, saved.progress, saved.settings)); assert.equal(JSON.parse(store.getItem(SAVE_KEY)).version, 4); assert.equal(store.getItem(PREVIOUS_SAVE_KEY), old);
  assert.equal(loadSave(store).progress.campaign.talks, 9); assert.deepEqual(loadSave(store).progress.collected, ['card']); assert.equal(loadSave(store).progress.living.mode, 'free'); assert.equal(loadSave(store).progress.living.history.length, 1);
  assert.equal(validateLiving({ reputation: { bia: 999 }, mode: 'bad' }).reputation.bia, 5); assert.equal(loadSave(store).settings.musicVolume, .4);
});
test('five NPCs and Maria navigate the actual school without entering walls', () => {
  const previousDocument = globalThis.document;
  globalThis.document = { createElement: () => ({ width: 128, height: 128, getContext: () => new Proxy({}, { get: () => () => {} }) }) };
  const scene = new THREE.Scene(), world = createWorld(scene), storyWorld = createStoryWorld(scene, world, memories, catalogue), maria = new Character(world.resources), player = new THREE.Object3D(); player.position.set(0, .08, 19);
  const p = freshProgress(); p.living.mode = 'free'; const noop = () => {};
  const living = new LivingSchool({ scene, world, maria, player, getProgress: () => p, settings: { quality: 'low' }, dialogue: { start: noop }, save: noop, notify: noop, audio: { play: noop } });
  assert.equal(NPC_DATA.length, 5); const states = new Set();
  for (let i = 0; i < 1500; i++) {
    living.update(.1, { player: player.position, active: true, dialogueOpen: false, speaker: '' }); world.update(.1, i / 10, player.position);
    for (const a of living.actors) { states.add(a.agent.state); for (const b of living.actors) if (b !== a) assert(Math.hypot(a.agent.position.x-b.agent.position.x,a.agent.position.z-b.agent.position.z) >= .65, 'actors overlap'); assert(!blocked(a.agent.position.x, a.agent.position.z, world.solids.filter(b => b.seatFor !== a.definition.id)), `${a.definition.id} entered an obstacle`); }
  }
  assert(living.actors.every(a => a.agent.distanceWalked > 5)); assert(living.actors.every(a => a.agent.transitions >= 2), JSON.stringify(living.actors.map(a => ({id:a.definition.id,transitions:a.agent.transitions,position:a.agent.position})))); assert(states.has('sit')); assert(living.actors[0].agent.distanceWalked > 10);
  living.dispose(); maria.dispose(); storyWorld.dispose(); world.dispose(); globalThis.document = previousDocument;
});

test('friendship really gates optional activities and rewards cannot be farmed', () => {
 const s = freshLiving(); assert.equal(solveFriendActivity(s, 'bia', 1), false); s.reputation.bia = 2;
 assert.equal(solveFriendActivity(s, 'bia', 0), false); assert.equal(solveFriendActivity(s, 'bia', 1), true); assert.equal(s.reputation.bia, 3);
 assert.equal(solveFriendActivity(s, 'bia', 1), true); assert.equal(s.reputation.bia, 3); assert.equal(s.decisions['bonus:bia'], 'won'); assert.equal(solveFriendActivity(s, 'maria', 0), false);
});
