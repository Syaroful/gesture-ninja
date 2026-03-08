/**
 * ParticleSystem.ts - Juice splashes and explosion effects
 */

import * as THREE from 'three';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  lifetime: number;
  maxLifetime: number;
  size: number;
  color: THREE.Color;
}

export class ParticleSystem {
  private scene: THREE.Scene;
  private particles: Particle[] = [];
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private points: THREE.Points;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(500 * 3);
    const colors = new Float32Array(500 * 3);
    const sizes = new Float32Array(500);
    
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    this.material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    this.points = new THREE.Points(this.geometry, this.material);
    scene.add(this.points);
  }
  
  emit(
    position: THREE.Vector3,
    count: number,
    color: THREE.Color,
    speed: number = 5,
    spread: number = 1
  ): void {
    for (let i = 0; i < count; i++) {
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * spread,
        Math.random() * spread + 2,
        (Math.random() - 0.5) * spread
      ).normalize().multiplyScalar(speed * (0.5 + Math.random() * 0.5));
      
      this.particles.push({
        position: position.clone(),
        velocity,
        lifetime: 1 + Math.random() * 0.5,
        maxLifetime: 1 + Math.random() * 0.5,
        size: 0.1 + Math.random() * 0.15,
        color: color.clone()
      });
    }
  }
  
  emitExplosion(position: THREE.Vector3, count: number = 50): void {
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 3 + Math.random() * 8;
      
      const velocity = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi)
      ).multiplyScalar(speed);
      
      // Orange/red for explosion
      const color = new THREE.Color(
        1,
        0.3 + Math.random() * 0.4,
        0
      );
      
      this.particles.push({
        position: position.clone(),
        velocity,
        lifetime: 0.8 + Math.random() * 0.4,
        maxLifetime: 0.8 + Math.random() * 0.4,
        size: 0.2 + Math.random() * 0.2,
        color
      });
    }
  }
  
  update(dt: number): void {
    const positions = this.geometry.attributes.position.array as Float32Array;
    const colors = this.geometry.attributes.color.array as Float32Array;
    const sizes = this.geometry.attributes.size.array as Float32Array;
    
    let activeCount = 0;
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // Physics
      p.velocity.y -= 15 * dt; // Gravity
      p.position.add(p.velocity.clone().multiplyScalar(dt));
      p.lifetime -= dt;
      
      // Remove dead particles
      if (p.lifetime <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      
      // Update buffers
      if (activeCount < 500) {
        positions[activeCount * 3] = p.position.x;
        positions[activeCount * 3 + 1] = p.position.y;
        positions[activeCount * 3 + 2] = p.position.z;
        
        const alpha = p.lifetime / p.maxLifetime;
        colors[activeCount * 3] = p.color.r * alpha;
        colors[activeCount * 3 + 1] = p.color.g * alpha;
        colors[activeCount * 3 + 2] = p.color.b * alpha;
        
        sizes[activeCount] = p.size * alpha;
        activeCount++;
      }
    }
    
    // Clear remaining buffer positions
    for (let i = activeCount; i < 500; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -100;
      positions[i * 3 + 2] = 0;
    }
    
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;
  }
  
  dispose(): void {
    this.scene.remove(this.points);
    this.geometry.dispose();
    this.material.dispose();
  }
}
