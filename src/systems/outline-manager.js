import * as THREE from 'three';

/**
 * A low-cost silhouette layer for the two principal procedural characters.
 * Shells are children of the animated mesh, so they inherit all joint transforms.
 * They are visual-only: no extra colliders, shadow maps or raycast targets.
 */
export class OutlineManager {
  constructor({ color = '#141824', thickness = 1.045 } = {}) {
    this.material = new THREE.MeshBasicMaterial({
      color,
      side: THREE.BackSide,
      depthWrite: true,
      toneMapped: false,
    });
    this.thickness = thickness;
    this.shells = [];
    this.quality = 'medium';
  }

  attach(character) {
    if (!character?.body) return 0;
    const meshes = [];
    character.body.traverse(object => {
      if (object.isMesh && !object.userData.colorbeatOutline) meshes.push(object);
    });
    for (const mesh of meshes) {
      // Share the original BufferGeometry, never clone it for an outline.
      const shell = new THREE.Mesh(mesh.geometry, this.material);
      shell.name = 'colorbeat-outline';
      shell.userData.colorbeatOutline = true;
      shell.scale.setScalar(this.thickness);
      shell.castShadow = false;
      shell.receiveShadow = false;
      shell.renderOrder = -1;
      shell.raycast = () => {};
      shell.visible = this.quality !== 'low';
      mesh.add(shell);
      this.shells.push(shell);
    }
    return meshes.length;
  }

  setQuality(quality) {
    this.quality = quality;
    for (const shell of this.shells) shell.visible = quality !== 'low';
  }

  dispose() {
    for (const shell of this.shells) shell.removeFromParent();
    this.shells.length = 0;
    this.material.dispose();
  }
}
