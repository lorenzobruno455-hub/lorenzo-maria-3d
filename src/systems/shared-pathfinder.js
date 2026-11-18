import{findPathSteps}from'./navigation.js';
// One shared backend. Worker failures preserve input responsiveness and retryability.
export class SharedPathfinder{
 constructor(){
  this.serial=0;this.pending=new Map();this.samples=[];this.timers=new Map();this.disposed=false;this.failures=0;this.worker=null;
  try{if(typeof Worker==='function')this.worker=new Worker(new URL('./pathfinding-worker.js',import.meta.url),{type:'module'});}catch{this.failures++;}
  if(this.worker){
   this.worker.onmessage=({data})=>{if(!data||!this.pending.has(data.id))return;if(this.samples.length>=64)this.samples.shift();this.samples.push(data.ms||0);this.finish(data.id,Array.isArray(data.path)?data.path.filter(p=>Number.isFinite(p?.x)&&Number.isFinite(p?.z)):[]);};
   this.worker.onerror=e=>{e?.preventDefault?.();this.failWorker();};this.worker.onmessageerror=()=>this.failWorker();
  }
 }
 finish(id,path){clearTimeout(this.timers.get(id));this.timers.delete(id);const resolve=this.pending.get(id);this.pending.delete(id);resolve?.(path);}
 failWorker(){this.failures++;this.worker?.terminate();this.worker=null;for(const id of [...this.pending.keys()])this.finish(id,[]);}
 find(from,to,obstacles,grid){
  if(this.disposed)return Promise.resolve([]);
  return new Promise(resolve=>{
   const id=++this.serial;this.pending.set(id,resolve);
   if(this.worker){try{this.worker.postMessage({id,from,to,obstacles,grid});this.timers.set(id,setTimeout(()=>this.failWorker(),10000));}catch{this.failWorker();}return;}
   const search=findPathSteps(from,to,obstacles,{grid});
   const step=()=>{
    if(this.disposed||!this.pending.has(id))return;const start=performance.now();
    try{let next;do{next=search.next();if(next.done){this.finish(id,next.value);return;}}while(performance.now()-start<4);}catch{this.finish(id,[]);return;}
    this.timers.set(id,setTimeout(step,0));
   };
   this.timers.set(id,setTimeout(step,0));
  });
 }
 dispose(){if(this.disposed)return;this.disposed=true;this.worker?.terminate();this.worker=null;for(const id of [...this.pending.keys()])this.finish(id,[]);}
}
