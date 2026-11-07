import * as THREE from 'three';
export function createStoryWorld(scene, world, memories, games) {
  const objects = [], resources = world.resources, owned = [], group = new THREE.Group(); scene.add(group);
  const place = (kind, color, scale, x, y, z, parent = group) => { const m = resources.mesh(kind, color, scale); m.position.set(x, y, z); parent.add(m); return m; };
  const addBounds = (x, y, z, w, h, d) => { const b = { minX: x - w / 2, maxX: x + w / 2, minY: y - h / 2, maxY: y + h / 2, minZ: z - d / 2, maxZ: z + d / 2 }; world.solids.push(b); world.occluders.push(b); };
  // A small open music pavilion adjoins the existing east wing.
  place('box', '#b9b3a0', [8, .1, 10], 32, .05, -11);
  place('box', '#74877b', [8.5, .2, 10], 32, 3.6, -11);
  for (const x of [28.5, 35.5]) { place('box', '#d9d2bd', [.22, 3.5, .22], x, 1.75, -7); addBounds(x, 1.75, -7, .22, 3.5, .22); }
  place('box', '#4a5350', [3, 1.1, 1], 32, .65, -14); addBounds(32, .65, -14, 3, 1.1, 1);
  for (let i = 0; i < 14; i++) place('box', i % 3 ? '#eee8db' : '#353d3b', [.16, .06, .4], 30.9 + i * .17, 1.23, -13.5);
  world.sign('SALA DE MÚSICA', 32, 3.2, -6.4, 4); world.sign('HISTÓRIA · MEMÓRIAS', -17, 3.2, -5.6, 3.6);
  world.sign('ESPAÇO DE REFLEXÃO', -24, 2.2, 21, 4);
  place('box', '#a59372', [3, .2, 1], -24, .7, 20); addBounds(-24, .7, 20, 3, .2, 1);
  const add = (kind, id, name, x, z, color) => {
    const mesh = place('box', color, [.5, .12, .65], x, 1.05, z);
    const beacon = place('sphere', '#ffe6a6', [.09, .09, .09], x, 1.7, z);
    const item = { kind, id, name, x, z, mesh, beacon }; objects.push(item); return item;
  };
  const album = add('album', 'album', 'Álbum de memórias', 20, -7, '#aa8a64');
  for (const g of games.filter(g => g.playable)) add('game', g.id, g.title, g.position.x, g.position.z, '#719a91');
  add('secret', 'moon', 'Pequena lua', -30, 19, '#ddd3a1');
  const memoryLight = new THREE.PointLight('#f0cf96', 0, 7); group.add(memoryLight);
  const memoryObjects = new Map();
  function update(campaign, time, focus) {
    const available = memories.slice(0, Math.min(6, campaign.memories.length + 1));
    for (const m of available) if (!memoryObjects.has(m.id)) memoryObjects.set(m.id, add('memory', m.id, m.title, m.position.x, m.position.z, m.rarityLevel === 3 ? '#d4b261' : '#a797bd'));
    for (const [id, object] of memoryObjects) if (!available.some(m => m.id === id)) { group.remove(object.mesh, object.beacon); objects.splice(objects.indexOf(object), 1); memoryObjects.delete(id); }
    memoryLight.intensity = focus ? 9 + Math.sin(time * 2) * 2 : 0; if (focus) memoryLight.position.set(focus.x, 2.2, focus.z);
    for (const object of objects) { object.beacon.position.y = 1.7 + Math.sin(time * 2 + object.x) * .08; if (object.kind === 'memory') object.mesh.rotation.y = Math.sin(time) * .12; }
  }
  return { objects, update, dispose() { group.removeFromParent(); owned.forEach(g => g.dispose()); }, album };
}
