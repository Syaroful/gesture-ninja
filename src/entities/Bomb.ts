/**
 * Bomb.ts - Bomb entity (avoid these!)
 */

import * as THREE from 'three';
import { GameObject } from './GameObject';

export class Bomb extends GameObject {
  private static material: THREE.MeshStandardMaterial;
  
  constructor(
    scene: THREE.Scene,
    position: THREE.Vector3,
    velocity: THREE.Vector3
  ) {
    super(scene, 'bomb', position, velocity);
    this.config.radius = 0.6; // Increased from 0.4
  }
  
  static preloadMaterials(): void {
    Bomb.material = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.3,
      metalness: 0.8,
      emissive: 0xff0000,
      emissiveIntensity: 0.2
    });
  }
  
  createMesh(): THREE.Group {
    const group = new THREE.Group();
    
    // Bomb body
    const bodyGeom = new THREE.SphereGeometry(0.55, 20, 20);
    const body = new THREE.Mesh(bodyGeom, Bomb.material);
    group.add(body);
    
    // Fuse
    const fuseGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 6);
    const fuseMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const fuse = new THREE.Mesh(fuseGeom, fuseMat);
    fuse.position.y = 0.7;
    group.add(fuse);
    
    // Spark (animated in update)
    const sparkGeom = new THREE.SphereGeometry(0.08, 8, 8);
    const sparkMat = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      emissive: 0xff3300,
      emissiveIntensity: 1
    });
    const spark = new THREE.Mesh(sparkGeom, sparkMat);
    spark.position.y = 0.95;
    spark.name = 'spark';
    group.add(spark);
    
    return group;
  }
  
  update(dt: number): void {
    super.update(dt);
    
    // Animate spark
    const spark = this.mesh.getObjectByName('spark');
    if (spark) {
      const scale = 0.8 + Math.sin(Date.now() * 0.02) * 0.4;
      spark.scale.setScalar(scale);
    }
  }
  
  protected onSlice(): void {
    // Flash red
    const body = this.mesh.children[0] as THREE.Mesh;
    if (body && body.material) {
      (body.material as THREE.MeshStandardMaterial).emissiveIntensity = 2;
    }
  }
}
