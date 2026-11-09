import * as THREE from 'three';
export const ANIMATION_STATES = ['idle','walk','run','accelerate','decelerate','turn','sit','stand','wave','talk','point','pickup','openbook','react','interact','observe'];
const canonical = name => String(name).toLowerCase().replace(/[ _-]/g,'');
const oneShots = new Set(['accelerate','decelerate','stand','wave','point','pickup','openbook','react','interact']);
/** One mixer per actor. Requested gestures are bounded; locomotion resumes automatically. */
export class AnimationController {
  constructor(root, clips = [], clipNames = {}) {
    this.root=root;this.mixer=new THREE.AnimationMixer(root);this.actions={};this.state='idle';this.speed=0;this.pending=null;this.transition=null;this.fade=.22;
    for(const state of ANIMATION_STATES){const clip=clips.find(c=>canonical(c.name)===canonical(clipNames[state]||state));if(clip){const a=this.mixer.clipAction(clip);if(oneShots.has(state)){a.setLoop(THREE.LoopOnce,1);a.clampWhenFinished=true;}this.actions[state]=a;}}
    this.actions.idle?.play();
  }
  requestAction(name,{duration}={}) {const state=canonical(name);if(!ANIMATION_STATES.includes(state)||!this.actions[state])return false;this.pending={state,remaining:Math.max(.05,Number.isFinite(duration)?duration:this.actions[state].getClip().duration)};return true;}
  update(dt,{speed=0,talking=false,interacting=false,pose={}}={}) {
    dt=Math.max(0,Number.isFinite(dt)?dt:0);speed=Math.max(0,speed);
    if(this.pending){this.pending.remaining-=dt;if(this.pending.remaining<0)this.pending=null;}
    const movement=speed>4?'run':speed>.12?'walk':'idle';
    if(!this.pending&&!pose.state){if(speed>.12&&this.speed<=.12&&this.actions.accelerate)this.transition={state:'accelerate',remaining:.28};else if(speed<=.12&&this.speed>.12&&this.actions.decelerate)this.transition={state:'decelerate',remaining:.28};}
    if(this.transition){this.transition.remaining-=dt;if(this.transition.remaining<=0)this.transition=null;}
    const state=canonical(pose.state||this.pending?.state||this.transition?.state||(interacting?'interact':talking?'talk':movement));
    const action=this.actions[state]||this.actions.idle,previous=this.actions[this.state]||this.actions.idle;
    if(state!==this.state&&action){action.reset().setEffectiveWeight(1).play();if(previous&&previous!==action)action.crossFadeFrom(previous,this.fade,false);}
    this.state=state;this.speed=speed;
    if(this.actions.walk)this.actions.walk.setEffectiveTimeScale(Math.max(.1,speed/2.2));
    if(this.actions.run)this.actions.run.setEffectiveTimeScale(Math.max(.1,speed/5.5));
    this.mixer.update(dt);
    return state;
  }
  get diagnostics(){return {state:this.state,speed:this.speed,requested:this.pending?.state||null,weights:Object.fromEntries(Object.entries(this.actions).map(([n,a])=>[n,a.getEffectiveWeight()]))};}
  dispose(){this.mixer.stopAllAction();this.mixer.uncacheRoot(this.root);this.pending=null;}
}
