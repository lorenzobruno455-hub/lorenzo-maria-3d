import * as THREE from 'three';
import { Resources } from './resources.js';
import { ITEMS } from './progress.js';
import { batchMeshes } from './batching.js';
import { segmentHit } from './physics.js';

export function createWorld(scene) {
  const resources = new Resources(), solids = [], occluders = [], roofs = [], doors = [], signs = [], water = [];
  const box3 = new THREE.Box3();
  function collider(mesh, collision, camera = collision) {
    mesh.updateMatrixWorld(true); box3.setFromObject(mesh);
    const b = { minX: box3.min.x, maxX: box3.max.x, minY: box3.min.y, maxY: box3.max.y, minZ: box3.min.z, maxZ: box3.max.z, enabled: true };
    if (collision) solids.push(b); if (camera) occluders.push(b); return b;
  }
  function box(x, y, z, w, h, d, color, collision = false, texture = 'plain', camera = collision) {
    const mesh = resources.mesh('box', color, [w, h, d], texture); mesh.position.set(x, y, z); scene.add(mesh); collider(mesh, collision, camera); return mesh;
  }
  function cylinder(x, y, z, r, h, color) { const m = resources.mesh('cylinder', color, [r, h, r]); m.position.set(x, y, z); scene.add(m); return m; }
  function sphere(x, y, z, r, color) { const m = resources.mesh('sphere', color, [r, r, r]); m.position.set(x, y, z); scene.add(m); return m; }
  function sign(text, x, y, z, width = 5) {
    const c = document.createElement('canvas'); c.width = 768; c.height = 128;
    const ctx = c.getContext('2d'); ctx.fillStyle = '#234c42'; ctx.fillRect(0, 0, 768, 128); ctx.strokeStyle = '#d7ba80'; ctx.strokeRect(9, 9, 750, 110);
    ctx.fillStyle = '#fff4d7'; ctx.font = '500 31px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(text, 384, 77, 720);
    const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({ map, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(resources.geometry('box'), material); mesh.scale.set(width, width / 6, .04); mesh.position.set(x, y, z); scene.add(mesh); signs.push({ mesh, map }); return mesh;
  }
  box(0, -.22, 0, 82, .4, 70, '#9cae7d', false, 'plaster');
  box(0, .005, 7, 12, .04, 46, '#c9c1ad', false, 'tile'); box(0, .025, 0, 58, .04, 12, '#c9c1ad', false, 'tile');
  function door(cx, name) {
    const pivot = new THREE.Group(); pivot.position.set(cx - 1.5, 0, -6); scene.add(pivot);
    const panel = resources.mesh('box', '#8b6f50', [3, 3.3, .16], 'wood'); panel.position.set(1.5, 1.65, 0); pivot.add(panel);
    const glass = resources.mesh('box', '#8eaaa7', [.8, .8, .18], 'glass'); glass.position.set(1.5, 2.2, 0); pivot.add(glass);
    const handle = resources.mesh('sphere', '#b9b79b', [.07, .07, .12], 'metal'); handle.position.set(2.65, 1.3, .14); pivot.add(handle);
    const bounds = collider(panel, true, true);
    const d = { id: doors.length, name, x: cx, z: -5.5, pivot, panel, bounds, open: false, angle: 0 };
    doors.push(d); return d;
  }
  function wing(cx, label) {
    box(cx, 2.5, -17, 22, 5, .5, '#eadfc8', true, 'plaster');
    box(cx - 6.25, 2.5, -6, 9.5, 5, .5, '#eadfc8', true, 'plaster'); box(cx + 6.25, 2.5, -6, 9.5, 5, .5, '#eadfc8', true, 'plaster');
    box(cx, 4.25, -6, 3, 1.5, .5, '#eadfc8', false, 'plaster', true);
    for (const x of [cx - 11, cx + 11]) box(x, 2.5, -11.5, .5, 5, 11, '#eadfc8', true, 'plaster');
    box(cx, .06, -11.5, 22, .12, 11, '#b8b0a0', false, 'tile');
    for (let x = -8; x <= 8; x += 4) {
      box(cx + x, 2.7, -16.7, 2.4, 2, .08, '#81a4a5', false, 'glass');
      box(cx + x, 2.7, -16.6, .08, 2, .1, '#f1eee2'); box(cx + x, 2.7, -16.6, 2.4, .06, .1, '#f1eee2');
    }
    const roof = box(cx, 5.2, -11.5, 23, .4, 12, '#64766b', false, 'plain', true);
    roofs.push({ mesh: roof, cx, bounds: occluders.at(-1) });
    box(cx, 3.65, -4.6, 23, .2, 3, '#a1a893', false, 'plain', true);
    for (const x of [cx - 10.5, cx + 10.5]) box(x, 1.75, -3.5, .3, 3.5, .3, '#e6ddc7', true);
    for (const x of [cx - 6.25, cx + 6.25]) box(x, .65, -5.7, 9.5, 1.3, .12, '#557b73', false, 'tile');
    for (let x = -6; x <= 6; x += 6) for (let z = -13; z <= -9; z += 4) {
      box(cx + x, .9, z, 2.5, .15, 1.2, '#bc9a63', true, 'wood');
      for (const dx of [-1, 1]) for (const dz of [-.4, .4]) box(cx + x + dx, .45, z + dz, .07, .9, .07, '#586b68', false, 'metal');
      box(cx + x, .55, z + 1.1, 1, .15, .8, '#62867a', true); box(cx + x, .9, z + 1.45, 1, .7, .1, '#62867a');
      for (const dx of [-.4, .4]) box(cx + x + dx, .27, z + 1.1, .05, .5, .65, '#586b68');
    }
    box(cx, 2.2, -16.6, 6, 1.7, .12, '#31564a'); box(cx, 1.35, -16.4, 6.1, .08, .25, '#987953', false, 'wood');
    sign(label, cx, 4.25, -5.65); door(cx, label);
    // Indoor fill avoids black interiors without extra shadow maps.
    const fill = new THREE.PointLight('#fff2d3', 14, 12, 2); fill.position.set(cx, 3, -11); scene.add(fill);
  }
  wing(-17, 'SALA 01 · LITERATURA'); wing(17, 'BIBLIOTECA');
  for (let i = 0; i < 3; i++) {
    box(25, 1.4, -14 + i * 2, 3.8, 2.8, .5, '#7b684f', true, 'wood');
    for (let j = 0; j < 8; j++) box(23.5 + j * .42, 1.7, -13.7 + i * 2, .27, 1, .28, ['#9e6355', '#607d77', '#b6a16e'][j % 3]);
  }
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
  leaves.forEach((leaf, i) => { dummy.position.set(leaf.x, leaf.y, leaf.z); dummy.scale.set(leaf.size, leaf.size * .75, leaf.size); dummy.rotation.set(i, i * .3, 0); dummy.updateMatrix(); canopy.setMatrixAt(i, dummy.matrix); canopy.setColorAt(i, new THREE.Color().setHSL(.23 + (i % 4) * .013, .23, .36 + (i % 5) * .035)); });
  canopy.castShadow = canopy.receiveShadow = true; scene.add(canopy);
  for (const x of [-10, 10]) {
    box(x, .25, 5, 4, .5, 5, '#8b9980', true, 'plaster');
    for (let i = 0; i < 7; i++) sphere(x - 1.5 + i % 3 * 1.3, .7, 3.5 + Math.floor(i / 3) * 1.3, .55, '#79965b');
    for (let n = 0; n < 4; n++) box(x, .7, 12.6 + n * .22, 4, .12, .16, '#a58a5b', n === 1, 'wood');
    box(x, 1.2, 13.4, 4, .75, .13, '#a58a5b', false, 'wood');
    for (const dx of [-1.5, 1.5]) box(x + dx, .3, 13, .14, .6, 1, '#596b63');
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
    const mesh = box(c.x, 1, c.z, .5, .1, .65, '#ead0a0', false, 'wood');
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
    if (Math.hypot(player.x - d.x, player.z + 6) < 1.85) return false;
    d.open = !d.open; return true;
  }
  function update(dt, time, player) {
    for (const d of doors) {
      const target = d.open ? Math.PI / 2 : 0;
      const next = THREE.MathUtils.damp(d.angle, target, 9, dt), old = d.angle;
      d.angle = next; d.pivot.rotation.y = next; updateDoorBounds(d);
      const b = d.bounds;
      if (player.x > b.minX - .34 && player.x < b.maxX + .34 && player.z > b.minZ - .34 && player.z < b.maxZ + .34) {
        d.angle = old; d.pivot.rotation.y = old; updateDoorBounds(d);
      }
    }
    for (const r of roofs) {
      const inside = Math.abs(player.x - r.cx) < 11.5 && player.z < -4.7 && player.z > -17.5;
      r.mesh.visible = !inside; r.bounds.enabled = !inside;
    }
    for (const c of collectibles) {
      c.mesh.visible = c.light.visible = c.ring.visible = !c.taken;
      if (!c.taken) { c.mesh.rotation.y = time * .65; c.light.position.y = 1.6 + Math.sin(time * 2) * .12; }
    }
    water.forEach((m, i) => m.position.y = 1.45 + Math.sin(time * 3 + i) * .15);
  }
  function lineOfSight(a, b) {
    return !occluders.some(o => o.enabled !== false && segmentHit({ x: a.x, y: 1.5, z: a.z }, { x: b.x, y: 1.5, z: b.z }, o) !== null);
  }
  const batched = [];
  const dynamic = new Set([...water, ...roofs.map(r => r.mesh), ...signs.map(s => s.mesh), ...collectibles.flatMap(c => [c.mesh, c.light, c.ring]), canopy]);
  batchMeshes(scene, scene.children.filter(m => m.isMesh && !dynamic.has(m)), batched);
  return { resources, solids, occluders, doors, collectibles, points, update, sign, toggleDoor, lineOfSight,
    restoreDoors(states) { doors.forEach((d, i) => { d.open = !!states[i]; d.angle = d.open ? Math.PI / 2 : 0; d.pivot.rotation.y = d.angle; updateDoorBounds(d); }); },
    dispose() { signs.forEach(({ mesh, map }) => { map.dispose(); mesh.material.dispose(); }); collectibles.forEach(c => { c.ring.geometry.dispose(); c.ring.material.dispose(); }); canopy.dispose(); batched.forEach(g => g.dispose()); resources.dispose(); },
  };
}
