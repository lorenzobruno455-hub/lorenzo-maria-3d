import{test}from'node:test';import assert from'node:assert/strict';import{motionHeading}from'../../src/systems/physics.js';
const angle=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
test('actual displacement keeps the same world facing across both rotated school frames',()=>{for(const[from,to]of[[0,Math.PI],[Math.PI,0],[Math.PI,Math.PI],[0,0]])for(const[dx,dz]of[[0,-1],[0,1],[1,0],[-1,0]])assert(angle(motionHeading(dx,dz,from,to)+to,Math.atan2(dx,dz)+from)<1e-9);assert.equal(motionHeading(0,0),undefined);});
test('wall sliding follows actual axis instead of the blocked requested axis',()=>{assert.equal(motionHeading(0,.2),0);assert(angle(motionHeading(-.2,0),-Math.PI/2)<1e-9);});
