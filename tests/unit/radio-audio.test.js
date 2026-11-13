import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Audio } from '../../src/systems/audio.js';

test('radio playback ducks synthesized music and restores it without changing saved sound settings', () => {
  const previousDocument = globalThis.document;
  const targets = [];
  globalThis.document = { hidden: false };
  try {
    const audio = new Audio({ sound: true, volume: 0.8, musicVolume: 0.5 });
    audio.context = { state: 'running', currentTime: 12 };
    audio.musicGain = { gain: { setTargetAtTime: (value, time, constant) => targets.push({ value, time, constant }) } };
    audio.mood = 'silent';

    audio.update();
    audio.setRadioPlaying(true);
    audio.update();
    audio.setRadioPlaying(false);
    audio.update();

    assert.deepEqual(targets.map(target => target.value), [0.8 * 0.5 * 0.045, 0, 0.8 * 0.5 * 0.045]);
    assert.deepEqual(audio.settings, { sound: true, volume: 0.8, musicVolume: 0.5 });
    assert(targets.every(target => target.constant === 0.15));
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
});
