import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const read=(phase,name)=>JSON.parse(readFileSync(`work/aurora12/${phase}/${name}.json`));
const resource=s=>({drawCalls:s.drawCalls,triangles:s.triangles,geometries:s.geometries,textures:s.textures,programs:s.colorbeat.programs,actorContacts:s.actorContacts??null});
const captures=[];
for(const file of readdirSync('work/aurora12/before').filter(f=>!f.includes('60s')&&f.endsWith('.json'))){
 const name=file.slice(0,-5),a=read('before',name),b=read('after',name);assert.deepEqual(a.view,b.view);assert.deepEqual(a.viewport,b.viewport);assert.equal(a.ratio,b.ratio);assert.deepEqual(a.errors,[]);assert.deepEqual(b.errors,[]);
 captures.push({name,before:resource(a.state),after:resource(b.state)});
}
const windows=[];
for(const name of ['campus','court','classroom0','library']){
 const a=read('before',name+'-60s'),b=read('after',name+'-60s');assert.deepEqual(a.view,b.view);assert.equal(a.ratio,b.ratio);assert.deepEqual(a.errors,[]);assert.deepEqual(b.errors,[]);
 windows.push({name,...Object.fromEntries([['before',a],['after',b]].map(([phase,x])=>[phase,{elapsedMs:x.profile.elapsed,ratio:x.ratio,initial:resource(x.initial),final:resource(x.state),samples:x.profile.samples,spikes33:x.profile.spikes33,spikes50:x.profile.spikes50,heapBytes:x.heap}]))});
}
const result={base:'3907bc29abe3390486006ca89f73455b777d69e4',environment:'Chromium headless, ANGLE/SwiftShader; software rendering, not Android hardware',viewport:{width:915,height:412},quality:'low',shadows:false,adaptive:false,captureRatio:1,profileRatio:.5,captures,windows};
writeFileSync('docs/AURORA_12_METRICS.json',JSON.stringify(result,null,2));
const n=x=>Number(x??0).toFixed(2),lines=['scene,phase,elapsed_ms,frame_p50_ms,frame_p95_ms,frame_p99_ms,update_p95_ms,render_submission_p95_ms,draw_calls,triangles,geometries,textures'];
for(const w of windows)for(const phase of ['before','after']){const v=w[phase],f=v.samples.frame;lines.push([w.name,phase,n(v.elapsedMs),n(f.p50),n(f.p95),n(f.p99),n(v.samples.update.p95),n(v.samples.render.p95),v.final.drawCalls,v.final.triangles,v.final.geometries,v.final.textures].join(','));}
writeFileSync('docs/AURORA_12_METRICS.csv',lines.join('\n')+'\n');
console.log(JSON.stringify({capturePairs:captures.length,captureDeltas:captures.map(c=>({scene:c.name,drawCalls:c.after.drawCalls-c.before.drawCalls,triangles:c.after.triangles-c.before.triangles})),windows:windows.map(w=>({scene:w.name,beforeP95:w.before.samples.frame.p95,afterP95:w.after.samples.frame.p95,beforeUpdateP95:w.before.samples.update.p95,afterUpdateP95:w.after.samples.update.p95}))},null,2));
