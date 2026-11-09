import { Vector3 } from 'three';

const bounded = (value, fallback, max = 120) => Number.isFinite(value) ? Math.max(.05, Math.min(max, value)) : fallback;
const vector = value => Array.isArray(value) && value.length === 3 && value.every(Number.isFinite);

/** Owns transient scene transforms, never the application's global pause state. */
export class CutsceneManager {
  constructor({ camera, actors = {}, light, dialogue, effects, onLock, onFinish, onError, reducedMotion = () => false } = {}) {
    Object.assign(this, { camera, actors, light, dialogue, effects, onLock, onFinish, onError, reducedMotion });
    this.active = false; this.paused = false; this.disposed = false;
  }
  play(scene) {
    if (this.disposed || !Array.isArray(scene?.shots) || !scene.shots.length) return false;
    if (this.active) this.finish('replaced');
    this.scene = scene; this.index = 0; this.active = true; this.paused = false;
    this.snapshot = {
      position: this.camera?.position.clone(), quaternion: this.camera?.quaternion.clone(),
      intensity: this.light?.intensity, color: this.light?.color?.clone(), actors: new Map(),
    };
    try { this.onLock?.(true); this.enter(); } catch (error) { this.fail(error); }
    return this.active;
  }
  enter() {
    const shot = this.scene.shots[this.index];
    this.elapsed = 0; this.duration = bounded(shot.duration, 2); this.dialogueDone = true; this.ownsDialogue = false;
    this.waitLimit = bounded(shot.dialogueTimeout, Math.max(this.duration, 15));
    this.shot = shot;
    if (shot.camera && this.camera) {
      if (vector(shot.camera.from)) this.camera.position.fromArray(shot.camera.from);
      if (vector(shot.camera.lookFrom)) this.camera.lookAt(...shot.camera.lookFrom);
      this.cameraFrom = this.camera.position.clone();
      this.cameraTo = vector(shot.camera.to) ? new Vector3(...shot.camera.to) : this.cameraFrom.clone();
      this.cameraRotation = this.camera.quaternion.clone();
      if (vector(shot.camera.lookAt)) {
        this.camera.position.copy(this.cameraTo); this.camera.lookAt(...shot.camera.lookAt);
        this.cameraEndRotation = this.camera.quaternion.clone();
        this.camera.position.copy(this.cameraFrom); this.camera.quaternion.copy(this.cameraRotation);
      } else this.cameraEndRotation = this.cameraRotation.clone();
      this.moveCamera(this.reducedMotion() ? 1 : 0);
    }
    for (const command of [...(shot.actors || []), ...(shot.actor ? [shot.actor] : [])]) {
      const actor = this.actors instanceof Map ? this.actors.get(command.id) : this.actors[command.id];
      if (!actor?.root) continue;
      if (!this.snapshot.actors.has(actor)) this.snapshot.actors.set(actor, {
        position:actor.root.position.clone(), quaternion:actor.root.quaternion.clone(),
        pose:actor.cutscenePose, hadPose:Object.hasOwn(actor,'cutscenePose'),
        requested:actor.requestedAction, pending:actor.controller?.pending,
      });
      if (command.state) { actor.cutscenePose = {state:command.state}; actor.requestAction?.(command.state, { duration:this.duration }); }
      if (vector(command.position)) actor.root.position.fromArray(command.position);
      if (vector(command.lookAt)) actor.root.lookAt(...command.lookAt);
    }
    if (shot.light && this.light) {
      if (Number.isFinite(shot.light.intensity)) this.light.intensity = shot.light.intensity;
      if (shot.light.color !== undefined) this.light.color?.set(shot.light.color);
    }
    if (shot.dialogue && this.dialogue) {
      this.dialogueDone = false; this.ownsDialogue = true;
      const token = this.dialogueToken = {};
      this.dialogue.start(Array.isArray(shot.dialogue) ? shot.dialogue : [shot.dialogue], {
        done: () => { if (this.dialogueToken === token) this.dialogueDone = true; },
      });
    }
    if (typeof shot.effect === 'function') shot.effect(this.effects, this);
    else if (shot.effect) this.effects?.burst?.(shot.effect);
  }
  moveCamera(t) {
    if (!this.shot.camera || !this.camera) return;
    const smooth = t * t * (3 - 2 * t);
    this.camera.position.lerpVectors(this.cameraFrom, this.cameraTo, smooth);
    this.camera.quaternion.slerpQuaternions(this.cameraRotation, this.cameraEndRotation, smooth);
  }
  update(dt) {
    if (!this.active || this.paused || !Number.isFinite(dt) || dt < 0) return;
    try {
      this.elapsed += dt;
      this.moveCamera(this.reducedMotion() ? 1 : Math.min(1, this.elapsed / this.duration));
      if (this.ownsDialogue && this.dialogue?.open === false) this.dialogueDone = true;
      if (this.elapsed < this.duration || (!this.dialogueDone && this.elapsed < this.waitLimit)) return;
      this.closeDialogue();
      if (++this.index >= this.scene.shots.length) this.finish('complete'); else this.enter();
    } catch (error) { this.fail(error); }
  }
  pause() { if (this.active) this.paused = true; }
  resume() { if (this.active) this.paused = false; }
  skip() { this.finish('skipped'); }
  closeDialogue() {
    this.dialogueToken = null;
    if (this.ownsDialogue) { this.ownsDialogue = false; this.dialogue?.close?.(false); }
  }
  report(error) { try { this.onError?.(error); } catch { /* Reporting must never retain ownership. */ } }
  fail(error) { this.report(error); this.finish('error'); }
  finish(reason) {
    if (!this.active) return;
    const id = this.scene.id, snapshot = this.snapshot;
    this.active = false; this.paused = false;
    // Every restoration is independent: a broken dependency cannot prevent unlock.
    const safely = fn => { try { fn(); } catch (error) { this.report(error); } };
    safely(() => this.closeDialogue());
    safely(() => { if (snapshot.position) this.camera.position.copy(snapshot.position); if (snapshot.quaternion) this.camera.quaternion.copy(snapshot.quaternion); });
    safely(() => { if (this.light) { this.light.intensity = snapshot.intensity; if (snapshot.color) this.light.color.copy(snapshot.color); } });
    for (const [actor, saved] of snapshot.actors) safely(() => {
      actor.root.position.copy(saved.position); actor.root.quaternion.copy(saved.quaternion);
      if (saved.hadPose) actor.cutscenePose = saved.pose; else delete actor.cutscenePose;
      actor.requestedAction = saved.requested;
      if (actor.controller) actor.controller.pending = saved.pending;
    });
    safely(() => this.onLock?.(false));
    safely(() => this.onFinish?.({id,reason}));
    this.snapshot = null;
  }
  dispose() { this.disposed = true; this.finish('disposed'); }
}
