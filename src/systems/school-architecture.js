import * as THREE from 'three';
import {COLORBEAT_STYLE} from './colorbeat-materials.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Original atmospheric panels: these do not purport to reconstruct real windows.
export function createSchoolArchitecture({ resources, materials, floor, structure }) {
  const group = new THREE.Group(); group.name = `school-architecture-${floor.index}`;
  const batches = new Map(), owned = [], parts = [], signs = [], colliders = [];
  const stats = { windows: 0, fixtures: 0, signs: 0, draws: 0, parts, labels: signs };
  let disposed = false;
  function box(name, position, size, color, kind = 'plain') {
    const material = materials.get(color, kind);
    const geometry = resources.geometry('box').clone();
    geometry.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...position), new THREE.Quaternion(), new THREE.Vector3(...size)));
    if (!batches.has(material)) batches.set(material, []);
    batches.get(material).push(geometry);
    parts.push({ name, minX: position[0]-size[0]/2, maxX: position[0]+size[0]/2, minY: position[1]-size[1]/2, maxY: position[1]+size[1]/2, minZ: position[2]-size[2]/2, maxZ: position[2]+size[2]/2 });
  }
  function window(side, z, width) {
    const x = side * 10.84;
    box('window-panel', [x, 1.95, z], [.055, 1.45, width], '#A9CED5', 'glass');
    for (const y of [1.19, 2.71]) box('window-frame', [side*10.80,y,z],[.14,.09,width+.16],'#F4F4F1');
    for (const offset of [-width/2, 0, width/2]) box('window-mullion',[side*10.79,1.95,z+offset],[.16,1.5,.065],'#F4F4F1');
    box('curtain-rail',[side*10.72,2.83,z],[.12,.055,width+.3],'#5B616B','metal');
    for (const offset of [-width/2+.09,width/2-.09]) {
      box('curtain',[side*10.67,1.99,z+offset],[.15,1.625,.23],'#D8D3C8','cloth');
      box('curtain-fold',[side*10.61,1.99,z+offset],[.035,1.55,.055],'#BBB5AA','cloth');
    }
    colliders.push({ minX: side < 0 ? -10.88 : 10.5925, maxX: side < 0 ? -10.5925 : 10.88,
      minY: floor.baseY + 1.15, maxY: floor.baseY + 2.87, minZ: z-width/2-.15, maxZ: z+width/2+.15, kind: 'architecture-detail' });
    stats.windows++;
  }
  function fixture(x,z) {
    box('ceiling-canopy',[x,3.37,z],[.9,.06,.18],'#5B616B','metal');
    for(const dx of [-.37,.37]) box('fixture-support',[x+dx,3.14,z],[.025,.46,.025],'#5B616B','metal');
    box('fixture-housing',[x,2.88,z],[1.22,.12,.38],'#5B616B','metal');
    box('fixture-diffuser',[x,2.811,z],[1.10,.025,.29],'#FFF4D5','emissive');
    stats.fixtures++;
  }
  function sign(text, x,y,z, rotation=0, width=1.8,height=.36) { signs.push({text,x,y,z,rotation,width,height}); }
  if (floor.index === 2) {
    for (const side of [-1,1]) for (const z of [-14,-7,0,7,14]) window(side,z,2.5);
    for (const x of [-5,5]) for(const z of [-13,-5,3,11]) fixture(x,z);
    sign('SALÃO MULTIUSO',0,2.2,-18.855,0,3,.5);
    for(const [x,z,rotation] of [[5,-18.855,0],[-5,18.855,Math.PI]]){
      sign('ENCONTROS DA ESCOLA\nLEITURA • ARTE • MÚSICA\nESPAÇO PARA CRIAR JUNTOS',x,1.95,z,rotation,3,.9);
      Object.assign(signs.at(-1),{roomId:floor.rooms[0].id,kind:'mural'});
    }
  } else {
    for (const room of floor.rooms) {
      const side = room.x1 <= -10 ? -1 : room.x2 >= 10 ? 1 : 0;
      if(side && room.type !== 'stair') window(side,(room.z1+room.z2)/2, Math.min(2.5,room.z2-room.z1-1));
      if(room.type !== 'stair') fixture(room.x,room.z);
      const d=room.door;
      if(!d) continue;
      const alongZ = Math.abs(d.x) === 2;
      // Jambs lie outside the original aperture; no closed leaves.
      if(alongZ) {
        for(const s of [-1,1]) box('door-jamb',[d.x,1.32,d.z+s*(d.width/2+.065)],[.25,2.58,.13],'#7A5A3D','wood');
        box('door-lintel',[d.x,2.66,d.z],[.25,.12,d.width+.26],'#7A5A3D','wood');
        sign(room.name,d.x-Math.sign(d.x)*.115,2.87,d.z,-Math.sign(d.x)*Math.PI/2,1.9,.26);
      } else {
        for(const s of [-1,1]) box('door-jamb',[d.x+s*(d.width/2+.065),1.32,d.z],[.13,2.58,.25],'#7A5A3D','wood');
        box('door-lintel',[d.x,2.66,d.z],[d.width+.26,.12,.25],'#7A5A3D','wood');
        sign(room.name,d.x,2.87,d.z+.145,0,1.9,.26);
      }
    }
    for(const z of [-12,-4,4,12]) fixture(0,z);
  }
  // Thin perimeter trim stays inside the inherited wall collision buffer.
  for(const side of [-1,1]) box('institutional-trim',[side*10.84,.78,0],[.07,.055,37.4],'#B9413B');
  sign('IDEIAS EM MOVIMENTO',10.855,1.9,17, -Math.PI/2,1.25,.9);
  sign('LER • CRIAR • COMPARTILHAR',-10.855,1.9,-17,Math.PI/2,1.25,.9);
  // Reuse the sign atlas for original educational content; all measurements are game coordinates.
  for (const room of floor.rooms) {
    if (!['class','library'].includes(room.type)) continue;
    const wall = floor.colliders.find(c=>c.kind==='wall' && c.minX<=room.x && c.maxX>=room.x && Math.abs((c.minZ+c.maxZ)/2-room.z2)<.15);
    if (!wall) continue;
    const z=wall.minZ-.02;
    if(room.type==='class') {
      sign('HOJE: OBSERVAR • CRIAR\nIDEIAS + CUIDADO = DESCOBERTAS',room.x,1.09,room.z2-.408,Math.PI,4.25,.64);
      Object.assign(signs.at(-1),{roomId:room.id,kind:'lesson',background:'#173C2E',foreground:'#FFF4D5'});
      // A solid backing connects the inherited board to its actual wall.
      box('board-mount',[room.x,1.09,(room.z2-.30+wall.minZ)/2],[4.5,.78,wall.minZ-(room.z2-.30)],'#7A5A3D','wood');
      sign('NOSSA TURMA\nLER • OUVIR • COMPARTILHAR\nPROJETO: ESCOLA VIVA',room.x-3.05,1.95,z,Math.PI,1.25,1.1);
      Object.assign(signs.at(-1),{roomId:room.id,kind:'mural'});
      sign('AGENDA\nSEG  TER  QUA  QUI  SEX\nLEITURA  •  CRIAÇÃO',room.x+3.1,1.95,z,Math.PI,1.15,.8);
      Object.assign(signs.at(-1),{roomId:room.id,kind:'calendar'});
      sign('GEOGRAFIA',room.x-1.65,2.4,z,Math.PI,1.25,.65);
      Object.assign(signs.at(-1),{roomId:room.id,kind:'map'});
      const back=floor.colliders.find(c=>c.kind==='wall' && c.minX<=room.x && c.maxX>=room.x && Math.abs((c.minZ+c.maxZ)/2-room.z1)<.15);
      if(back){
        sign('TRABALHOS DA TURMA\nOBSERVAR  •  DESENHAR  •  EXPERIMENTAR',room.x,1.95,back.maxZ+.02,0,2.6,.85);
        Object.assign(signs.at(-1),{roomId:room.id,kind:'mural',background:'#F4F4F1'});
      }
    }else{
      sign('BIBLIOTECA\nLER É DESCOBRIR\nCONSULTE • CUIDE • DEVOLVA',room.x,2.0,z,Math.PI,2.8,.8);
      Object.assign(signs.at(-1),{roomId:room.id,kind:'library'});
      const back=floor.colliders.find(c=>c.kind==='wall' && c.minX<=room.x && c.maxX>=room.x && Math.abs((c.minZ+c.maxZ)/2-room.z1)<.15);
      if(back){sign('CANTINHO DA LEITURA\nHISTÓRIAS ABREM CAMINHOS',room.x,2.0,back.maxZ+.02,0,2.8,.85);Object.assign(signs.at(-1),{roomId:room.id,kind:'mural'});}
    }
    sign('12\n9    •    3\n6',room.x,2.55,z,Math.PI,.38,.38);
    Object.assign(signs.at(-1),{roomId:room.id,kind:'clock'});
  }
  const environmentCopy={
    teachers:'SALA DOS PROFESSORES\nPLANEJAR • TROCAR • ENSINAR',
    reception:'RECEPÇÃO\nINFORMAÇÕES • ACOLHIMENTO',
    secretaria:'SECRETARIA\nATENDIMENTO • ORGANIZAÇÃO',
    office:'DIREÇÃO\nESCUTA • DIÁLOGO • CUIDADO',
    coord:'COORDENAÇÃO\nAPRENDER EM CONJUNTO',
    science:'CIÊNCIAS\nOBSERVAR • REGISTRAR • COMPARAR',
    lab:'LABORATÓRIO\nOBSERVAÇÃO • MÉTODO • DESCOBERTA',
  };
  for(const room of floor.rooms){
    if(room.type==='cinema'){
      sign('CINE ESCOLA\nHISTÓRIAS EM MOVIMENTO',room.x,1.09,room.z2-.408,Math.PI,4.25,.64);
      Object.assign(signs.at(-1),{roomId:room.id,kind:'lesson',background:'#141824',foreground:'#FFF4D5'});
    }
    const copy=environmentCopy[room.type];if(!copy)continue;
    const wall=floor.colliders.find(c=>c.kind==='wall'&&c.minX<=room.x&&c.maxX>=room.x&&Math.abs((c.minZ+c.maxZ)/2-room.z1)<.15);
    if(wall){sign(copy,room.x,1.95,wall.maxZ+.02,0,Math.min(2.8,room.x2-room.x1-.6),.85);Object.assign(signs.at(-1),{roomId:room.id,kind:'mural'});}
  }
  if(floor.index<2)for(const side of [-1,1]) {
    // Use only continuous wall sections, never the door or stair opening.
    const walls=floor.colliders.filter(c=>c.kind==='wall' && c.minY===floor.baseY && Math.abs((c.minX+c.maxX)/2-side*2)<.01 && c.maxZ-c.minZ>2.5);
    for(const [i,wall] of walls.entries()) {
      const z=(wall.minZ+wall.maxZ)/2, x=side*(Math.min(Math.abs(wall.minX),Math.abs(wall.maxX))-.025);
      sign(i%2?'VIDA NA ESCOLA\nLEITURA • CIÊNCIA • ARTE':'NOSSOS PROJETOS\nCRIAR JUNTOS',x,1.9,z,-side*Math.PI/2,Math.min(1.7,wall.maxZ-wall.minZ-.4),.65);
      Object.assign(signs.at(-1),{kind:'corridor',background:i%2?'#2F5D9A':'#F4F4F1',foreground:i%2?'#FFFFFF':'#2F5D9A'});
      // Shallow wall-mounted drinking fountain, wholly inside the existing collision margin.
      if(i===1){
        box('wall-planter',[side*1.74,1.15,z],[.28,.25,.60],'#7A5A3D','wood');
        for(const dz of [-.18,0,.18])box('planter-leaf',[side*1.74,1.40,z+dz],[.14,.30,.12],'#39715A');
      }
      if(i===0){
        box('water-fountain',[side*1.74,.85,z],[.28,.65,.52],'#F4F4F1');
        box('fountain-basin',[side*1.71,1.19,z],[.30,.035,.48],'#5B616B','metal');
        box('fountain-tap',[side*1.78,1.25,z+.13],[.06,.12,.055],'#5B616B','metal');
      }
    }
  }
  for(const stair of floor.stairs || []) {
    // Offset from interaction/arrival centers, readable horizontal landing marker.
    sign(`${stair.destination+1}º ANDAR  →`,stair.x+1.15,.033,stair.z, -Math.PI/2,1.1,.55);
    signs[signs.length-1].floor = true;
  }
  for(const [material, geometries] of batches) {
    const geometry=mergeGeometries(geometries,false); geometries.forEach(g=>g.dispose()); owned.push(geometry);
    const mesh=new THREE.Mesh(geometry,material); mesh.name='architecture-batch'; mesh.castShadow=material.userData.colorbeatKind!=='glass'; mesh.receiveShadow=true; group.add(mesh);
  }
  // Variable-height rows preserve each panel's aspect ratio; one compact atlas per floor.
  const atlasWidth=256;let usedHeight=0;
  for(const s of signs){s.atlasY=usedHeight;s.atlasWidth=s.kind==='clock'?64:s.kind&&s.kind!=='lesson'?128:atlasWidth;s.atlasHeight=Math.max(32,Math.ceil(s.atlasWidth*s.height/s.width));usedHeight+=s.atlasHeight;}
  const atlasHeight=THREE.MathUtils.ceilPowerOfTwo(Math.max(32,usedHeight));
  stats.atlas={width:atlasWidth,height:atlasHeight};
  let texture, signMaterial;
  if (typeof document !== 'undefined') {
    const canvas=document.createElement('canvas');canvas.width=atlasWidth;canvas.height=atlasHeight;
    const context=canvas.getContext('2d');
    if(context) {
      texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
      texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;
      const paint=()=>{if(disposed)return;context.clearRect(0,0,atlasWidth,atlasHeight);signs.forEach(s=>{
        const y=s.atlasY,h=s.atlasHeight,width=s.atlasWidth,lines=s.text.split('\n');
        context.fillStyle=s.background||(s.floor?'#2F5D9A':'#F4F4F1');context.fillRect(0,y,width,h);
        if(['mural','calendar','corridor','map'].includes(s.kind)){
          context.strokeStyle='#E2B947';context.lineWidth=5;context.strokeRect(3,y+3,width-6,h-6);
        }
        if(s.kind==='clock'){
          const cx=width/2,cy=y+h/2,r=Math.min(width,h)*.43;
          context.fillStyle='#F4F4F1';context.beginPath();context.arc(cx,cy,r,0,Math.PI*2);context.fill();
          context.strokeStyle='#141824';context.lineWidth=5;context.stroke();
          for(let i=0;i<12;i++){const a=i*Math.PI/6;context.beginPath();context.moveTo(cx+Math.sin(a)*r*.85,cy-Math.cos(a)*r*.85);context.lineTo(cx+Math.sin(a)*r*.96,cy-Math.cos(a)*r*.96);context.stroke();}
          context.beginPath();context.moveTo(cx-r*.45,cy-r*.25);context.lineTo(cx,cy);context.lineTo(cx+r*.18,cy-r*.65);context.stroke();return;
        }
        if(s.kind==='map'){
          context.fillStyle='#A9CED5';context.fillRect(14,y+h*.32,width-28,h*.57);
          context.fillStyle='#2F5D9A';
          // Original schematic land shapes; a classroom diagram, not a geographic survey.
          for(const poly of [[[.15,.4],[.32,.38],[.42,.55],[.3,.76]],[[.52,.4],[.76,.38],[.87,.55],[.7,.63],[.62,.82]]]){
            context.beginPath();poly.forEach(([x,v],i)=>i?context.lineTo(x*width,y+v*h):context.moveTo(x*width,y+v*h));context.closePath();context.fill();
          }
        }
        context.fillStyle=s.foreground||(s.floor?'#FFFFFF':'#2F5D9A');
        context.font=`bold ${Math.min(24,Math.floor((h-8)/lines.length*.7))}px "Barlow Condensed", "Atkinson Hyperlegible", sans-serif`;
        context.textAlign='center';context.textBaseline='middle';
        lines.forEach((line,i)=>context.fillText(line,width/2,s.kind==='map'?y+h*.17:y+(i+.5)*h/lines.length,width-16));
      });texture.needsUpdate=true;};
      paint(); document.fonts?.ready.then(paint);
    }
  }
  signMaterial=new THREE.MeshBasicMaterial({map:texture||null,color:texture?'#FFFFFF':'#2F5D9A',side:THREE.FrontSide});
  const signGeometries=signs.map(s=>{
    const g=new THREE.PlaneGeometry(s.width,s.height),uv=g.attributes.uv;
    for(let j=0;j<uv.count;j++){uv.setX(j,(1+uv.getX(j)*(s.atlasWidth-2))/atlasWidth);uv.setY(j,1-(s.atlasY+1+(1-uv.getY(j))*(s.atlasHeight-2))/atlasHeight);}
    if(s.floor)g.rotateX(-Math.PI/2);else g.rotateY(s.rotation);
    g.translate(s.x,s.y,s.z);return g;
  });
  if(signGeometries.length){const geometry=mergeGeometries(signGeometries,false);signGeometries.forEach(g=>g.dispose());owned.push(geometry);const mesh=new THREE.Mesh(geometry,signMaterial);mesh.name='school-sign-atlas';group.add(mesh);}
  stats.signs=signs.length;
  // Only select long wall silhouettes, never outline every furnishing triangle.
  const edgeGeometries=[];
  for(const c of floor.colliders.filter(c=>c.kind==='wall' && (c.maxX-c.minX>5 || c.maxZ-c.minZ>5))) {
    const g=new THREE.BoxGeometry(c.maxX-c.minX,c.maxY-c.minY,c.maxZ-c.minZ);
    g.translate((c.minX+c.maxX)/2,(c.minY+c.maxY)/2-floor.baseY,(c.minZ+c.maxZ)/2);
    const e=new THREE.EdgesGeometry(g);g.dispose();edgeGeometries.push(e);
  }
  const edgeMaterial=new THREE.LineBasicMaterial({color:COLORBEAT_STYLE.ink,transparent:true,opacity:COLORBEAT_STYLE.environmentInkOpacity});
  let edges;
  if(edgeGeometries.length){const geometry=mergeGeometries(edgeGeometries,false);edgeGeometries.forEach(g=>g.dispose());owned.push(geometry);edges=new THREE.LineSegments(geometry,edgeMaterial);edges.name='selective-wall-edges';group.add(edges);}
  // Kept separate so inspection reveals rooms without changing static batches.
  const ceiling = new THREE.Mesh(resources.geometry('box'), materials.get('#F4F4F1', 'plain'));
  ceiling.name = 'school-ceiling'; ceiling.position.set(0,3.45,0); ceiling.scale.set(22,.1,38);
  ceiling.castShadow = ceiling.receiveShadow = true; group.add(ceiling);
  const capGeometries=[];
  for(const wall of floor.colliders.filter(c=>c.kind==='wall')) {
    const minY=floor.baseY+3.05, maxY=floor.baseY+3.4;
    const cap={minX:wall.minX,maxX:wall.maxX,minZ:wall.minZ,maxZ:wall.maxZ,minY,maxY,kind:'architecture-detail'};
    colliders.push(cap);
    const geometry=resources.geometry('box').clone();
    geometry.applyMatrix4(new THREE.Matrix4().compose(
      new THREE.Vector3((cap.minX+cap.maxX)/2,3.225,(cap.minZ+cap.maxZ)/2),
      new THREE.Quaternion(),new THREE.Vector3(cap.maxX-cap.minX,.35,cap.maxZ-cap.minZ)));
    capGeometries.push(geometry);
  }
  let caps;
  if(capGeometries.length){
    const geometry=mergeGeometries(capGeometries,false);capGeometries.forEach(g=>g.dispose());owned.push(geometry);
    caps=new THREE.Mesh(geometry,materials.get('#F4F4F1','plain'));caps.name='school-wall-caps';caps.castShadow=true;caps.receiveShadow=true;group.add(caps);
  }
  function setInspection(inspecting) { ceiling.visible = !inspecting; if(caps)caps.visible=!inspecting; }
  stats.draws=group.children.length;
  function updateQuality(quality){if(edges)edges.visible=quality!=='low';}
  return {group,colliders,stats,updateQuality,setInspection,dispose(){if(disposed)return;disposed=true;owned.forEach(g=>g.dispose());texture?.dispose();signMaterial.dispose();edgeMaterial.dispose();group.clear();}};
}
