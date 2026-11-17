// One shared worker keeps expensive searches off the input/render thread.
export class SharedPathfinder{
 constructor(){this.serial=0;this.pending=new Map();this.samples=[];this.worker=typeof Worker==='function'?new Worker(new URL('./pathfinding-worker.js',import.meta.url),{type:'module'}):null;if(this.worker){this.worker.onmessage=({data})=>{if(this.samples.length>=64)this.samples.shift();this.samples.push(data.ms||0);this.pending.get(data.id)?.(data.path);this.pending.delete(data.id);};this.worker.onerror=()=>this.dispose();}}
 find(from,to,obstacles,grid){if(!this.worker)return Promise.resolve([]);return new Promise(resolve=>{const id=++this.serial;this.pending.set(id,resolve);this.worker.postMessage({id,from,to,obstacles,grid});});}
 dispose(){this.worker?.terminate();this.worker=null;for(const resolve of this.pending.values())resolve([]);this.pending.clear();}
}
