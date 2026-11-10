import * as THREE from 'three';

// The existing canopy supplies centers and visibility. Children follow the same
// campus occlusion root; no new collision, streaming or shadow-light system.
export function createComicCanopies(scene,resources,owned){
 const sources=[];scene.traverse(m=>{if(m.isInstancedMesh&&m.userData.comicTreeCenters)sources.push(m);});
 const saved=[],groups=[],flowerColors=[],palette=['#22cc79','#75e83d','#18d6cc'];let trees=0;
 const ink=new THREE.MeshBasicMaterial({color:'#131a2a',side:THREE.BackSide,toneMapped:false});owned.push(ink);
 for(const source of sources){
  const centers=source.userData.comicTreeCenters,count=centers.length*3,geometry=source.geometry;
  const fill=new THREE.InstancedMesh(geometry,resources.material('#ffffff'),count),outline=new THREE.InstancedMesh(geometry,ink,count),dummy=new THREE.Object3D();
  for(const [t,c]of centers.entries())for(let i=0;i<3;i++){
   const sign=t%2?1:-1,dx=[-1,.7,0][i]*sign,dy=[-.1,.2,.7][i],dz=[0,-.15,.5][i],sx=[1.65,1.75,1.35][i],sy=[1.35,1.55,1.25][i];
   const scale=c.scale??1;dummy.position.set(c.x+dx*scale,c.y+dy*scale,c.z+dz*scale);dummy.scale.set(sx,sy,1.6-i*.075).multiplyScalar(c.scale??1);dummy.rotation.y=t*.43;dummy.updateMatrix();
   fill.setMatrixAt(t*3+i,dummy.matrix);fill.setColorAt(t*3+i,new THREE.Color(palette[(i+t)%3]));
   dummy.scale.multiplyScalar(1.025);dummy.updateMatrix();outline.setMatrixAt(t*3+i,dummy.matrix);
  }
  fill.castShadow=source.castShadow;fill.receiveShadow=true;fill.computeBoundingSphere();outline.computeBoundingSphere();
  const group=new THREE.Group();group.name='Comic campus crowns';group.add(outline,fill);source.add(group);groups.push(group);owned.push(fill,outline);
  saved.push({mesh:source,count:source.count});source.count=0;trees+=centers.length;
 }
 scene.traverse(m=>{
  if(!m.isInstancedMesh||m.geometry!==resources.geometry('leaf')||m.userData.comicTreeCenters||!m.instanceColor)return;
  const matrix=new THREE.Matrix4(),p=new THREE.Vector3();m.getMatrixAt(0,matrix);p.setFromMatrixPosition(matrix);
  if(p.y>1.2)return;
  flowerColors.push({mesh:m,colors:m.instanceColor.array.slice()});
  for(let i=0;i<m.count;i++)m.setColorAt(i,new THREE.Color(['#ff5a4b','#ff3d9a','#9655f5','#ffe238'][i%4]));m.instanceColor.needsUpdate=true;
 });
 return{saved,trees,setInspection(active){for(const g of groups)g.children[0].visible=!active;},restore(){for(const f of flowerColors){f.mesh.instanceColor.array.set(f.colors);f.mesh.instanceColor.needsUpdate=true;}for(const s of saved)s.mesh.count=s.count;for(const g of groups)g.removeFromParent();}};
}
