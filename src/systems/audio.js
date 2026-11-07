import tracks from '../data/music.json' with { type: 'json' };
export class Audio {
  constructor(settings) { this.settings = settings; this.context = null; this.mood = 'exploration'; this.step = 0; this.nextNote = 0; this.nodes = new Set(); }
  unlock() { if (!this.context) this.context = new AudioContext(); if (!this.musicGain) { this.musicGain = this.context.createGain(); this.musicGain.gain.value = 0; this.musicGain.connect(this.context.destination); } this.context.resume().catch(() => {}); }
  play(kind = 'collect') {
    if (!this.settings.sound || !this.context || this.context.state !== 'running') return;
    const ctx = this.context, oscillator = ctx.createOscillator(), gain = ctx.createGain();
    oscillator.connect(gain); gain.connect(ctx.destination);
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(({ collect: 660, door: 160, step: 85, ball: 120, confirm: 440 })[kind] || 160, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(({ collect: 990, door: 90, step: 45, ball: 65, confirm: 660 })[kind] || 90, ctx.currentTime + .15);
    gain.gain.setValueAtTime(Math.max(.0001, this.settings.volume * (this.settings.effectsVolume ?? .5) * .12), ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .32);
    oscillator.start(); oscillator.stop(ctx.currentTime + .33); oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
  setMood(mood) { if (this.mood === mood) return; this.mood = mood; this.step = 0; this.nextNote = this.context?.currentTime || 0; if (this.musicGain) { this.musicGain.gain.cancelScheduledValues(this.context.currentTime); this.musicGain.gain.setValueAtTime(0, this.context.currentTime); } }
  update() {
    const ctx = this.context; if (!ctx || !this.musicGain || ctx.state !== 'running') return;
    const audible = this.settings.sound && !document.hidden;
    this.musicGain.gain.setTargetAtTime(audible ? this.settings.volume * (this.settings.musicVolume ?? .5) * .045 : 0, ctx.currentTime, .15);
    if (!audible) { this.nextNote = ctx.currentTime; return; }
    if (this.mood === 'exploration' && ctx.currentTime > (this.nextAmbience || 0)) { this.ambience(); this.nextAmbience = ctx.currentTime + 9; }
    const name = { exploration: 'menu', conversation: 'soft', memory: 'soft', minigame: 'battle', completion: 'win' }[this.mood];
    const track = tracks[name]; if (!track) return; if (track.once && this.step >= track.lead.length) { this.setMood('exploration'); return; }
    const duration = 30 / track.bpm; if (this.nextNote < ctx.currentTime) this.nextNote = ctx.currentTime + .02;
    while (this.nextNote < ctx.currentTime + .12) {
      for (const [notes, type, volume] of [[track.lead, track.ty, .55], [track.bass, 'triangle', .4]]) {
        const note = notes[this.step % notes.length], match = /^([a-g])(#?)(\d)$/.exec(note);
        if (!match) continue;
        const frequency = 440 * 2 ** (({ c: -9, d: -7, e: -5, f: -4, g: -2, a: 0, b: 2 }[match[1]] + (match[2] ? 1 : 0) + (Number(match[3]) - 4) * 12) / 12);
        const oscillator = ctx.createOscillator(), gain = ctx.createGain(); oscillator.type = type; oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(volume, this.nextNote); gain.gain.exponentialRampToValueAtTime(.001, this.nextNote + duration * .9);
        oscillator.connect(gain); gain.connect(this.musicGain); this.nodes.add(oscillator); oscillator.start(this.nextNote); oscillator.stop(this.nextNote + duration);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); this.nodes.delete(oscillator); };
      }
      this.step++; this.nextNote += duration; if (track.once && this.step >= track.lead.length) break;
    }
  }
  ambience() {
    const ctx = this.context; if (!ctx || !this.settings.sound) return;
    if (!this.windBuffer) { this.windBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * .8), ctx.sampleRate); const values = this.windBuffer.getChannelData(0); for (let i = 0; i < values.length; i++) values[i] = Math.random() * 2 - 1; }
    const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain(); source.buffer = this.windBuffer; filter.type = 'bandpass'; filter.frequency.value = 320; filter.Q.value = .7;
    gain.gain.setValueAtTime(.0001, ctx.currentTime); gain.gain.linearRampToValueAtTime(Math.max(.0001, this.settings.volume * this.settings.effectsVolume * .035), ctx.currentTime + .2); gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .75);
    source.connect(filter); filter.connect(gain); gain.connect(ctx.destination); this.nodes.add(source); source.start(); source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); this.nodes.delete(source); };
  }
  dispose() { for (const node of this.nodes) { try { node.stop(); } catch {} node.disconnect(); } this.nodes.clear(); this.musicGain?.disconnect(); this.context?.close(); }

}
