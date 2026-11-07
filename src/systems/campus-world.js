import * as THREE from 'three';
import { batchMeshes } from './batching.js';
export function createCampusWorld(scene, world) {
  const group = new THREE.Group(); scene.add(group); const resources = world.resources, owned = [], dynamic = new Set(), objects = [], fans = [];
  function mesh(kind, color, scale, x, y, z, texture = 'plain') { const m = resources.mesh(kind, color, scale, texture); m.position.set(x, y, z); group.add(m); return m; }
  function box(x, y, z, w, h, d, color, solid = false, texture = 'plain', seatFor = '') {
    const m = mesh('box', color, [w, h, d], x, y, z, texture);
    if (solid) { const b = { minX: x - w / 2, maxX: x + w / 2, minY: y - h / 2, maxY: y + h / 2, minZ: z - d / 2, maxZ: z + d / 2, seatFor }; world.solids.push(b); world.occluders.push(b); } return m;
  }
  // Open canteen, reachable behind the existing wings through the central corridor.
  box(0, .04, -22, 10, .08, 7, '#c9c1ad', false, 'tile');
  box(0, 3.6, -22, 10.5, .18, 7.4, '#64766b');
  for (const x of [-4.7, 4.7]) box(x, 1.8, -24.7, .25, 3.6, .25, '#eadfc8', true);
  box(0, .65, -24.5, 8, 1.3, .9, '#557b73', true, 'tile'); box(0, 1.35, -24.5, 8.3, .15, 1.1, '#eadfc8');
  for (let i = 0; i < 6; i++) { mesh('sphere', ['#b69059', '#ca8d63', '#b0a16d'][i % 3], [.13, .12, .13], -2 + i * .55, 1.6, -24.4); }
  world.sign('CANTINA · PAUSA PARA O RECREIO', 0, 3.1, -24.6, 6);
  for (const x of [-3, 3]) { box(x, .8, -20, 1.8, .14, 1, '#bc9a63', true, 'wood'); for (const dx of [-.6, .6]) box(x + dx, .4, -20, .08, .8, .08, '#586b68'); }
  // A compact court fits west of the school without expanding traversal bounds.
  box(-33, .02, 4, 8, .04, 10, '#657e77');
  for (const x of [-36.8, -29.2]) box(x, .05, 4, .07, .02, 9.6, '#eee8db');
  for (const z of [-.8, 4, 8.8]) box(-33, .05, z, 7.6, .02, .07, '#eee8db');
  const circle = new THREE.Mesh(new THREE.TorusGeometry(1.2, .025, 4, 28), resources.material('#eee8db')); circle.rotation.x = Math.PI / 2; circle.position.set(-33, .07, 4); group.add(circle); owned.push(circle.geometry);
  box(-33, 1.5, -.65, .12, 3, .12, '#586b68', true); box(-33, 2.8, -.4, 1.7, 1, .12, '#eadfc8');
  world.sign('QUADRA · JOGUE JUNTO', -33, 2.3, 10, 4);
  // Seating anchors can be occupied by their NPC; other actors/player avoid the seat.
  box(19, .47, -15, 1.9, .14, .7, '#a58a5b', true, 'wood', 'bia'); box(19, .85, -15.3, 1.9, .7, .1, '#a58a5b');
  box(20, .47, -14, .7, .14, .7, '#62867a', true, 'plain', 'maria'); box(20, .85, -14.3, .7, .7, .1, '#62867a');
  // Lockers, classroom objects, fans and hallway details share cached materials.
  for (const x of [-25, -24.2, -23.4, -22.6]) { box(x, 1.05, -3, .7, 2.1, .5, '#7e9690', true); box(x + .22, 1.05, -2.72, .04, .16, .04, '#eadfc8'); }
  for (const x of [-26, 26]) {
    box(x, 2.3, -16.5, 1.1, .8, .1, '#eadfc8');
    const fan = new THREE.Group(); fan.position.set(x, 3.8, -16.3); group.add(fan); fans.push(fan);
    for (let i = 0; i < 3; i++) { const blade = resources.mesh('box', '#8eaaa7', [.65, .08, .06]); blade.rotation.z = i * Math.PI / 3; fan.add(blade); }
  }
  world.sign('CLUBE DE CIÊNCIAS · PERGUNTE À HELENA', -20, 2.5, -16.45, 4);
  world.sign('RECADOS · O RECREIO TAMBÉM É APRENDIZADO', 7, 2.3, -2.5, 4);
  const clockFace = mesh('cylinder', '#eee8db', [.42, .05, .42], 0, 2.7, -24.3); clockFace.rotation.x = Math.PI / 2;
  const clock = box(0, 2.7, -24.22, .025, .35, .025, '#31564a'); dynamic.add(clock);
  const ambient = new THREE.PointLight('#fff0ce', 8, 11); ambient.position.set(0, 2.8, -22); group.add(ambient);
  const addObject = (id, name, x, z, color, kind = 'campus') => {
    const m = box(x, .95, z, .42, .13, .55, color); dynamic.add(m);
    const o = { id, name, x, z, kind, mesh: m }; objects.push(o); return o;
  };
  const lostBook = addObject('lost-book', 'Livro de Bia', 21, -15, '#a88b76');
  const score = addObject('familiar-music', 'Partitura do ensaio', 31, -12, '#eadfc8');
  addObject('canteen', 'Cardápio da cantina', 0, -23, '#bc9a63');
  addObject('note', 'Bilhete no corredor', -22, -2, '#eadfc8');
  const ballMesh = mesh('sphere', '#bc9a63', [.24, .24, .24], -33, .27, 5); dynamic.add(ballMesh);
  const ball = { id: 'ball', name: 'Bola da quadra', x: -33, z: 5, kind: 'campus', mesh: ballMesh, vx: 0, vz: 0 }; objects.push(ball);
  const flowers = new THREE.InstancedMesh(resources.geometry('leaf'), resources.material('#bca573'), 42), transform = new THREE.Object3D();
  for (let i = 0; i < 42; i++) { const side = i % 2 ? -1 : 1; transform.position.set(side * (8.5 + (i % 3) * 1.2), .95, 3.4 + (i % 7) * .5); transform.scale.set(.09, .14, .09); transform.updateMatrix(); flowers.setMatrixAt(i, transform.matrix); flowers.setColorAt(i, new THREE.Color(['#d4a78b', '#d2c884', '#b4a9c5'][i % 3])); } group.add(flowers);
  batchMeshes(group, group.children.filter(m => m.isMesh && !dynamic.has(m) && m !== flowers), owned);
  function update(dt, time, living, quality) {
    lostBook.mesh.visible = living.events['lost-book'] === 'active'; score.mesh.visible = living.events['familiar-music'] === 'active';
    for (const fan of fans) fan.rotation.z += dt * (quality === 'low' ? 1 : 2.5);
    clock.visible = quality !== 'low'; clock.rotation.z = -time / 60; ambient.intensity = quality === 'low' ? 4 : 8;
    ball.x = THREE.MathUtils.clamp(ball.x + ball.vx * dt, -36.4, -29.6); ball.z = THREE.MathUtils.clamp(ball.z + ball.vz * dt, -.1, 8.4);
    ball.vx *= Math.exp(-dt * 1.6); ball.vz *= Math.exp(-dt * 1.6); ball.mesh.position.set(ball.x, .27, ball.z); ball.mesh.rotation.x += ball.vz * dt * 2; ball.mesh.rotation.z -= ball.vx * dt * 2;
  }
  function kick(player) { const length = Math.hypot(ball.x - player.x, ball.z - player.z); ball.vx = length > .01 ? (ball.x - player.x) / length * 4 : 2; ball.vz = length > .01 ? (ball.z - player.z) / length * 4 : 1; }
  return { objects, update, kick, dispose() { group.removeFromParent(); owned.forEach(g => g.dispose()); flowers.dispose(); } };
}
