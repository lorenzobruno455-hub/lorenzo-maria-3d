import { Vector3 } from 'three';
import {protectCinematicCamera} from './cinematic-direction.js';

const bounded = (value, fallback, max = 120) => Number.isFinite(value) ? Math.max(.05, Math.min(max, value)) : fallback;
const lookLocal=(object,value)=>{const target=new Vector3(...value);object.parent?.localToWorld(target);object.lookAt(target);};
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
    this.cameraCommand = null;
    if (shot.camera) this.setCamera(shot.camera);
    this.commands([...(shot.actors || []), ...(shot.actor ? [shot.actor] : [])]);
    this.lineOff?.(); this.lineOff = null;
    if(shot.beats?.length && this.dialogue?.listen) this.lineOff=this.dialogue.listen((line,index)=>{
      if(!this.active||this.paused)return;
      try { const beat=shot.beats.find(b=>b.line===index); if(!beat)return;
        if(beat.camera)this.setCamera(beat.camera);
        this.commands(beat.actors||[]);beat.effect?.();
      } catch(error){this.fail(error);}
    });
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
  commands(commands) {
    for (const command of commands) {
      const actor = this.actors instanceof Map ? this.actors.get(command.id) : this.actors[command.id];
      if (!actor?.root) continue;
      if (!this.snapshot.actors.has(actor)) this.snapshot.actors.set(actor, {
        position:actor.root.position.clone(), quaternion:actor.root.quaternion.clone(),
        pose:actor.cutscenePose, hadPose:Object.hasOwn(actor,'cutscenePose'),
        requested:actor.requestedAction, pending:actor.controller?.pending, gaze:actor.gazeTarget, heading:actor.heading, headingTarget:actor.headingTarget, writtenHeading:actor.writtenHeading,
      });
      if(vector(command.gaze)){actor.gazeTarget=new Vector3(...command.gaze);this.camera.parent?.localToWorld(actor.gazeTarget);}
      if (command.state) { actor.cutscenePose = {state:command.state}; actor.requestAction?.(command.state, { duration:this.duration }); }
      if (vector(command.position)&&!this.preserveActorPositions) actor.root.position.fromArray(command.position);
      if (vector(command.lookAt)) {if(this.preserveActorPositions){const p=new Vector3(...command.lookAt);this.camera.parent?.localToWorld(p);actor.root.lookAt(p);}else lookLocal(actor.root,command.lookAt);}
    }
  }
  setCamera(command) {
    if(!this.camera)return;
    this.cameraCommand=command;this.cameraElapsed=0;
    // Directed cuts start from the actual previous camera, never a disjoint preset.
    if(vector(command.from))this.camera.position.fromArray(command.from);
    if(vector(command.lookFrom))lookLocal(this.camera,command.lookFrom);
    this.cameraFrom=this.camera.position.clone();this.cameraTo=vector(command.to)?new Vector3(...command.to):this.cameraFrom.clone();
    this.cameraRotation=this.camera.quaternion.clone();
    if(vector(command.lookAt)){this.camera.position.copy(this.cameraTo);lookLocal(this.camera,command.lookAt);this.cameraEndRotation=this.camera.quaternion.clone();this.camera.position.copy(this.cameraFrom);this.camera.quaternion.copy(this.cameraRotation);}
    else this.cameraEndRotation=this.cameraRotation.clone();
    this.moveCamera(this.reducedMotion()?1:0);
  }
  moveCamera(t) {
    if (!this.cameraCommand || !this.camera) return;
    const previous=this.camera.position.clone();
    const smooth = t * t * (3 - 2 * t);
    this.camera.position.lerpVectors(this.cameraFrom, this.cameraTo, smooth);
    this.camera.quaternion.slerpQuaternions(this.cameraRotation, this.cameraEndRotation, smooth);
    if(this.cameraCommand.protect&&vector(this.cameraCommand.lookAt)){
      const focus=new Vector3(...this.cameraCommand.lookAt);
      this.camera.position.copy(protectCinematicCamera(focus,this.camera.position,previous,this.scene.obstacles?.()||[]));
      lookLocal(this.camera,this.cameraCommand.lookAt);
    }
  }
  update(dt) {
    if (!this.active || this.paused || !Number.isFinite(dt) || dt < 0) return;
    try {
      this.elapsed += dt; this.cameraElapsed=(this.cameraElapsed||0)+dt;
      this.moveCamera(this.reducedMotion() ? 1 : Math.min(1, this.cameraElapsed / Math.max(.5,this.duration)));
      if (this.ownsDialogue && this.dialogue?.open === false) { if(this.shot.interruptOnClose&&!this.dialogueDone){this.finish('interrupted');return;} this.dialogueDone = true; }
      if (this.elapsed < this.duration || (!this.dialogueDone && (this.shot.waitForDialogue || this.elapsed < this.waitLimit))) return;
      this.closeDialogue();
      if (++this.index >= this.scene.shots.length) this.finish('complete'); else this.enter();
    } catch (error) { this.fail(error); }
  }
  pause() { if (this.active) {this.paused = true;if(this.ownsDialogue)this.dialogue.paused=true;} }
  resume() { if (this.active) {this.paused = false;if(this.ownsDialogue)this.dialogue.paused=false;} }
  skip() { this.finish('skipped'); }
  closeDialogue() {
    this.lineOff?.(); this.lineOff=null;
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
      actor.requestedAction = saved.requested; actor.gazeTarget=saved.gaze;
      for(const key of ['heading','headingTarget','writtenHeading'])if(saved[key]!==undefined)actor[key]=saved[key];
      if (actor.controller) actor.controller.pending = saved.pending;
    });
    safely(() => this.onLock?.(false));
    safely(() => this.onFinish?.({id,reason}));
    this.snapshot = null;
  }
  dispose() { this.disposed = true; this.finish('disposed'); }
}
