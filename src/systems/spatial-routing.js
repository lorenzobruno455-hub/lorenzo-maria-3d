import{findPath}from'./navigation.js';import{schoolPointToWorld,schoolPointToLocal,schoolBoundsToWorld}from'./world-coordinates.js';import{walkY,floorAt,stairAt,stairBarriers}from'./physical-stairs.js';
export function stairPath(f,up=true){const y=walkY(f),points=[[-3.1,1.3,y],[-3.5,1.3,y],[-8.5,1.3,y+1.8],[-9.3,1.3,y+1.8],[-9.3,3.7,y+1.8],[-8.5,3.7,y+1.8],[-3.5,3.7,y+3.6],[-3.1,3.7,y+3.6]].map(([x,z,y])=>({x,y,z,ramp:f}));return up?points:points.reverse();}
export class SpatialRoutePlanner{
 constructor(school,world){Object.assign(this,{school,world});this.cache=new Map();this.searches=0;}
 local(p){return schoolPointToLocal(p,this.school.rotation);}
 worldPoint(p){return schoolPointToWorld(p,this.school.rotation);}
 inside(p){const q=this.local(p);return Math.abs(q.x)<11.28&&Math.abs(q.z)<19.28;}
 obstacles(f){const floor=this.school.navigation.floor(f),key=`${f}:${floor.colliders.length}:${this.world.solids.length}`;if(this.cache.has(key))return this.cache.get(key);
  const doors=new Set(this.world.doors.map(d=>d.bounds));let boxes=f?floor.colliders.map(b=>schoolBoundsToWorld(b,this.school.rotation)):[...this.world.solids.filter(b=>!doors.has(b)&&!/stream/.test(b.kind||'')&&(b.minY??0)<1.75&&(b.maxY??3)>.1),...floor.colliders.map(b=>schoolBoundsToWorld(b,this.school.rotation))];
  boxes.push(...stairBarriers(f).map(b=>schoolBoundsToWorld(b,this.school.rotation)));
  if(f)boxes.push(...[{minX:-80,maxX:-11.15,minZ:-80,maxZ:80},{minX:11.15,maxX:80,minZ:-80,maxZ:80},{minX:-80,maxX:80,minZ:-80,maxZ:-19.15},{minX:-80,maxX:80,minZ:19.15,maxZ:80}].map(b=>schoolBoundsToWorld(b,this.school.rotation)));
  boxes=boxes.filter(b=>(b.minY??walkY(f))<walkY(f)+1.72&&(b.maxY??walkY(f)+3)>walkY(f)+.1);if(this.cache.size>8)this.cache.clear();this.cache.set(key,boxes);return boxes;
 }
 horizontal(a,b,f){this.searches++;const grid=this.inside(a)&&this.inside(b)?.5:1,path=findPath(a,b,this.obstacles(f),{grid});return path.map(p=>({...p,y:walkY(f)}));}
 plan(from,to){const route=this.legs(from,to);let step=route.next();while(!step.done){const leg=step.value;step=route.next(this.horizontal(leg.from,leg.to,leg.floor));}return step.value;}
 async planAsync(from,to,pathfinder){const route=this.legs(from,to);let step=route.next();while(!step.done){const leg=step.value,grid=this.inside(leg.from)&&this.inside(leg.to)?.5:1;this.searches++;const path=await pathfinder.find(leg.from,leg.to,this.obstacles(leg.floor),grid);step=route.next(path.map(p=>({...p,y:walkY(leg.floor)})));}return step.value;}
 *legs(from,to){let path=[],p={...from},floor=this.inside(p)?floorAt(p.y):0;const finalFloor=this.inside(to)?floorAt(to.y):0,local=this.local(p),ramp=stairAt(local);
  if(ramp!==null){const up=to.y>=p.y,all=stairPath(ramp,up).map(q=>this.worldPoint(q));let best=0,d=Infinity;for(let i=0;i<all.length-1;i++){const a=all[i],b=all[i+1],v={x:b.x-a.x,y:b.y-a.y,z:b.z-a.z},t=Math.max(0,Math.min(1,((p.x-a.x)*v.x+(p.y-a.y)*v.y+(p.z-a.z)*v.z)/(v.x*v.x+v.y*v.y+v.z*v.z)));const dist=Math.hypot(p.x-a.x-v.x*t,p.y-a.y-v.y*t,p.z-a.z-v.z*t);if(dist<d){d=dist;best=i+1;}}
   path.push(...all.slice(best));p={...all.at(-1)};floor=up?ramp+1:ramp;
  }
  while(floor!==finalFloor){const up=finalFloor>floor,r=up?floor:floor-1,points=stairPath(r,up).map(q=>this.worldPoint(q)),lead=yield{from:p,to:points[0],floor};if(!lead.length)return[];path.push(...lead,...points.slice(1));p={...points.at(-1)};floor+=up?1:-1;}
  const tail=yield{from:p,to,floor};return tail.length?[...path,...tail]:[];
 }
}
