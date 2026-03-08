/**
 * SlashTrail.ts - Visual trail following hand movement
 */

import * as THREE from 'three';

export class SlashTrail {
  private scene: THREE.Scene;
  private points: THREE.Vector3[] = [];
  private maxPoints: number = 30;
  private line: THREE.Line;
  private glowLine: THREE.Line;
  private material: THREE.LineBasicMaterial;
  private glowMaterial: THREE.LineBasicMaterial;
  private lifetime: number = 0;
  private maxLifetime: number = 0.5;
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private lastPosition: THREE.Vector3 = new THREE.Vector3();
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    
    // Main line
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.maxPoints * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    this.material = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      linewidth: 3
    });
    this.line = new THREE.Line(geometry, this.material);
    
    // Glow line (wider, more transparent)
    this.glowMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.3,
      linewidth: 8
    });
    this.glowLine = new THREE.Line(geometry.clone(), this.glowMaterial);
    
    scene.add(this.glowLine);
    scene.add(this.line);
    this.line.visible = false;
    this.glowLine.visible = false;
  }
  
  updatePosition(position: THREE.Vector3): void {
    this.velocity = position.clone().sub(this.lastPosition);
    this.lastPosition.copy(position);
    
    // Add new point
    this.points.unshift(position.clone());
    if (this.points.length > this.maxPoints) {
      this.points.pop();
    }
    
    this.lifetime = this.maxLifetime;
    this.updateGeometry();
  }
  
  private updateGeometry(): void {
    if (this.points.length < 2) {
      this.line.visible = false;
      this.glowLine.visible = false;
      return;
    }
    
    this.line.visible = true;
    this.glowLine.visible = true;
    
    const positions = this.line.geometry.attributes.position.array as Float32Array;
    const glowPositions = this.glowLine.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < this.maxPoints; i++) {
      if (i < this.points.length) {
        positions[i * 3] = this.points[i].x;
        positions[i * 3 + 1] = this.points[i].y;
        positions[i * 3 + 2] = this.points[i].z;
        
        glowPositions[i * 3] = this.points[i].x;
        glowPositions[i * 3 + 1] = this.points[i].y;
        glowPositions[i * 3 + 2] = this.points[i].z;
      } else {
        positions[i * 3] = this.points[this.points.length - 1]?.x || 0;
        positions[i * 3 + 1] = this.points[this.points.length - 1]?.y || 0;
        positions[i * 3 + 2] = this.points[this.points.length - 1]?.z || 0;
        
        glowPositions[i * 3] = positions[i * 3];
        glowPositions[i * 3 + 1] = positions[i * 3 + 1];
        glowPositions[i * 3 + 2] = positions[i * 3 + 2];
      }
    }
    
    this.line.geometry.attributes.position.needsUpdate = true;
    this.glowLine.geometry.attributes.position.needsUpdate = true;
  }
  
  update(dt: number): void {
    // Fade out
    if (this.lifetime > 0) {
      this.lifetime -= dt;
      const alpha = Math.max(0, this.lifetime / this.maxLifetime);
      this.material.opacity = alpha;
      this.glowMaterial.opacity = alpha * 0.3;
    }
    
    // Remove old points when not moving
    if (this.velocity.length() < 0.01 && this.points.length > 0) {
      this.points.pop();
      if (this.points.length > 0) {
        this.updateGeometry();
      }
    }
  }
  
  getVelocity(): THREE.Vector3 {
    return this.velocity.clone();
  }
  
  getSpeed(): number {
    return this.velocity.length();
  }
  
  getCurrentPosition(): THREE.Vector3 {
    return this.points[0] ? this.points[0].clone() : new THREE.Vector3();
  }
  
  getPreviousPosition(): THREE.Vector3 {
    return this.points[1] ? this.points[1].clone() : this.lastPosition.clone();
  }
  
  clear(): void {
    this.points = [];
    this.line.visible = false;
    this.glowLine.visible = false;
  }
  
  dispose(): void {
    this.scene.remove(this.line);
    this.scene.remove(this.glowLine);
    this.line.geometry.dispose();
    this.glowLine.geometry.dispose();
    this.material.dispose();
    this.glowMaterial.dispose();
  }
}
