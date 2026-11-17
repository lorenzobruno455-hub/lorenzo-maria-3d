import{test}from'node:test';import assert from'node:assert/strict';import{createPerformanceProbe}from'../../src/systems/performance-probe.js';
test('normal play does not install profiling hooks or need browser globals',()=>{const stringify=JSON.stringify;assert.equal(createPerformanceProbe(false),null);assert.equal(JSON.stringify,stringify);});
