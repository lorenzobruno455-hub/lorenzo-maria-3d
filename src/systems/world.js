import {environmentFinish} from './colorbeat-materials.js';
import { createClassroomDetails } from './classroom.js';
import * as THREE from 'three';
import { PropLibrary } from './prop-library.js';
import { placeOn, surface, groundHeight } from './prop-placement.js';
import { Resources } from './resources.js';
import { ITEMS } from './progress.js';
import { batchMeshes } from './batching.js';
import { segmentHit } from './physics.js';

export function createWorld(scene) {
  const resources = new Resources(), solids = [], occluders = [], roofs = [], doors = [], signs = [], water = [], interiorLights = [];
  let disposed=false;
  const box3 = new THREE.Box3();
  const library = new PropLibrary(resources), placed = [], surfaces = [];
  const support = (id,x,z,w,d,h) => {const s=surface(id,x,z,w,d,h);surfaces.push(s);return s;};
  const prop=(id,s,options={})=>{const p=library.place(scene,id,s,options);placed.push(p);return p;};
  function collider(mesh, collision, camera = collision) {
    mesh.updateMatrixWorld(true); box3.setFromObject(mesh);
    const b = { minX: box3.min.x, maxX: box3.max.x, minY: box3.min.y, maxY: box3.max.y, minZ: box3.min.z, maxZ: box3.max.z, enabled: true };
    if (collision) solids.push(b); if (camera) occluders.push(b); return b;
  }
  function box(x, y, z, w, h, d, color, collision = false, texture = 'plain', camera = collision) {
    const mesh = resources.mesh('box', color, [w, h, d], environmentFinish(color,texture)); mesh.position.set(x, y, z); scene.add(mesh); collider(mesh, collision, camera); return mesh;
  }
  function cylinder(x, y, z, r, h, color) { const m = resources.mesh('cylinder', color, [r, h, r]); m.position.set(x, y, z); scene.add(m); return m; }
  function sphere(x, y, z, r, color) { const m = resources.mesh('sphere', color, [r, r, r]); m.position.set(x, y, z); scene.add(m); return m; }
  function sign(text, x, y, z, width = 5) {
    const c = document.createElement('canvas'); c.width = 768; c.height = 128;
    const ctx = c.getContext('2d');
    const draw=()=>{ctx.fillStyle='#202b43';ctx.fillRect(0,0,768,128);ctx.strokeStyle='#ffd43b';ctx.lineWidth=3;ctx.strokeRect(9,9,750,110);ctx.fillStyle='#fff5dc';ctx.font='700 38px "Barlow Condensed",sans-serif';ctx.textAlign='center';ctx.fillText(text,384,78,720);};draw();
    const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace;
    document.fonts?.ready.then(()=>{if(!disposed){draw();map.needsUpdate=true;}});
    const material = new THREE.MeshBasicMaterial({ map, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(resources.geometry('box'), material); mesh.scale.set(width, width / 6, .04); mesh.position.set(x, y, z); scene.add(mesh); if(z>10||text.startsWith('RECADOS')){for(const dx of [-width*.38,width*.38])box(x+dx,y/2,z,.06,y,.06,'#586b68');} signs.push({ mesh, map }); return mesh;
  }
  box(0, -.22, 0, 82, .4, 70, '#9cae7d', false, 'plaster');
  box(0, .005, 7, 12, .04, 46, '#c9c1ad', false, 'tile'); box(0, .025, 0, 58, .04, 12, '#c9c1ad', false, 'tile');
  function door(cx, name, { z=-6, width=3, height=3.3, transient=false }={}) {
    const pivot = new THREE.Group(); pivot.position.set(cx - width/2, 0, z); scene.add(pivot);
    const panel = resources.mesh('box', '#8b6f50', [width, height, .16], 'wood'); panel.position.set(width/2, height/2, 0); pivot.add(panel);
    const glass = resources.mesh('box', '#8eaaa7', [.8, .8, .18], 'glass'); glass.position.set(width/2, height*2/3, 0); pivot.add(glass);
    const handle = resources.mesh('sphere', '#b9b79b', [.07, .07, .12], 'metal'); handle.position.set(width-.35, height*1.3/3.3, .14); pivot.add(handle);
    const bounds = collider(panel, true, true);
    const d = { id: doors.length, name, x: cx, z:z+.5, hingeZ:z, width, transient, pivot, panel, bounds, open: false, angle: 0 };
    doors.push(d); return d;
  }
  function wing(cx, label) {
    box(cx,.7,-17,22,1.4,.5,'#eadfc8',true,'plaster'); box(cx,4.35,-17,22,1.3,.5,'#eadfc8',true,'plaster');
    for(const dx of [-10.5,-6,-2,2,6,10.5]) box(cx+dx,2.55,-17,dx===-10.5||dx===10.5?1:1.6,2.3,.5,'#eadfc8',true,'plaster');
    box(cx - 6.25, 2.5, -6, 9.5, 5, .5, '#eadfc8', true, 'plaster'); box(cx + 6.25, 2.5, -6, 9.5, 5, .5, '#eadfc8', true, 'plaster');
    box(cx, 4.25, -6, 3, 1.5, .5, '#eadfc8', false, 'plaster', true);
    for (const x of [cx - 11, cx + 11]) box(x, 2.5, -11.5, .5, 5, 11, '#eadfc8', true, 'plaster');
    box(cx, .06, -11.5, 22, .12, 11, '#b8b0a0', false, 'tile');
    for (let x = -8; x <= 8; x += 4) {
      box(cx + x, 2.7, -16.7, 2.4, 2.3, .05, '#81a4a5', false, 'glass');
      box(cx + x, 2.7, -16.6, .08, 2, .1, '#f1eee2'); box(cx + x, 2.7, -16.6, 2.4, .06, .1, '#f1eee2');
    }
    const roof = box(cx, 5.2, -11.5, 23, .4, 12, '#64766b', false, 'plain', true);
    roofs.push({ mesh: roof, cx, bounds: occluders.at(-1) });
    box(cx, 3.65, -4.6, 23, .2, 3, '#a1a893', false, 'plain', true);
    for (const x of [cx - 10.5, cx + 10.5]) box(x, 1.75, -3.5, .3, 3.5, .3, '#e6ddc7', true);
    for (const x of [cx - 6.25, cx + 6.25]) box(x, .65, -5.7, 9.5, 1.3, .12, '#557b73', false, 'tile');
    for (let x = -6; x <= 6; x += 6) for (let z = -13; z <= -9; z += 4) {
      const desk=prop('desk',support(`desk-${cx+x}-${z}`,cx+x,z,2.5,1.2,.12),cx<0?{yaw:Math.PI/2}:{});
      library.collider(desk,{solids,occluders});
      const top=library.tableSurface(desk);surfaces.push(top);
      const chair=prop('chair',support(`chair-${cx+x}-${z}`,cx+x+(cx<0?1.1:0),z+(cx<0?0:1.1),.54,.58,.12),{yaw:cx<0?Math.PI/2:0});
      library.collider(chair,{solids,occluders});
      if(cx<0){prop('book',top,{x:cx+x,z:z-.4,color:'#6b8179'});prop('letter',top,{x:cx+x,z:z+.4});}
      else {prop('lamp',top,{x:cx+x-.8,z});prop('book',top,{x:cx+x+.4,z,color:'#836457'});}
    }
    if(cx<0){ /* Teaching board now sits on the solid western wall. */ }
    else sign('LEITURA · ESTUDO · MEMÓRIAS',cx,3.9,-16.6,5);
    sign(label, cx, 4.25, -5.65); door(cx, label);
    // Indoor fill avoids black interiors without extra shadow maps.
    const fill = new THREE.PointLight('#fff2d3', 14, 12, 2); fill.position.set(cx, 3, -11); scene.add(fill); interiorLights.push(fill);
  }
  wing(-17, 'SALA 01 · LITERATURA'); wing(17, 'BIBLIOTECA');
  for(let i=0;i<3;i++){const shelf=prop('shelf',support(`shelf-${i}`,25,-14+i*2,3.8,.5,.12));library.collider(shelf,{solids,occluders});}
  // Teacher's table, school supplies and a wall clock use the same metric props.
  const teacher=prop('desk',support('teacher-floor',-25,-15,2.5,1.2,.12));library.collider(teacher,{solids,occluders});
  prop('book',library.tableSurface(teacher),{x:-25,z:-15,color:'#836457'});
  const clock=cylinder(-12,3.55,-16.57,.3,.06,'#eee8db');clock.rotation.x=Math.PI/2;
  box(-12,3.62,-16.52,.025,.2,.025,'#31564a');box(-11.94,3.55,-16.52,.14,.025,.025,'#31564a');
  cylinder(0, .3, 4, 3.2, .6, '#b8b19b'); cylinder(0, .64, 4, 2.8, .1, '#82b4b0'); cylinder(0, 1.2, 4, .5, 1.2, '#c9c5b4'); cylinder(0, 1.8, 4, 1.3, .18, '#c9c5b4');
  solids.push({ minX: -3.25, maxX: 3.25, minZ: .75, maxZ: 7.25, minY: 0, maxY: 1.8 });
  occluders.push(solids.at(-1));
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; water.push(sphere(Math.cos(a) * .8, 1.6, 4 + Math.sin(a) * .8, .06, '#c9e4df')); }
  const leaves = [];
  for (const x of [-32, -10, 10, 32]) for (const z of [13, 24]) {
    const trunk = cylinder(x, 2, z, .24, 4, '#7d6b50'); collider(trunk, true, false);
    for (const side of [-1, 1]) { const branch = cylinder(x + side * .4, 3.3, z, .1, 1.7, '#7d6b50'); branch.rotation.z = side * -.6; }
    for (let i = 0; i < 18; i++) {
      const a = i * 2.399, radial = Math.sqrt(i / 18) * 1.9;
      leaves.push({ x: x + Math.cos(a) * radial, y: 4.1 + (i % 4) * .4, z: z + Math.sin(a) * radial, size: .75 + (i % 3) * .12 });
    }
  }
  // Foliage is one instanced draw, rather than a mesh for every cluster.
  const canopy = new THREE.InstancedMesh(resources.geometry('leaf'), resources.material('#698756'), leaves.length);
  const dummy = new THREE.Object3D();
  leaves.forEach((leaf, i) => { dummy.position.set(leaf.x, leaf.y, leaf.z); dummy.scale.set(leaf.size, leaf.size * .75, leaf.size); dummy.rotation.set(i, i * .3, 0); dummy.updateMatrix(); canopy.setMatrixAt(i, dummy.matrix); canopy.setColorAt(i, new THREE.Color().setHSL(.23 + (i % 4) * .013, .52, .4 + (i % 5) * .035)); });
  canopy.userData.comicTreeCenters = [-32,-10,10,32].flatMap(x=>[13,24].map(z=>({x,y:4.5,z})));
  canopy.castShadow = canopy.receiveShadow = true; scene.add(canopy);
  for (const x of [-10, 10]) {
    box(x, .25, 5, 4, .5, 5, '#8b9980', true, 'plaster');
    for (let i = 0; i < 7; i++) sphere(x - 1.5 + i % 3 * 1.3, .7, 3.5 + Math.floor(i / 3) * 1.3, .55, '#79965b');
    for (let n = 0; n < 4; n++) box(x, .7, 12.6 + n * .22, 4, .12, .16, '#a58a5b', false, 'wood');
    box(x, 1.2, 13.4, 4, .75, .13, '#a58a5b', false, 'wood');
    for (const dx of [-1.5, 1.5]) box(x + dx, .34, 13, .14, .68, 1, '#596b63');
    solids.push({minX:x-2,maxX:x+2,minZ:12.5,maxZ:13.5,minY:0,maxY:.76});
  }
  box(0, 1.1, 30, 65, 2.2, .25, '#637b6b', true); sign('COLÉGIO AURORA', 0, 3, 29.7);
  sign('JARDIM · CUIDE DESTE ESPAÇO', 11.5, 1.8, 25, 4);
  sign('MURAL · FEIRA DE CIÊNCIAS / SEXTA-FEIRA', -24, 2.3, -5.55, 4);
  for (const x of [-30, 30]) { box(x, .7, -1, .7, 1.4, .7, '#52796d', true); box(x, 1.45, -1, .85, .12, .85, '#d0b370'); }
  const flagpole = cylinder(-31, 3.4, -4, .045, 6.8, '#aeb6ac'); flagpole.castShadow = false;
  box(-30.1, 5.7, -4, 1.8, 1.1, .035, '#497849');
  const diamond = box(-30.1, 5.7, -3.97, .65, .65, .02, '#dfc55f'); diamond.rotation.z = Math.PI / 4;
  sphere(-30.1, 5.7, -3.91, .2, '#3d647e').scale.z = .1;

  const collectibles = ITEMS.map(c => {
    const stand=prop('desk',support(`tutorial-${c.id}`,c.x,c.z,2.5,1.2,groundHeight(c.x,c.z)));
    library.collider(stand,{solids,occluders});
    const mesh=prop(c.id==='photo'?'photo':'book',library.tableSurface(stand),{x:c.x,z:c.z,color:'#b09a6c'});
    mesh.userData.inkDynamic=true;
    const light = sphere(c.x, 1.6, c.z, .1, '#ffe4a0');
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.38, .018, 5, 24), new THREE.MeshBasicMaterial({ color: '#f0c779' }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(c.x, .22, c.z); scene.add(ring);
    return { ...c, mesh, light, ring, taken: false };
  });
  const points = [
    { id: 'mural', x: -24, z: -4.5, name: 'Mural da escola', text: 'Feira de ciências na sexta-feira! Traga suas ideias e participe com a turma.' },
    { id: 'garden', x: 11.5, z: 25, name: 'Jardim do Aurora', text: 'Este jardim é cuidado pelos alunos. Um bom lugar para conversar antes da primeira aula.' },
  ];
  function updateDoorBounds(d) {
    d.pivot.updateMatrixWorld(true); box3.setFromObject(d.panel);
    Object.assign(d.bounds, { minX: box3.min.x, maxX: box3.max.x, minY: box3.min.y, maxY: box3.max.y, minZ: box3.min.z, maxZ: box3.max.z });
  }
  function toggleDoor(d, player) {
    // Prevent closing into an occupied doorway or sweeping through the player.
    if (Math.hypot(player.x - d.x, player.z - (d.hingeZ??-6)) < (d.width??3)/2+.35) return false;
    d.open = !d.open; return true;
  }
  function update(dt, time, player) {
    for (const d of doors) {
      const target = d.open ? Math.PI / 2 : 0;
      const next = THREE.MathUtils.damp(d.angle, target, 9, dt), old = d.angle;
      d.angle = next; d.pivot.rotation.y = next; updateDoorBounds(d);
      const b = d.bounds;
      if ([player, ...(api.occupants || [])].some(p => p.x > b.minX - .34 && p.x < b.maxX + .34 && p.z > b.minZ - .34 && p.z < b.maxZ + .34)) {
        d.angle = old; d.pivot.rotation.y = old; updateDoorBounds(d);
      }
    }
    for (const r of roofs) {
      const inside = Math.abs(player.x - r.cx) < 11.5 && player.z < -4.7 && player.z > -17.5;
      r.mesh.visible = !inside; r.bounds.enabled = !inside;
    }
    for (const c of collectibles) {
      c.mesh.visible = c.light.visible = c.ring.visible = !c.taken;
      c.light.visible=false; c.ring.visible=false;
    }
    for(const s of signs)s.mesh.visible=Math.hypot(s.mesh.position.x-player.x,s.mesh.position.z-player.z)<(api.quality==='low'?25:75);
    water.forEach((m, i) => m.position.y = 1.45 + Math.sin(time * 3 + i) * .15);
  }
  function lineOfSight(a, b) {
    return !occluders.some(o => o.enabled !== false && segmentHit({ x: a.x, y: 1.5, z: a.z }, { x: b.x, y: 1.5, z: b.z }, o) !== null);
  }
  const classroom = createClassroomDetails(scene,resources);
  solids.push(...classroom.colliders);occluders.push(...classroom.colliders);
  const batched = [];
  const dynamic = new Set([...water, ...roofs.map(r => r.mesh), ...signs.map(s => s.mesh), ...collectibles.flatMap(c => [c.mesh, c.light, c.ring]), canopy]);
  batchMeshes(scene, scene.children.filter(m => m.isMesh && !dynamic.has(m)), batched);
  const propMeshes=[];for(const p of placed) if(!collectibles.some(c=>c.mesh===p)){p.userData.staticBounds=new THREE.Box3().setFromObject(p).clone();p.traverse(m=>{if(m.isMesh)propMeshes.push(m);});}
  batchMeshes(scene,propMeshes,batched);
  const api = { classroom, library, placed, surfaces, support, groundHeight, interiorLights, resources, solids, occluders, doors, collectibles, points, update, sign, addDoor:door, toggleDoor, lineOfSight,
    restoreDoors(states) { doors.forEach((d, i) => { d.open = !!states[i]; d.angle = d.open ? Math.PI / 2 : 0; d.pivot.rotation.y = d.angle; updateDoorBounds(d); }); },
    dispose() { disposed=true; classroom.dispose(); signs.forEach(({ mesh, map }) => { map.dispose(); mesh.material.dispose(); }); collectibles.forEach(c => { c.ring.geometry.dispose(); c.ring.material.dispose(); }); canopy.dispose(); batched.forEach(g => g.dispose()); resources.dispose(); },
  };
  return api;
}
