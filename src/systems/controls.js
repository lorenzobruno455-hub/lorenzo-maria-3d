import { joystickVector, clamp } from './physics.js';

export class Controls {
  constructor({ canvas, joystick, stick, run, interact, active, onInteract, onPause, sensitivity }) {
    this.listeners=[];this.captures=new Map();this.disposed=false;
    const on=(target,type,handler)=>{target.addEventListener(type,handler);this.listeners.push(()=>target.removeEventListener(type,handler));};
    const capture=(target,id)=>{try{target.setPointerCapture(id);this.captures.set(id,target);}catch{/* A canceled native pointer may no longer be capturable. */}};
    this.keys = new Set(); this.analog = { x: 0, z: 0 }; this.look = { x: 0, y: 0 };
    this.runPointers = new Set(); this.joyPointer = null; this.lookPointer = null;
    this.active = active; this.stick = stick; this.canvas = canvas;
    const release = (element, callback) => ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => on(element,type,e=>{this.captures.delete(e.pointerId);callback(e);}));
    const update = e => {
      const r = joystick.getBoundingClientRect(), radius = (r.width - stick.offsetWidth) / 2;
      const dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2;
      this.analog = joystickVector(dx, dy, radius);
      const factor = Math.min(1, radius / Math.max(1, Math.hypot(dx, dy)));
      stick.style.transform = `translate(${dx * factor}px,${dy * factor}px)`;
    };
    on(joystick,'pointerdown', e => {
      if (!active() || this.joyPointer !== null) return;
      e.preventDefault(); this.joyPointer = e.pointerId; capture(joystick,e.pointerId); update(e);
    });
    on(joystick,'pointermove', e => { if (e.pointerId === this.joyPointer && active()) update(e); });
    release(joystick, e => { if (e.pointerId === this.joyPointer) this.resetJoystick(); });
    on(run,'pointerdown', e => {
      if (!active()) return; e.preventDefault(); capture(run,e.pointerId); this.runPointers.add(e.pointerId); run.classList.add('held');
    });
    release(run, e => { this.runPointers.delete(e.pointerId); if (!this.runPointers.size) run.classList.remove('held'); });
    on(interact,'click', () => { if (active()) onInteract(); });
    on(canvas,'contextmenu', e => e.preventDefault());
    on(canvas,'pointerdown', e => {
      // Touch look starts only on the right half. UI controls are separate DOM targets.
      if (!active() || this.lookPointer !== null || (e.pointerType !== 'mouse' && e.clientX < innerWidth / 2)) return;
      if (e.pointerType === 'mouse' && e.button !== 0 && e.button !== 2) return;
      e.preventDefault(); this.lookPointer = e.pointerId; this.last = { x: e.clientX, y: e.clientY }; capture(canvas,e.pointerId);
    });
    on(canvas,'pointermove', e => {
      if (e.pointerId !== this.lookPointer || !active()) return;
      this.look.x -= (e.clientX - this.last.x) * .004 * sensitivity();
      this.look.y += (e.clientY - this.last.y) * .003 * sensitivity();
      this.last = { x: e.clientX, y: e.clientY };
    });
    release(canvas, e => { if (e.pointerId === this.lookPointer) this.lookPointer = null; });
    on(globalThis,'keydown', e => {
      const form = /INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName);
      if (e.key === 'Escape' && !e.repeat) { onPause(); return; }
      if (!active() || form || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.startsWith('Arrow') || e.key === ' ') e.preventDefault();
      this.keys.add(e.key.toLowerCase()); if (e.key.toLowerCase() === 'e' && !e.repeat) onInteract();
    });
    on(globalThis,'keyup', e => this.keys.delete(e.key.toLowerCase()));
    on(globalThis,'blur', () => this.clear());
    on(globalThis,'resize', () => this.clear());
    on(document,'visibilitychange', () => { if (document.hidden) this.clear(); });
    this.runButton = run;
  }
  resetJoystick() { this.joyPointer = null; this.analog = { x: 0, z: 0 }; this.stick.style.transform = 'translate(0,0)'; }
  clear() { const captured=[...this.captures];this.captures.clear();this.keys.clear(); this.resetJoystick(); this.runPointers.clear(); this.lookPointer = null; this.look.x = this.look.y = 0; this.runButton?.classList.remove('held');for(const[id,target]of captured)try{if(target.hasPointerCapture?.(id))target.releasePointerCapture(id);}catch{/* Already released by the browser. */} }
  dispose(){if(this.disposed)return;this.disposed=true;this.clear();for(const off of this.listeners)off();this.listeners.length=0;}
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
