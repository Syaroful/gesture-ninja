/**
 * GameObject.ts - Base game entity
 */

import * as THREE from 'three';

export type ObjectType = 'fruit' | 'bomb' | 'golden' | 'freeze';

export interface GameObjectConfig {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Vector3;
  rotationSpeed: THREE.Vector3;
  type: ObjectType;
  radius: number;
  sliced: boolean;
  lifetime: number;
}

export abstract class GameObject {
  public mesh: THREE.Mesh | THREE.Group;
  public config: GameObjectConfig;
  public active: boolean = true;
  
  protected constructor(
    public scene: THREE.Scene,
    type: ObjectType,
    position: THREE.Vector3,
    velocity: THREE.Vector3
  ) {
    this.config = {
      position: position.clone(),
      velocity: velocity.clone(),
      rotation: new THREE.Vector3(0, 0, 0),
      rotationSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4
      ),
      type,
      radius: 0.5,
      sliced: false,
      lifetime: 5 // 5 seconds max
    };
    
    this.mesh = this.createMesh();
    this.mesh.position.copy(position);
    scene.add(this.mesh);
  }
  
  abstract createMesh(): THREE.Mesh | THREE.Group;
  
  update(dt: number): void {
    if (!this.active) return;
    
    // Physics
    this.config.velocity.y -= 15 * dt; // Gravity
    this.config.position.add(
      this.config.velocity.clone().multiplyScalar(dt)
    );
    
    // Rotation
    this.config.rotation.add(
      this.config.rotationSpeed.clone().multiplyScalar(dt)
    );
    
    // Update mesh
    this.mesh.position.copy(this.config.position);
    this.mesh.rotation.set(
      this.config.rotation.x,
      this.config.rotation.y,
      this.config.rotation.z
    );
    
    // Lifetime
    this.config.lifetime -= dt;
    
    // Remove if off screen or expired
    if (this.config.position.y < -10 || this.config.lifetime <= 0) {
      this.destroy();
    }
  }
  
  slice(): void {
    if (this.config.sliced || !this.active) return;
    this.config.sliced = true;
    this.onSlice();
  }
  
  protected abstract onSlice(): void;
  
  destroy(): void {
    this.active = false;
    this.scene.remove(this.mesh);
    this.dispose();
  }
  
  protected dispose(): void {}
}
