import * as THREE from 'three';
import './style.css';
const $ = (id) => document.getElementById(id);
const scene = new THREE.Scene(); scene.background = new THREE.Color('#cbdedc'); scene.fog = new THREE.Fog('#cbdedc',48,115);
const renderer = new THREE.WebGLRenderer({canvas:$('game'),antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,180);
scene.add(new THREE.HemisphereLight(0xe9f4ff,0x67754d,2.1));const sun=new THREE.DirectionalLight(0xffe3b2,3.1);sun.position.set(-20,35,14);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-45,right:45,top:45,bottom:-45,far:100});sun.shadow.bias=-.0005;scene.add(sun);
const mats={};function mat(color){return mats[color]??=new THREE.MeshStandardMaterial({color,roughness:.85});}
const solids=[];
function box(x,y,z,w,h,d,color,collision=false){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);if(collision)solids.push({x,z,w:w/2+.38,d:d/2+.38});return m;}
function sphere(x,y,z,r,color){const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),mat(color));m.position.set(x,y,z);m.castShadow=true;scene.add(m);return m;}
box(0,-.2,0,82,.4,70,'#9da982');box(0,.015,6,12,.05,48,'#d7ceba');box(0,.025,0,56,.05,12,'#d7ceba');
// Separate wings and open doorways keep the classrooms traversable.
function wing(cx,label){box(cx,2.5,-17,22,5,.5,'#e5d8bd',true);// Front wall sections leave a central doorway.
box(cx-7,2.5,-6,8,5,.5,'#e5d8bd',true);box(cx+7,2.5,-6,8,5,.5,'#e5d8bd',true);box(cx,4.5,-6,6,1,.5,'#e5d8bd');
box(cx-11,2.5,-11.5,.5,5,11,'#e5d8bd',true);box(cx+11,2.5,-11.5,.5,5,11,'#e5d8bd',true);box(cx,.06,-11.5,22,.12,11,'#b5a18a');
for(let x=-8;x<=8;x+=4){box(cx+x,2.7,-16.7,2.4,2,.08,'#80a4a6');box(cx+x,2.7,-16.6,.08,2,.1,'#e7e0cb');}
box(cx,5.2,-11.5,23,.4,12,'#65756c'); // roof fades when inside
const roof=scene.children.at(-1);roof.userData.roof=true;roof.userData.cx=cx;
for(let x=-6;x<=6;x+=6)for(let z=-13;z<=-9;z+=4){box(cx+x,.9,z,2.5,.15,1.2,'#b58b57',true);for(const dx of [-1,1])box(cx+x+dx,.45,z,.08,.9,.08,'#555c54');box(cx+x,.55,z+1.1,1,.15,.8,'#658476',true);}
box(cx,2.2,-16.65,6,1.7,.1,'#315449');sign(label,cx,4,-5.6);}
function sign(text,x,y,z){const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='#254638';ctx.fillRect(0,0,512,96);ctx.fillStyle='#f3e9d2';ctx.font='26px sans-serif';ctx.textAlign='center';ctx.fillText(text,256,59);const mesh=new THREE.Mesh(new THREE.PlaneGeometry(5,.94),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)}));mesh.position.set(x,y,z);scene.add(mesh);return mesh;}
wing(-17,'SALA 01 · LITERATURA');wing(17,'BIBLIOTECA');
for(let i=0;i<4;i++){box(24+i*.1,1.4,-14+i*1.6,4,2.8,.5,'#765f48',true);for(let j=0;j<8;j++)box(22.4+j*.43,1.6,-13.7+i*1.6,.3,1.1,.3,['#8f5448','#5b7772','#c19e60'][j%3]);}
// A fountain, planted beds, benches and trees give the courtyard landmarks.
function cylinder(x,y,z,r,h,color){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,32),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;}
cylinder(0,.3,4,3.2,.6,'#aea994');cylinder(0,.64,4,2.8,.1,'#72aaa8');cylinder(0,1.2,4,.5,1.2,'#c8c2aa');cylinder(0,1.8,4,1.3,.18,'#bab59d');solids.push({x:0,z:4,w:3.4,d:3.4});
const water=[];for(let i=0;i<12;i++){const a=i*Math.PI/6;water.push(sphere(Math.cos(a)*.8,1.6,4+Math.sin(a)*.8,.07,'#c6e4e5'));}
function tree(x,z){cylinder(x,2,z,.23,4,'#74624b');sphere(x,4.7,z,2,'#687d4c');sphere(x+.9,4.1,z,.95,'#82945c');solids.push({x,z,w:.65,d:.65});}
for(const x of [-32,-10,10,32])for(const z of [13,24])tree(x,z);
for(const x of [-10,10]){box(x,.25,5,4,.5,5,'#7c8f60',true);for(let i=0;i<7;i++)sphere(x-1.5+(i%3)*1.3,.7,3.5+Math.floor(i/3)*1.3,.55,'#819c69');box(x,.7,13,4,.2,1,'#9b7950',true);box(x,1.2,13.4,4,.9,.15,'#9b7950');}
box(0,1.1,30,65,2.2,.25,'#596e61',true);sign('COLÉGIO AURORA',0,3,29.7).rotation.y=Math.PI;
function person(x,z,hair,shirt){const g=new THREE.Group();const part=(geo,color,y)=>{const m=new THREE.Mesh(geo,mat(color));m.position.y=y;m.castShadow=true;g.add(m);return m;};part(new THREE.CapsuleGeometry(.3,.55,4,8),shirt,1.05);part(new THREE.SphereGeometry(.26,16,12),'#c89c79',1.76);part(new THREE.SphereGeometry(.275,16,12),hair,1.9);const legs=[];for(const side of [-1,1]){const leg=part(new THREE.CapsuleGeometry(.12,.52,4,8),'#3b4653',.38);leg.position.x=side*.17;legs.push(leg);const arm=part(new THREE.CapsuleGeometry(.09,.48,4,8),shirt,1.05);arm.position.x=side*.4;}g.position.set(x,.1,z);scene.add(g);g.userData.legs=legs;return g;}
const player=person(0,19,'#43372f','#e8e4d7');const maria=person(5,5,'#4e302b','#b96f5c');maria.rotation.y=-.8;
const collectibles=[{name:'Caderno de literatura',x:-17,z:-8.5},{name:'Cartão da biblioteca',x:17,z:-8.5},{name:'Fotografia do jardim',x:10,z:22}];
for(const c of collectibles){c.mesh=box(c.x,1,c.z,.5,.1,.65,'#e9bc73');c.light=sphere(c.x,1.55,c.z,.11,'#ffe5a2');}
const keys=new Set();let started=false,stage=0,collected=0,target=null,yaw=0,dialog=false,audioCtx=null,sound=false;
function speak(speaker,text,done){dialog=true;$('speaker').textContent=speaker;$('speech').textContent=text;$('dialog').hidden=false;$('prompt').hidden=true;$('next').onclick=()=>{dialog=false;$('dialog').hidden=true;done?.();};}
function interact(){if(!started||dialog||!target)return;if(target==='maria'){if(stage===0)speak('MARIA','Lorenzo! Ainda bem que chegou. Espalhei três lembranças pela escola: um caderno na sala de literatura, um cartão na biblioteca e uma foto no jardim. Pode me ajudar a encontrá-las?',()=>{stage=1;$('objective').textContent='Explore a sala, a biblioteca e o jardim. Recolha as três lembranças.';});else if(collected===3)speak('MARIA','Você encontrou tudo! Agora temos o começo da nossa história. Vamos descobrir juntos o que este ano reserva?',()=>{stage=2;$('objective').textContent='Capítulo concluído! Continue explorando o Colégio Aurora.';$('count').textContent='Primeiro sinal · concluído';});else speak('MARIA',`Faltam ${3-collected} lembranças. Procure os pequenos pontos dourados na escola!`);}else if(stage===1&&!target.taken){target.taken=true;scene.remove(target.mesh,target.light);collected++;$('progress').style.width=`${collected/3*100}%`;$('count').textContent=`${collected} de 3 lembranças`;$('objective').textContent=collected===3?'Volte ao pátio e converse com Maria.':`${target.name} encontrado! Continue procurando.`;if(sound){const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);o.frequency.value=660;g.gain.setValueAtTime(.06,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+.3);o.start();o.stop(audioCtx.currentTime+.3);}}}
$('start').onclick=()=>{started=true;$('welcome').hidden=true;};$('interact').onclick=interact;
$('help').onclick=()=>speak('COMO JOGAR','Use WASD ou os controles na tela para andar. As setas esquerda e direita giram a câmera. Segure Shift para correr. Aproxime-se de Maria ou de uma lembrança e pressione E. Os corredores entre as duas alas dão acesso às salas.');
$('sound').onclick=()=>{audioCtx??=new AudioContext();audioCtx.resume();sound=!sound;$('sound').textContent=`Som: ${sound?'ligado':'desligado'}`;};
addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());if(e.key.toLowerCase()==='e'&&!e.repeat)interact();});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>keys.clear());
for(const b of document.querySelectorAll('[data-key]')){b.onpointerdown=e=>{b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);};b.onpointerup=b.onpointercancel=()=>keys.delete(b.dataset.key);}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}addEventListener('resize',resize);resize();
const clock=new THREE.Clock();let elapsed=0;
function blocked(x,z){return Math.abs(x)>38||z>29||z< -27||solids.some(s=>Math.abs(x-s.x)<s.w&&Math.abs(z-s.z)<s.d);}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);elapsed+=dt;let moving=false;if(started&&!dialog){yaw+=((keys.has('arrowleft')?1:0)-(keys.has('arrowright')?1:0))*dt*1.7;let dx=(keys.has('d')?1:0)-(keys.has('a')?1:0),dz=(keys.has('s')?1:0)-(keys.has('w')?1:0);const length=Math.hypot(dx,dz);if(length){dx/=length;dz/=length;const speed=(keys.has('shift')?6:3.5)*dt;const x=(dx*Math.cos(yaw)+dz*Math.sin(yaw))*speed,z=(-dx*Math.sin(yaw)+dz*Math.cos(yaw))*speed;if(!blocked(player.position.x+x,player.position.z))player.position.x+=x;if(!blocked(player.position.x,player.position.z+z))player.position.z+=z;player.rotation.y=Math.atan2(x,z);moving=true;}}
player.userData.legs.forEach((l,i)=>l.rotation.x=moving?Math.sin(elapsed*10+i*Math.PI)*.4:0);
const desired=new THREE.Vector3(player.position.x+Math.sin(yaw)*11,10,player.position.z+Math.cos(yaw)*11);camera.position.lerp(desired,1-Math.exp(-dt*5));camera.lookAt(player.position.x,1.2,player.position.z-1);
scene.children.filter(m=>m.userData.roof).forEach(m=>m.visible=!(Math.abs(player.position.x-m.userData.cx)<11&&player.position.z< -5));
for(const c of collectibles)if(!c.taken){c.mesh.rotation.y=elapsed*.7;c.light.position.y=1.6+Math.sin(elapsed*2)*.15;}water.forEach((m,i)=>m.position.y=1.45+Math.sin(elapsed*3+i)*.2);
target=null;if(player.position.distanceTo(maria.position)<2.5)target='maria';else if(stage===1)target=collectibles.find(c=>!c.taken&&Math.hypot(player.position.x-c.x,player.position.z-c.z)<2);$('prompt').hidden=!target||dialog||!started;if(target)$('prompt').textContent=target==='maria'?'E · Conversar com Maria':`E · Recolher ${target.name}`;
const zone=player.position.z< -5?(player.position.x<0?'SALA DE LITERATURA':'BIBLIOTECA'):player.position.z>17?'JARDIM DA ESCOLA':'PÁTIO CENTRAL';$('location').firstChild.textContent=zone+' ';renderer.render(scene,camera);}
camera.position.set(0,10,30);animate();
// Read-only snapshot for diagnostics and integration checks.
export function getGameState(){return {x:player.position.x,z:player.position.z,stage,collected,started};}
