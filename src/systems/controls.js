import { joystickVector, clamp } from './physics.js';

export class Controls {
  constructor({ canvas, joystick, stick, run, interact, active, onInteract, onPause, sensitivity }) {
    this.keys = new Set(); this.analog = { x: 0, z: 0 }; this.look = { x: 0, y: 0 };
    this.runPointers = new Set(); this.joyPointer = null; this.lookPointer = null;
    this.active = active; this.stick = stick; this.canvas = canvas;
    const release = (element, callback) => ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => element.addEventListener(type, callback));
    const update = e => {
      const r = joystick.getBoundingClientRect(), radius = (r.width - stick.offsetWidth) / 2;
      const dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2;
      this.analog = joystickVector(dx, dy, radius);
      const factor = Math.min(1, radius / Math.max(1, Math.hypot(dx, dy)));
      stick.style.transform = `translate(${dx * factor}px,${dy * factor}px)`;
    };
    joystick.addEventListener('pointerdown', e => {
      if (!active() || this.joyPointer !== null) return;
      e.preventDefault(); this.joyPointer = e.pointerId; joystick.setPointerCapture(e.pointerId); update(e);
    });
    joystick.addEventListener('pointermove', e => { if (e.pointerId === this.joyPointer && active()) update(e); });
    release(joystick, e => { if (e.pointerId === this.joyPointer) this.resetJoystick(); });
    run.addEventListener('pointerdown', e => {
      if (!active()) return; e.preventDefault(); run.setPointerCapture(e.pointerId); this.runPointers.add(e.pointerId); run.classList.add('held');
    });
    release(run, e => { this.runPointers.delete(e.pointerId); if (!this.runPointers.size) run.classList.remove('held'); });
    interact.addEventListener('click', () => { if (active()) onInteract(); });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('pointerdown', e => {
      // Touch look starts only on the right half. UI controls are separate DOM targets.
      if (!active() || this.lookPointer !== null || (e.pointerType !== 'mouse' && e.clientX < innerWidth / 2)) return;
      if (e.pointerType === 'mouse' && e.button !== 0 && e.button !== 2) return;
      e.preventDefault(); this.lookPointer = e.pointerId; this.last = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', e => {
      if (e.pointerId !== this.lookPointer || !active()) return;
      this.look.x -= (e.clientX - this.last.x) * .004 * sensitivity();
      this.look.y += (e.clientY - this.last.y) * .003 * sensitivity();
      this.last = { x: e.clientX, y: e.clientY };
    });
    release(canvas, e => { if (e.pointerId === this.lookPointer) this.lookPointer = null; });
    addEventListener('keydown', e => {
      const form = /INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName);
      if (e.key === 'Escape' && !e.repeat) { onPause(); return; }
      if (!active() || form || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.startsWith('Arrow') || e.key === ' ') e.preventDefault();
      this.keys.add(e.key.toLowerCase()); if (e.key.toLowerCase() === 'e' && !e.repeat) onInteract();
    });
    addEventListener('keyup', e => this.keys.delete(e.key.toLowerCase()));
    addEventListener('blur', () => this.clear());
    addEventListener('resize', () => this.clear());
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.clear(); });
    this.runButton = run;
  }
  resetJoystick() { this.joyPointer = null; this.analog = { x: 0, z: 0 }; this.stick.style.transform = 'translate(0,0)'; }
  clear() { this.keys.clear(); this.resetJoystick(); this.runPointers.clear(); this.lookPointer = null; this.look.x = this.look.y = 0; this.runButton?.classList.remove('held'); }
  sample(dt) {
    const x = Number(this.keys.has('d')) - Number(this.keys.has('a')) + this.analog.x;
    const z = Number(this.keys.has('s')) - Number(this.keys.has('w')) + this.analog.z;
    const length = Math.hypot(x, z), factor = length > 1 ? 1 / length : 1;
    const lookX = this.look.x + (Number(this.keys.has('arrowleft')) - Number(this.keys.has('arrowright'))) * dt * 1.7;
    const lookY = this.look.y + (Number(this.keys.has('arrowdown')) - Number(this.keys.has('arrowup'))) * dt;
    this.look.x = this.look.y = 0;
    return { x: x * factor, z: z * factor, strength: clamp(length, 0, 1), running: this.keys.has('shift') || this.runPointers.size > 0, lookX, lookY };
  }
}
