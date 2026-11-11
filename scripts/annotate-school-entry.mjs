import * as THREE from 'three';
import {readFile,writeFile} from 'node:fs/promises';
import {EXTERIOR_PROPOSAL} from '../src/systems/school-exterior.js';
const dir='docs/captures/comic-overdrive-20-d4-confirmed',views={};
for(const variant of ['overview','entry']){
 const report=JSON.parse(await readFile(`${dir}/${variant}-metrics.json`,'utf8')),s=report.samples[0];
 const camera=new THREE.PerspectiveCamera(52,report.viewport.width/report.viewport.height,.06,140);camera.position.set(s.camera.x,s.camera.y,s.camera.z);camera.lookAt(new THREE.Vector3(s.cameraFocus.x,s.cameraFocus.y,s.cameraFocus.z));camera.updateMatrixWorld();
 const project=p=>{const v=new THREE.Vector3(...p).project(camera);return[(v.x+1)*report.viewport.width/2,(1-v.y)*report.viewport.height/2];};
 views[variant]={image:variant==='overview'?'photo-front-overview.jpg':'photo-side-entry-entry.jpg',points:Object.fromEntries(EXTERIOR_PROPOSAL.gates.map(g=>[g.id,project([g.x,1.4,g.z])])),route:[[44,.08,5.5],[49,.08,5.5],[53.5,.08,5.5]].map(project)};
}
await writeFile(`${dir}/annotation-points.json`,JSON.stringify({layout:EXTERIOR_PROPOSAL,views},null,2));
