import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
function glbJSON(buffer){assert.equal(buffer.readUInt32LE(0),0x46546c67);return JSON.parse(buffer.subarray(20,20+buffer.readUInt32LE(12)).toString());}
for(const name of ['lorenzo','maria'])test(`${name} ships a real rigged GLB with facial detail and animation clips`,async()=>{
 const bytes=await readFile(`public/models/aurora/${name}.glb`),g=glbJSON(bytes);
 assert(bytes.length<1_500_000);assert(g.skins?.[0].joints.length>=18);
 const clips=g.animations.map(a=>a.name);for(const clip of ['Idle','Walk','Run','Talk','Interact','Sit','Wave'])assert(clips.includes(clip),clip);
 const names=g.nodes.map(n=>n.name).join(' ');assert.match(names,/Aurora/);
 assert(g.materials.some(m=>/hair/i.test(m.name)));assert(g.materials.some(m=>/eye/i.test(m.name)));
 assert(g.meshes.every(m=>m.primitives.every(p=>p.attributes.JOINTS_0!==undefined)));
});
test('GLB cache shares resources but gives each actor an independent skeleton and pivot',async()=>{
 const {GLBAssets}=await import('../../src/systems/asset-pipeline.js');
 const geometry=new THREE.BoxGeometry(1,2,1),material=new THREE.MeshStandardMaterial({color:'#ffcc88'}),root=new THREE.Group(),mesh=new THREE.Mesh(geometry,material);mesh.position.set(2,4,1);root.add(mesh);
 let loads=0;const pool=new GLBAssets({material:(c)=>new THREE.MeshToonMaterial({color:c})},{load:async()=>{loads++;return {scene:root,animations:[]};}});
 const [a,b]=await Promise.all([pool.acquire('same'),pool.acquire('same')]);assert.equal(loads,1);
 assert.notEqual(a.model,b.model);const ma=a.model.getObjectByProperty('isMesh',true),mb=b.model.getObjectByProperty('isMesh',true);assert.equal(ma.geometry,mb.geometry);assert.equal(ma.material,mb.material);
 const bounds=new THREE.Box3().setFromObject(a.model),size=bounds.getSize(new THREE.Vector3());assert(Math.abs(size.y-1.82)<1e-5);assert(Math.abs(bounds.min.y)<1e-5);assert(Math.abs((bounds.min.x+bounds.max.x)/2)<1e-5);
 a.model.rotation.y=1;assert.equal(b.model.rotation.y,0);let disposals=0;geometry.addEventListener('dispose',()=>disposals++);a.release();assert.equal(disposals,0);b.release();pool.dispose();assert.equal(disposals,1);pool.dispose();assert.equal(disposals,1);
});
test('invalid GLB dimensions reject and dispose their source resources',async()=>{
 const {GLBAssets}=await import('../../src/systems/asset-pipeline.js');const geometry=new THREE.BufferGeometry(),material=new THREE.MeshBasicMaterial(),scene=new THREE.Group();scene.add(new THREE.Mesh(geometry,material));let disposed=0;geometry.addEventListener('dispose',()=>disposed++);
 const pool=new GLBAssets({material:()=>material},{load:async()=>({scene,animations:[]})});await assert.rejects(pool.acquire('invalid'),/altura|height/i);pool.dispose();assert.equal(disposed,1);
});
test('normalization preserves authored root transforms and grounds the model',async()=>{
 const {GLBAssets}=await import('../../src/systems/asset-pipeline.js');const {Resources}=await import('../../src/systems/resources.js');const r=new Resources(),scene=new THREE.Group();scene.position.set(4,6,-3);scene.scale.setScalar(2);scene.add(new THREE.Mesh(new THREE.BoxGeometry(1,2,1),new THREE.MeshStandardMaterial()));
 const pool=new GLBAssets(r,{load:async()=>({scene,animations:[]})}),lease=await pool.acquire('transformed');const b=new THREE.Box3().setFromObject(lease.model);assert(Math.abs(b.min.y)<1e-5);assert(Math.abs(b.getCenter(new THREE.Vector3()).x)<1e-5);lease.release();pool.dispose();r.dispose();
});
test('pool disposed during asynchronous loading disposes the late template once',async()=>{
 const {GLBAssets}=await import('../../src/systems/asset-pipeline.js');const scene=new THREE.Group(),g=new THREE.BoxGeometry(),m=new THREE.MeshBasicMaterial();scene.add(new THREE.Mesh(g,m));let resolve,disposed=0;g.addEventListener('dispose',()=>disposed++);const pool=new GLBAssets({}, {load:()=>new Promise(r=>resolve=r)});const request=pool.acquire('late');pool.dispose();resolve({scene,animations:[]});await assert.rejects(request,/disposed/);assert.equal(disposed,1);
});
test('actual skinned clones animate independently while retaining shared geometry',async()=>{
 const {GLBAssets}=await import('../../src/systems/asset-pipeline.js');const {Resources}=await import('../../src/systems/resources.js');const r=new Resources(),scene=new THREE.Group(),g=new THREE.BoxGeometry(1,2,1),n=g.attributes.position.count,indices=new Uint16Array(n*4),weights=new Float32Array(n*4);for(let i=0;i<n;i++)weights[i*4]=1;g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(indices,4));g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));
 const mesh=new THREE.SkinnedMesh(g,new THREE.MeshStandardMaterial()),bone=new THREE.Bone();bone.name='hips';mesh.add(bone);mesh.bind(new THREE.Skeleton([bone]));scene.add(mesh);
 const pool=new GLBAssets(r,{load:async()=>({scene,animations:[]})}),a=await pool.acquire('rig'),b=await pool.acquire('rig');const ma=a.model.getObjectByProperty('isSkinnedMesh',true),mb=b.model.getObjectByProperty('isSkinnedMesh',true);assert.notEqual(ma.skeleton,mb.skeleton);assert.notEqual(ma.skeleton.bones[0],mb.skeleton.bones[0]);assert.equal(ma.geometry,mb.geometry);ma.skeleton.bones[0].rotation.x=.5;assert(Math.abs(mb.skeleton.bones[0].rotation.x)<1e-9);a.release();b.release();pool.dispose();r.dispose();
});
for(const name of ['lorenzo','maria'])test(`${name} Wave actually raises the hand above the shoulder`,async()=>{
 const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js'),{GLBAssets}=await import('../../src/systems/asset-pipeline.js'),{Resources}=await import('../../src/systems/resources.js');
 const bytes=await readFile(`public/models/aurora/${name}.glb`),gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 const r=new Resources(),pool=new GLBAssets(r,{load:async()=>gltf}),lease=await pool.acquire(name),hand=lease.model.getObjectByName('handR'),shoulder=lease.model.getObjectByName('upper_armR');assert(hand&&shoulder);
 const mixer=new THREE.AnimationMixer(lease.model);mixer.clipAction(lease.animations.find(a=>a.name==='Wave')).play();let raised=false;for(let frame=0;frame<=48;frame++){mixer.setTime(frame/24);lease.model.updateMatrixWorld(true);if(hand.getWorldPosition(new THREE.Vector3()).y>shoulder.getWorldPosition(new THREE.Vector3()).y+.1)raised=true;}
 assert(raised,'the hand remained below the shoulder');mixer.stopAllAction();mixer.uncacheRoot(lease.model);lease.release();pool.dispose();r.dispose();
});
test('Sit bends knees forward in the glTF +Z direction and leaves feet at ground level',async()=>{
 const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js'),{GLBAssets}=await import('../../src/systems/asset-pipeline.js'),{Resources}=await import('../../src/systems/resources.js');const bytes=await readFile('public/models/aurora/lorenzo.glb'),gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 const r=new Resources(),pool=new GLBAssets(r,{load:async()=>gltf}),lease=await pool.acquire('sit'),mixer=new THREE.AnimationMixer(lease.model);mixer.clipAction(lease.animations.find(a=>a.name==='Sit')).play();mixer.setTime(.5);lease.model.updateMatrixWorld(true);const hip=lease.model.getObjectByName('thighR').getWorldPosition(new THREE.Vector3()),knee=lease.model.getObjectByName('shinR').getWorldPosition(new THREE.Vector3()),foot=lease.model.getObjectByName('footR').getWorldPosition(new THREE.Vector3());assert(knee.z>hip.z+.2,'knees bend behind the character');assert(Math.abs(foot.y)<.05);mixer.stopAllAction();mixer.uncacheRoot(lease.model);lease.release();pool.dispose();r.dispose();
});
