import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Quality } from '../../src/systems/quality.js';
import { DEFAULT_SETTINGS } from '../../src/systems/progress.js';

test('quality presets configure shadows and adaptive resolution reacts to slow frames', () => {
  globalThis.innerWidth = 844; globalThis.innerHeight = 390; globalThis.devicePixelRatio = 3;
  const renderer = { shadowMap: {}, ratio: 0, setPixelRatio(n) { this.ratio = n; }, setSize(w, h, css) { this.css = css; } };
  const sun = { shadow: { map: null, mapSize: { set(w) { this.width = w; } } } };
  const settings = { ...DEFAULT_SETTINGS, quality: 'high' }, q = new Quality(renderer, sun, settings);
  assert.equal(renderer.ratio, 1.75); assert.equal(sun.shadow.mapSize.width, 2048); assert.equal(renderer.css, false);
  for (let i = 0; i < 61; i++) q.sample(.05);
  assert(q.scale < 1); assert(renderer.ratio < 1.75);
  settings.adaptive = false; const scale = q.scale; for (let i = 0; i < 100; i++) q.sample(.1); assert.equal(q.scale, scale);
  settings.quality = 'low'; q.apply(); assert.equal(renderer.shadowMap.enabled, false); assert.equal(renderer.ratio, 1);
  settings.quality = 'medium'; q.apply(); assert.equal(sun.shadow.mapSize.width, 1024);
});

test('unchanged shadows reuse GPU targets and suspension samples reset safely',()=>{
 globalThis.innerWidth=800;globalThis.innerHeight=450;globalThis.devicePixelRatio=1;
 const renderer={shadowMap:{},setPixelRatio(){},setSize(){}},sun={shadow:{map:null,mapSize:{set(){}}}},settings={...DEFAULT_SETTINGS,quality:'high'};
 const q=new Quality(renderer,sun,settings);let disposed=0;sun.shadow.map={dispose(){disposed++;}};q.apply(false);assert.equal(disposed,0);q.sample(.016);q.sample(8);q.sample(Infinity);q.sample(-1);assert.equal(q.frames,0);settings.quality='low';q.apply();assert.equal(disposed,1);
});
test('very slow rendering still reduces resolution',()=>{
 globalThis.innerWidth=800;globalThis.innerHeight=450;globalThis.devicePixelRatio=1;
 const q=new Quality({shadowMap:{},setPixelRatio(){},setSize(){}},{shadow:{map:null,mapSize:{set(){}}}},{...DEFAULT_SETTINGS,quality:'medium',adaptive:true});
 for(let i=0;i<8;i++)q.sample(.5);assert(q.scale<1);
});
