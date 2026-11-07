import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Bake static meshes by material. Articulated pivots and interactive objects remain separate.
export function batchMeshes(parent, meshes, owned) {
  const groups = new Map();
  parent.updateMatrixWorld(true);
  const inverse = new THREE.Matrix4().copy(parent.matrixWorld).invert();
  for (const mesh of meshes) {
    if (Array.isArray(mesh.material)) continue;
    mesh.updateMatrixWorld(true);
    const geometry = mesh.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, mesh.matrixWorld));
    if (!groups.has(mesh.material)) groups.set(mesh.material, []);
    groups.get(mesh.material).push(geometry); mesh.removeFromParent();
  }
  for (const [material, geometries] of groups) {
    const merged = mergeGeometries(geometries, false);
    geometries.forEach(g => g.dispose());
    if (!merged) throw new Error('Geometrias estáticas incompatíveis');
    const mesh = new THREE.Mesh(merged, material); mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); owned.push(merged);
  }
}
