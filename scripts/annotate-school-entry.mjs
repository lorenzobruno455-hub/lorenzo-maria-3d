import * as THREE from 'three';
import {readFile,writeFile} from 'node:fs/promises';
import {EXTERIOR_PROPOSAL} from '../src/systems/school-exterior.js';
const dir='docs/captures/comic-overdrive-20-d4',views={};
for(const variant of ['overview','entry']){
 const report=JSON.parse(await readFile(`${dir}/${variant}-metrics.json`,'utf8')),s=report.samples[0];
 const camera=new THREE.PerspectiveCamera(52,report.viewport.width/report.viewport.height,.06,140);camera.position.set(s.camera.x,s.camera.y,s.camera.z);camera.lookAt(new THREE.Vector3(s.cameraFocus.x,s.cameraFocus.y,s.cameraFocus.z));camera.updateMatrixWorld();
 const project=p=>{const v=new THREE.Vector3(...p).project(camera);return[(v.x+1)*report.viewport.width/2,(1-v.y)*report.viewport.height/2];};
 views[variant]={image:variant==='overview'?'photo-front-overview.jpg':'photo-side-entry-entry.jpg',points:{facade:project([48.7,7.2,-7]),annex:project([49,3.2,34]),gate:project([EXTERIOR_PROPOSAL.gate.x,1.8,EXTERIOR_PROPOSAL.gate.z]),corridor:project([60,1.5,19.12])},route:[[46.8,.08,20.4],[60,.08,20.4],[60,.08,19.15]].map(project)};
}
await writeFile(`${dir}/annotation-points.json`,JSON.stringify({proposal:EXTERIOR_PROPOSAL,views},null,2));
