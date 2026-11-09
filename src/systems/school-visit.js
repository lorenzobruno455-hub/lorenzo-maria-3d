import * as THREE from 'three';
import {SchoolNavigation} from './school-navigation.js';

// The visit borrows the existing player/camera and freezes, rather than copies,
// the campaign. All coordinates are fictional game coordinates.
export class SchoolVisit {
  constructor({scene,legacyRoots,player,follow,pool,layout,getState,onChange=()=>{},onStatus=()=>{}}){
    Object.assign(this,{scene,legacyRoots,player,follow,pool,layout,getState,onChange,onStatus});
    this.navigation=new SchoolNavigation(layout);this.group=new THREE.Group();this.group.name='São Jorge · M1';this.group.visible=false;this.fill=new THREE.PointLight('#fff5e6',24,38,1.3);this.fill.position.set(0,2.7,0);this.group.add(this.fill);scene.add(this.group);
    this.active=false;this.loading=false;this.inspecting=false;this.floor=0;this.view=0;this.leases=new Map();this.pending=new Map();this.token=0;this.disposed=false;
  }
  async ensureFloor(index){
    const f=this.navigation.floor(index);if(this.leases.has(f.index))return this.leases.get(f.index);
    if(!this.pending.has(f.index))this.pending.set(f.index,this.pool.acquire(f.url,{preserveTransform:true,vertexColors:true}).then(lease=>{
      if(this.disposed){lease.release();return null;}
      lease.model.position.y=f.baseY;lease.model.name=f.label;lease.model.visible=false;this.group.add(lease.model);this.leases.set(f.index,lease);return lease;
    }).finally(()=>this.pending.delete(f.index)));
    return this.pending.get(f.index);
  }
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
  place(point){this.floor=point.floor;this.view=this.floor;this.fill.position.y=this.navigation.floor(this.floor).baseY+2.7;this.player.position.set(point.x,point.y,point.z);this.follow.obstacles=this.navigation.obstacles(this.floor);this.follow.focusObject=null;this.follow.update(this.player.position,0,true);this.showFloors();}
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
  showFloors(){for(const[i,lease]of this.leases){lease.model.visible=this.inspecting?(this.view==='all'||this.view===i):i===this.floor;lease.model.position.y=this.navigation.floor(i).baseY+(this.inspecting&&this.view==='all'?i*3:0);}}
  focus(){if(!this.active||!this.inspecting)return null;return{x:0,y:this.view==='all'?8:this.navigation.floor(this.view).baseY+1,z:0,distance:this.view==='all'?52:40,yaw:this.follow.yaw,pitch:1.05};}
  targets(){if(!this.active||this.inspecting)return[];return this.navigation.targets(this.floor).map(s=>({...s,kind:'school-stair',name:s.label||s.name||'Escadas',height:this.navigation.floor(this.floor).walkY+1.2}));}
  move(delta){return this.active&&!this.inspecting?this.navigation.move(this.player.position,delta,this.floor):0;}
  room(){return this.navigation.roomAt(this.floor,this.player.position);}
  state(){return{active:this.active,loading:this.loading,inspect:this.inspecting,view:this.view,floor:this.floor,loaded:[...this.leases.keys()],room:this.active?this.room()?.name:null};}
  dispose(){if(this.disposed)return;this.exit();this.disposed=true;this.group.removeFromParent();for(const lease of this.leases.values())lease.release();this.leases.clear();}
}
