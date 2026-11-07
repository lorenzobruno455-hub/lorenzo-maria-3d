export class Audio {
  constructor(settings) { this.settings = settings; this.context = null; }
  unlock() { if (!this.context) this.context = new AudioContext(); this.context.resume().catch(() => {}); }
  play(kind = 'collect') {
    if (!this.settings.sound || !this.context || this.context.state !== 'running') return;
    const ctx = this.context, oscillator = ctx.createOscillator(), gain = ctx.createGain();
    oscillator.connect(gain); gain.connect(ctx.destination);
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(kind === 'collect' ? 660 : 160, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(kind === 'collect' ? 990 : 90, ctx.currentTime + .15);
    gain.gain.setValueAtTime(Math.max(.0001, this.settings.volume * .12), ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .32);
    oscillator.start(); oscillator.stop(ctx.currentTime + .33); oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
  dispose() { this.context?.close(); }
}
