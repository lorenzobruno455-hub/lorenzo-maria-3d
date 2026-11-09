import {SchoolMaterials,finishSchoolSurfaces} from './school-materials.js';
import {createSchoolFurniture} from './school-furniture.js';
import {createSchoolArchitecture} from './school-architecture.js';
import {SchoolLighting} from './school-lighting.js';
import * as THREE from 'three';
import {SchoolNavigation} from './school-navigation.js';

// The visit borrows the existing player/camera and freezes, rather than copies,
// the campaign. All coordinates are fictional game coordinates.
export class SchoolVisit {
  constructor({scene,legacyRoots,player,follow,pool,layout,getState,onChange=()=>{},onStatus=()=>{}}){
    Object.assign(this,{scene,legacyRoots,player,follow,pool,layout,getState,onChange,onStatus});
    this.layout={...layout,floors:layout.floors.map(f=>({...f,colliders:[...f.colliders]}))};this.navigation=new SchoolNavigation(this.layout);this.details=new Map();this.materials=pool.resources?new SchoolMaterials(pool.resources):null;this.quality='medium';this.group=new THREE.Group();this.group.name='São Jorge · M2';this.group.visible=false;this.fill=new THREE.PointLight('#fff5e6',24,38,1.3);this.fill.position.set(0,2.7,0);this.group.add(this.fill);scene.add(this.group);this.lighting=new SchoolLighting(this.group,this.fill);
    this.active=false;this.loading=false;this.inspecting=false;this.floor=0;this.view=0;this.leases=new Map();this.pending=new Map();this.token=0;this.disposed=false;
  }
  async ensureFloor(index){
    const f=this.navigation.floor(index);if(this.leases.has(f.index))return this.leases.get(f.index);
    if(!this.pending.has(f.index))this.pending.set(f.index,this.pool.acquire(f.url,{preserveTransform:true,vertexColors:true}).then(lease=>{
      if(this.disposed){lease.release();return null;}
      this.prepareDetails(f,lease);lease.model.position.y=f.baseY;lease.model.name=f.label;lease.model.visible=false;this.group.add(lease.model);this.leases.set(f.index,lease);return lease;
    }).finally(()=>this.pending.delete(f.index)));
    return this.pending.get(f.index);
  }
  prepareDetails(floor,lease){
    if(!this.materials)return;
    let surfaces,furniture,architecture;
    try{
      surfaces=finishSchoolSurfaces({model:lease.model,materials:this.materials});
      const source=lease.model.getObjectByName('furniture');
      furniture=createSchoolFurniture({resources:this.pool.resources,materials:this.materials,floor,source});
      if(furniture)source.parent.add(furniture.group);
      architecture=createSchoolArchitecture({resources:this.pool.resources,materials:this.materials,floor,structure:lease.model.getObjectByName('structure')});
      lease.model.add(architecture.group);architecture.updateQuality(this.quality);
      this.details.set(floor.index,{surfaces,furniture,architecture});
      floor.colliders.push(...(furniture?.colliders||[]),...architecture.colliders);
    }catch(error){furniture?.dispose();architecture?.dispose();surfaces?.dispose();console.warn('Acabamento São Jorge:',error.message);this.onStatus('Alguns detalhes não carregaram; a navegação continua disponível.');}
  }
  update(dt,quality=this.quality){this.quality=quality;if(!this.active)return;for(const detail of this.details.values())detail.architecture.updateQuality(quality);this.lighting.update(this.navigation.floor(this.floor),this.player.position,quality,dt,this.inspecting);}
  async enter(){
    if(this.disposed||this.active||this.loading)return false;
    const token=++this.token,state=this.getState();this.loading=true;this.onStatus('Carregando São Jorge…');this.onChange();
    try{
      const point=this.navigation.resolve(state.floor,state.position);await this.ensureFloor(point.floor);
      if(this.disposed||token!==this.token)return false;
      this.legacy={position:this.player.position.clone(),rotation:this.player.rotation.y,yaw:this.follow.yaw,pitch:this.follow.pitch,obstacles:this.follow.obstacles,visibility:this.legacyRoots.map(root=>[root,root.visible])};
      this.legacyRoots.forEach(root=>root.visible=false);this.active=true;this.inspecting=false;this.group.visible=true;
      this.follow.yaw=state.yaw;this.follow.pitch=state.pitch;this.place(point);this.capture();this.onStatus('São Jorge · cenário inspirado nos croquis. Escadas: E ou Interagir.');return true;
    }catch(error){state.active=false;this.onStatus('Não foi possível carregar a visita. A campanha continua disponível.');return false;}
    finally{if(token===this.token){this.loading=false;this.onChange();}}
  }
  place(point){point=this.navigation.resolve(point.floor,point);this.floor=point.floor;this.view=this.floor;this.fill.position.y=this.navigation.floor(this.floor).baseY+2.7;this.player.position.set(point.x,point.y,point.z);this.follow.obstacles=this.navigation.obstacles(this.floor);this.follow.focusObject=null;this.follow.update(this.player.position,0,true);this.showFloors();this.update(0);}
  capture(){if(!this.active)return;Object.assign(this.getState(),{active:true,floor:this.floor,position:{x:this.player.position.x,z:this.player.position.z},yaw:this.inspecting?this.inspectAngles.yaw:this.follow.yaw,pitch:this.inspecting?this.inspectAngles.pitch:this.follow.pitch});}
  exit(){
    ++this.token;this.capture();this.getState().active=false;this.loading=false;this.inspecting=false;this.active=false;this.group.visible=false;
    if(this.legacy){for(const[root,visible]of this.legacy.visibility)root.visible=visible;this.player.position.copy(this.legacy.position);this.player.rotation.y=this.legacy.rotation;this.follow.yaw=this.legacy.yaw;this.follow.pitch=this.legacy.pitch;this.follow.obstacles=this.legacy.obstacles;this.follow.focusObject=null;this.follow.update(this.player.position,0,true);this.legacy=null;}
    this.onChange();
  }
  async useStair(id){
    if(!this.active||this.loading||this.inspecting)return false;
    const point=this.navigation.transition(this.floor,id,this.player.position);if(!point)return false;
    const token=++this.token;this.loading=true;this.onChange();
    try{await this.ensureFloor(point.floor);if(this.disposed||token!==this.token||!this.active)return false;this.place(point);this.capture();this.onStatus(`${this.navigation.floor(this.floor).label} · passagem ficcionalizada pelo patamar`);return true;}
    catch{this.onStatus('Andar indisponível; você permanece no patamar seguro.');return false;}
    finally{if(token===this.token){this.loading=false;this.onChange();}}
  }
  async inspect(view=this.floor){
    if(!this.active||this.loading)return false;
    const wanted=view==='all'?'all':this.navigation.floor(Number(view)).index;const token=++this.token;this.loading=true;this.onChange();
    try{for(const i of wanted==='all'?[0,1,2]:[wanted])await this.ensureFloor(i);if(this.disposed||token!==this.token||!this.active)return false;if(!this.inspecting)this.inspectAngles={yaw:this.follow.yaw,pitch:this.follow.pitch};this.inspecting=true;this.view=wanted;this.follow.obstacles=[];this.showFloors();return true;}
    catch{this.onStatus('Inspeção indisponível; exploração preservada.');return false;}
    finally{if(token===this.token){this.loading=false;this.onChange();}}
  }
  explore(){if(!this.active)return;++this.token;this.loading=false;if(this.inspecting&&this.inspectAngles){this.follow.yaw=this.inspectAngles.yaw;this.follow.pitch=this.inspectAngles.pitch;}this.inspecting=false;this.view=this.floor;this.follow.focusObject=null;this.follow.obstacles=this.navigation.obstacles(this.floor);this.showFloors();this.follow.update(this.player.position,0,true);this.onChange();}
  showFloors(){for(const[i,lease]of this.leases){this.details.get(i)?.architecture.setInspection(this.inspecting);lease.model.visible=this.inspecting?(this.view==='all'||this.view===i):i===this.floor;lease.model.position.y=this.navigation.floor(i).baseY+(this.inspecting&&this.view==='all'?i*3:0);}}
  focus(){if(!this.active||!this.inspecting)return null;return{x:0,y:this.view==='all'?8:this.navigation.floor(this.view).baseY+1,z:0,distance:this.view==='all'?52:40,yaw:this.follow.yaw,pitch:1.05};}
  targets(){if(!this.active||this.inspecting)return[];return this.navigation.targets(this.floor).map(s=>({...s,kind:'school-stair',name:s.label||s.name||'Escadas',height:this.navigation.floor(this.floor).walkY+1.2}));}
  move(delta){return this.active&&!this.inspecting?this.navigation.move(this.player.position,delta,this.floor):0;}
  room(){return this.navigation.roomAt(this.floor,this.player.position);}
  state(){return{active:this.active,loading:this.loading,inspect:this.inspecting,view:this.view,floor:this.floor,loaded:[...this.leases.keys()],room:this.active?this.room()?.name:null,style:this.details.has(this.floor)?'M2':'M1',details:this.details.has(this.floor)?{furniture:this.details.get(this.floor).furniture?.stats,architecture:{windows:this.details.get(this.floor).architecture.stats.windows,fixtures:this.details.get(this.floor).architecture.stats.fixtures,signs:this.details.get(this.floor).architecture.stats.signs},supports:this.details.get(this.floor).furniture?.supports.length}:null};}
  dispose(){if(this.disposed)return;this.exit();this.disposed=true;this.group.removeFromParent();for(const d of this.details.values()){d.furniture?.dispose();d.architecture.dispose();d.surfaces.dispose();}this.details.clear();this.lighting.dispose();this.materials?.dispose();for(const lease of this.leases.values())lease.release();this.leases.clear();}
}
