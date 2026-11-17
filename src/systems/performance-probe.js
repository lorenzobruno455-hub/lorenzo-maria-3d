// Opt-in diagnostics only. Samples are bounded and aggregated only on request.
export function createPerformanceProbe(enabled){
 if(!enabled)return null;
 const samples={},events=[],frames=[],restores=[];let started=performance.now(),frameStart=0,renderMS=0;
 const record=(name,ms)=>{const a=samples[name]||(samples[name]=[]);if(a.length<40000)a.push(ms);if(ms>8&&events.length<4000)events.push({at:performance.now()-started,name,ms});};
 const wrap=(object,key,label=key)=>{if(!object||typeof object[key]!=='function')return;const original=object[key];object[key]=function(...args){const at=performance.now();try{return original.apply(this,args);}finally{const ms=performance.now()-at;record(label,ms);if(label==='render')renderMS+=ms;}};restores.push(()=>object[key]=original);};
 wrap(JSON,'stringify','JSON.stringify');wrap(Storage.prototype,'setItem','storage.write');wrap(Storage.prototype,'getItem','storage.read');
 const observer=typeof PerformanceObserver==='function'?new PerformanceObserver(list=>{for(const e of list.getEntries())if(events.length<4000)events.push({at:e.startTime-started,name:e.entryType,ms:e.duration,url:e.name});}):null;
 try{observer?.observe({type:'longtask',buffered:false});}catch{}
 const summary=a=>{const b=[...a].sort((x,y)=>x-y),p=n=>b[Math.min(b.length-1,Math.floor(b.length*n))]||0;return{count:b.length,p50:p(.5),p95:p(.95),p99:p(.99),max:b.at(-1)||0,total:b.reduce((s,n)=>s+n,0)};};
 const probe={wrap,record,begin(ms){frameStart=performance.now();renderMS=0;record('frame',ms);if(frames.length<40000)frames.push({at:frameStart-started,ms});},end(){record('update',performance.now()-frameStart-renderMS);},snapshot(){return{elapsed:performance.now()-started,samples:Object.fromEntries(Object.entries(samples).map(([k,a])=>[k,summary(a)])),spikes33:frames.filter(f=>f.ms>33.3),spikes50:frames.filter(f=>f.ms>50),events,gc:'not attributed; long tasks do not prove GC',render:'CPU submission, not GPU timer'};},dispose(){observer?.disconnect();restores.reverse().forEach(r=>r());delete window.auroraPerformance;}};
 window.auroraPerformance={snapshot:()=>probe.snapshot(),reset(){for(const k of Object.keys(samples))delete samples[k];events.length=frames.length=0;started=performance.now();}};return probe;
}
