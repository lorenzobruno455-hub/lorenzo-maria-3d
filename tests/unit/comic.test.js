import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Resources} from '../../src/systems/resources.js';
import {batchMeshes} from '../../src/systems/batching.js';
test('shared school materials use three discrete lighting bands',()=>{
 const r=new Resources(),first=r.material('#b99b70'),second=r.material('#62867a');
 assert.equal(first.isMeshToonMaterial,true);
 assert.equal(first.gradientMap,second.gradientMap);
 assert.equal(first.gradientMap.image.width,3);
 assert.equal(first.gradientMap.minFilter,THREE.NearestFilter);
 assert.equal(r.material('#b99b70'),first);
 let disposed=0;first.gradientMap.addEventListener('dispose',()=>disposed++);r.dispose();assert.equal(disposed,1);
});
test('batched surfaces declare themselves for architectural ink without moving originals',()=>{
 const root=new THREE.Group(),m=new THREE.Mesh(new THREE.BoxGeometry(1,2,3),new THREE.MeshBasicMaterial());m.position.set(4,1,0);root.add(m);const owned=[];
 batchMeshes(root,[m],owned);const baked=root.children[0];assert.equal(baked.userData.inkStatic,true);assert.equal(new THREE.Box3().setFromObject(baked).min.x,3.5);
 owned.forEach(g=>g.dispose());m.geometry.dispose();m.material.dispose();
});
test('ink follows articulated pivots and quality changes reuse geometry without disposing source meshes',async()=>{
 const module=await import('../../src/systems/ink-outlines.js').catch(()=>null);assert.ok(module,'InkOutlines feature is missing');
 const scene=new THREE.Scene(),r=new Resources(),wall=r.mesh('box','#eadfc8',[2,3,.2]);wall.userData.inkStatic=true;scene.add(wall);
 const root=new THREE.Group(),body=new THREE.Group();body.name='body';root.add(body);const source=r.mesh('sphere','#dbdbcf',[.2,.5,.15]);body.add(source);scene.add(root);
 const ink=new module.InkOutlines(scene,r,[{root,player:true}]);const ids=ink.actorInk.map(o=>o.mesh.geometry.uuid);const lineId=ink.staticInk.geometry.uuid;
 ink.actorInk[0].mesh.castShadow=true;
 for(let i=0;i<12;i++)ink.update(['low','medium','high'][i%3],new THREE.Vector3());
 assert.deepEqual(ink.actorInk.map(o=>o.mesh.geometry.uuid),ids);assert.equal(ink.staticInk.geometry.uuid,lineId);
 body.rotation.z=.4;root.updateMatrixWorld(true);assert.equal(ink.actorInk[0].mesh.parent,source);assert.equal(ink.actorInk[0].mesh.castShadow,false);
 let originalDisposed=0;source.geometry.addEventListener('dispose',()=>originalDisposed++);ink.dispose();assert.equal(originalDisposed,0);assert.equal(source.children.length,0);r.dispose();
});
test('movable mission props cannot leave permanent ink after collection',async()=>{
 const previous=globalThis.document;globalThis.document={createElement:()=>({getContext:()=>new Proxy({},{get:()=>()=>{}})})};
 const {createWorld}=await import('../../src/systems/world.js');const {createCampusWorld}=await import('../../src/systems/campus-world.js');const {InkOutlines}=await import('../../src/systems/ink-outlines.js');
 const scene=new THREE.Scene(),world=createWorld(scene),campus=createCampusWorld(scene,world);
 for(const o of [...world.collectibles,...campus.objects]) if(o.mesh)o.mesh.position.x+=2000;
 const ink=new InkOutlines(scene,world.resources,[]);ink.staticInk.geometry.computeBoundingBox();
 assert(ink.staticInk.geometry.boundingBox.max.x<1000,'dynamic props were baked into architecture');
 ink.dispose();campus.dispose();world.dispose();globalThis.document=previous;
});
test('narrative camera zooms smoothly but reduced motion cuts directly to and from the book',async()=>{
 const {FollowCamera}=await import('../../src/systems/camera.js');const camera=new THREE.PerspectiveCamera(),f=new FollowCamera(camera,[]),p={x:0,z:0};f.update(p,0,true);
 f.focusObject={x:0,y:1.42,z:0,distance:1.8,yaw:0,pitch:.65};f.update(p,.016);assert(f.actualDistance>1.8&&f.actualDistance<7,'narrative zoom jumped');
 f.reducedMotion=true;f.update(p,.016);assert.equal(f.actualDistance,1.8);f.focusObject=null;f.update(p,.016);assert.equal(f.actualDistance,7);
});
