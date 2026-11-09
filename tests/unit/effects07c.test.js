import test from 'node:test';
import assert from 'node:assert/strict';
import { VisualEffects } from '../../src/systems/visual-effects.js';
test('comic effects bound bursts and clean up timers', () => {
  const original = globalThis.document;
  const make = () => ({ dataset: {}, children: [], setAttribute() {}, appendChild(child) { if (!this.children.includes(child)) this.children.push(child); this.firstElementChild = child; }, remove() { this.removed = true; } });
  globalThis.document = { createElement: make };
  try {
    const root = make(), fx = new VisualEffects(root, () => false);
    assert.equal(fx.memory(), true); assert.equal(fx.quest(), true); assert.equal(fx.chapter(), false);
    assert.equal(root.children[0].dataset.kind, 'memory'); assert.equal(root.children[1].dataset.kind, 'quest');
    assert.equal(fx.active.size, 2); fx.dispose(); assert.equal(fx.active.size, 0); assert.equal(fx.timers.size, 0);
    assert.ok(root.children.every(node => node.removed)); assert.equal(fx.burst(), false);
  } finally { globalThis.document = original; }
});
test('reduced motion creates no decorative nodes', () => {
  const fx = new VisualEffects({}, () => true); assert.equal(fx.quest(), false); assert.equal(fx.active.size, 0); fx.dispose();
});
test('procedural audio respects mute, rate limits and releases every cue voice', async () => {
  const { Audio } = await import('../../src/systems/audio.js');
  const events = [], voices = [];
  const param = { setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} };
  const audio = new Audio({ sound: true, volume: .8, effectsVolume: .5 });
  audio.context = { state: 'running', currentTime: 1, destination: {},
    createGain: () => ({ gain: param, connect() {}, disconnect() { events.push('gain released'); } }),
    createOscillator: () => { const voice = { frequency: param, connect() {}, start() {}, stop() {}, disconnect() { events.push('voice released'); } }; voices.push(voice); return voice; },
  };
  assert.equal(audio.play('book'), true); assert.equal(voices.length, 2); assert.equal(audio.play('book'), false); assert.equal(audio.nodes.size, 2);
  for (const voice of voices) voice.onended(); assert.equal(audio.nodes.size, 0); assert.equal(events.length, 4);
  audio.settings.sound = false; assert.equal(audio.play('quest'), false); audio.settings.sound = true; audio.settings.effectsVolume = 0;
  assert.equal(audio.play('chapter'), false); assert.equal(voices.length, 2);
});
