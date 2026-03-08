/**
 * SpawnSystem.ts - Object spawning logic
 */

import * as THREE from 'three';
import { Fruit } from '../entities/Fruit';
import { Bomb } from '../entities/Bomb';
import { GameObject } from '../entities/GameObject';

export interface SpawnConfig {
  difficulty: number;
  minSpeed: number;
  maxSpeed: number;
  spawnRate: number;
}

export class SpawnSystem {
  private scene: THREE.Scene;
  private objects: GameObject[] = [];
  private timer: number = 0;
  private config: SpawnConfig;
  
  // Spawn zones
  private readonly minX = -6;
  private readonly maxX = 6;
  private readonly spawnY = -8;
  private readonly targetY = 10; // Increased from 4 for even higher throws
  
  constructor(scene: THREE.Scene, difficulty: number = 1) {
    this.scene = scene;
    this.config = {
      difficulty,
      minSpeed: 15, // Increased from 9 for higher throws
      maxSpeed: 20, // Increased from 14
      spawnRate: 1.5 // seconds between spawns
    };
    
    // Preload materials
    Fruit.preloadMaterials();
    Bomb.preloadMaterials();
  }
  
  setDifficulty(difficulty: number): void {
    this.config.difficulty = difficulty;
    this.config.spawnRate = Math.max(0.5, 1.5 - difficulty * 0.1);
  }
  
  update(dt: number): void {
    this.timer += dt;
    
    if (this.timer >= this.config.spawnRate) {
      this.timer = 0;
      this.spawnObject();
    }
    
    // Update all objects
    for (const obj of this.objects) {
      obj.update(dt);
    }
    
    // Remove inactive objects
    this.objects = this.objects.filter(obj => obj.active);
  }
  
  private spawnObject(): void {
    // Determine what to spawn
    const rand = Math.random();
    const difficulty = this.config.difficulty;
    
    // Bomb chance increases with difficulty (max 30%)
    const bombChance = Math.min(0.3, 0.1 + difficulty * 0.02);
    
    // Golden fruit (rare)
    const goldenChance = 0.05;
    
    // Freeze fruit
    const freezeChance = 0.1;
    
    // Random spawn position (bottom of screen)
    const x = this.minX + Math.random() * (this.maxX - this.minX);
    const position = new THREE.Vector3(x, this.spawnY, 0);
    
    // Calculate velocity to throw towards center-ish
    const targetX = (Math.random() - 0.5) * 6;
    const targetY = this.targetY + Math.random() * 3;
    const direction = new THREE.Vector3(targetX - x, targetY - this.spawnY, 0);
    const distance = direction.length();
    direction.normalize();
    
    const speed = this.config.minSpeed + Math.random() * (this.config.maxSpeed - this.config.minSpeed);
    const velocity = direction.multiplyScalar(speed);
    
    if (rand < bombChance) {
      // Spawn bomb
      const bomb = new Bomb(this.scene, position, velocity);
      this.objects.push(bomb);
    } else if (rand < bombChance + goldenChance) {
      // Spawn golden fruit
      const fruit = new Fruit(this.scene, 'golden', position, velocity);
      this.objects.push(fruit);
    } else if (rand < bombChance + goldenChance + freezeChance) {
      // Spawn freeze fruit
      const fruit = new Fruit(this.scene, 'freeze', position, velocity);
      this.objects.push(fruit);
    } else {
      // Spawn random regular fruit
      const types: ('apple' | 'watermelon' | 'orange' | 'pineapple')[] = 
        ['apple', 'watermelon', 'orange', 'pineapple'];
      const type = types[Math.floor(Math.random() * types.length)];
      const fruit = new Fruit(this.scene, type, position, velocity);
      this.objects.push(fruit);
    }
  }
  
  getObjects(): GameObject[] {
    return this.objects;
  }
  
  clear(): void {
    for (const obj of this.objects) {
      obj.destroy();
    }
    this.objects = [];
  }
}
