import { blocked, clamp, moveWithCollisions, resolveSpawn } from './physics.js';

// These bounds and landings belong to the fictional game layout, not the school.
const HALF_X = 11.275, HALF_Z = 19.275;
const perimeter = [
  {minX:-40,maxX:-HALF_X,minZ:-40,maxZ:40},
  {minX:HALF_X,maxX:40,minZ:-40,maxZ:40},
  {minX:-40,maxX:40,minZ:-40,maxZ:-HALF_Z},
  {minX:-40,maxX:40,minZ:HALF_Z,maxZ:40},
];
const finitePoint = p => Number.isFinite(p?.x) && Number.isFinite(p?.z);

export class SchoolNavigation {
  constructor(layout) {
    if (!layout?.floors?.length) throw new TypeError('School layout requires floors');
    this.layout = layout;
  }
  floor(index) {
    return this.layout.floors.find(f => f.index === index) ?? this.layout.floors[0];
  }
  movementObstacles(index) {
    const floor = this.floor(index);
    // Legacy X/Z physics needs explicit vertical filtering for door lintels.
    return [...floor.colliders.filter(b => b.minY < floor.walkY + 1.8 && b.maxY > floor.walkY), ...perimeter];
  }
  obstacles(index) {
    const floor = this.floor(index), base = floor.baseY;
    const plane = (kind,minY,maxY) => ({kind,minX:-HALF_X,maxX:HALF_X,minZ:-HALF_Z,maxZ:HALF_Z,minY,maxY});
    return [...floor.colliders,...perimeter.map(b=>({...b,kind:'boundary',minY:base,maxY:base+3.4})),
      plane('floor',base-.15,base),plane('ceiling',base+3.4,base+3.55)];
  }
  resolve(index, position) {
    const floor = this.floor(index), obstacles = this.movementObstacles(floor.index);
    let point = finitePoint(position) ? {x:clamp(position.x,-HALF_X+.32,HALF_X-.32),z:clamp(position.z,-HALF_Z+.32,HALF_Z-.32)} : {...floor.spawn};
    point = resolveSpawn(point,obstacles,floor.spawn);
    if (blocked(point.x,point.z,obstacles)) {
      // Even a newly obstructed configured spawn must not restore inside a solid.
      for (let z=-18.5;z<=18.5;z+=.5) {
        let found = false;
        for (let x=-10.5;x<=10.5;x+=.5) if (!blocked(x,z,obstacles)) { point={x,z};found=true;break; }
        if(found) break;
      }
      if(blocked(point.x,point.z,obstacles)) throw new Error(`Floor ${floor.index} has no safe spawn`);
    }
    return {x:point.x,y:floor.walkY,z:point.z,floor:floor.index};
  }
  move(position, delta, index) {
    const floor=this.floor(index);
    if(!finitePoint(position)) Object.assign(position,this.resolve(index,position));
    position.y=floor.walkY;
    if(!finitePoint(delta)) return 0;
    return moveWithCollisions(position,delta,this.movementObstacles(index));
  }
  transition(index, stairId, position) {
    const stair=this.targets(index,position).find(s=>s.id===stairId);
    if(!finitePoint(position)||!stair||!this.layout.floors.some(f=>f.index===stair.destination)) return null;
    return this.resolve(stair.destination,stair.spawn);
  }
  roomAt(index,position) {
    if(!finitePoint(position)) return null;
    return this.floor(index).rooms.find(r=>position.x>=r.x1&&position.x<=r.x2&&position.z>=r.z1&&position.z<=r.z2)??null;
  }
  targets(index,position) {
    const floor=this.floor(index);
    return floor.stairs.filter(s=>position===undefined||(finitePoint(position)&&Math.hypot(position.x-s.x,position.z-s.z)<=2.2))
      .map(s=>({...s,y:floor.walkY,kind:'stairs',label:s.label??`Ir ao ${s.destination+1}º andar`}));
  }
}
