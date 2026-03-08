/**
 * Fruit.ts - Fruit entity
 */

import * as THREE from 'three';
import { GameObject, ObjectType } from './GameObject';

export class Fruit extends GameObject {
  private static materials: Map<string, THREE.MeshStandardMaterial> = new Map();
  
  constructor(
    scene: THREE.Scene,
    type: 'apple' | 'watermelon' | 'orange' | 'pineapple' | 'golden' | 'freeze',
    position: THREE.Vector3,
    velocity: THREE.Vector3
  ) {
    super(scene, type as ObjectType, position, velocity);
    this.config.radius = 0.65; // Increased from 0.4
  }
  
  static preloadMaterials(): void {
    const fruitTypes = [
      { name: 'apple', color: 0xff3333 },
      { name: 'watermelon', color: 0x228b22 },
      { name: 'orange', color: 0xffa500 },
      { name: 'pineapple', color: 0xdaa520 },
      { name: 'golden', color: 0xffd700 },
      { name: 'freeze', color: 0x00ffff }
    ];
    
    fruitTypes.forEach(f => {
      const mat = new THREE.MeshStandardMaterial({
        color: f.color,
        roughness: 0.4,
        metalness: 0.1,
        emissive: f.color,
        emissiveIntensity: f.name === 'golden' ? 0.5 : 0.1
      });
      Fruit.materials.set(f.name, mat);
    });
  }
  
  createMesh(): THREE.Mesh {
    const type = this.config.type as string;
    let geometry: THREE.BufferGeometry;
    
    if (type === 'apple') {
      geometry = new THREE.SphereGeometry(0.55, 20, 20);
    } else if (type === 'watermelon') {
      geometry = new THREE.SphereGeometry(0.7, 20, 20);
    } else if (type === 'orange') {
      geometry = new THREE.SphereGeometry(0.5, 20, 20);
    } else if (type === 'pineapple') {
      geometry = new THREE.CylinderGeometry(0.4, 0.55, 0.75, 12);
    } else if (type === 'golden') {
      geometry = new THREE.SphereGeometry(0.55, 20, 20);
    } else if (type === 'freeze') {
      geometry = new THREE.SphereGeometry(0.55, 20, 20);
    } else {
      geometry = new THREE.SphereGeometry(0.55, 20, 20);
    }
    
    const material = Fruit.materials.get(type) || Fruit.materials.get('apple')!;
    const mesh = new THREE.Mesh(geometry, material);
    
    // Add stem for some fruits
    if (type === 'apple' || type === 'golden') {
      const stemGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.22, 6);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
      const stem = new THREE.Mesh(stemGeom, stemMat);
      stem.position.y = 0.6;
      mesh.add(stem);
    }
    
    return mesh;
  }
  
  protected onSlice(): void {
    // Visual effect - scale down and fade
    const mesh = this.mesh as THREE.Mesh;
    if (mesh.material instanceof THREE.Material) {
      (mesh.material as THREE.MeshStandardMaterial).transparent = true;
      (mesh.material as THREE.MeshStandardMaterial).opacity = 0.5;
    }
  }
  
  getPoints(): number {
    const type = this.config.type;
    if (type === 'golden') return 50;
    if (type === 'freeze') return 20;
    return 10;
  }
}
