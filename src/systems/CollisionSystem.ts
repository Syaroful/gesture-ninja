/**
 * CollisionSystem.ts - Line-circle collision detection
 */

import * as THREE from 'three';
import { GameObject } from '../entities/GameObject';

export class CollisionSystem {
  /**
   * Check if a line segment intersects a circle (game object)
   */
  static lineCircleIntersect(
    lineStart: THREE.Vector3,
    lineEnd: THREE.Vector3,
    circleCenter: THREE.Vector3,
    radius: number
  ): boolean {
    // Vector from line start to end
    const lineVec = lineEnd.clone().sub(lineStart);
    const lineLength = lineVec.length();
    
    if (lineLength < 0.001) {
      // Line too short, check point distance
      return lineStart.distanceTo(circleCenter) < radius;
    }
    
    // Normalize line vector
    const lineDir = lineVec.normalize();
    
    // Vector from line start to circle center
    const startToCenter = circleCenter.clone().sub(lineStart);
    
    // Project center onto line
    const projection = startToCenter.dot(lineDir);
    
    // Closest point on line to center
    let closestPoint: THREE.Vector3;
    
    if (projection < 0) {
      // Before start of line
      closestPoint = lineStart.clone();
    } else if (projection > lineLength) {
      // After end of line
      closestPoint = lineEnd.clone();
    } else {
      // On the line
      closestPoint = lineStart.clone().add(lineDir.multiplyScalar(projection));
    }
    
    // Check distance from closest point to circle center
    const distance = closestPoint.distanceTo(circleCenter);
    
    return distance < radius;
  }
  
  /**
   * Check slash collision against all game objects
   */
  static checkSlashCollision(
    slashStart: THREE.Vector3,
    slashEnd: THREE.Vector3,
    objects: GameObject[]
  ): GameObject[] {
    const hitObjects: GameObject[] = [];
    
    for (const obj of objects) {
      if (!obj.active) continue;
      
      const hit = this.lineCircleIntersect(
        slashStart,
        slashEnd,
        obj.config.position,
        obj.config.radius
      );
      
      if (hit) {
        hitObjects.push(obj);
      }
    }
    
    return hitObjects;
  }
  
  /**
   * Check if point is on screen
   */
  static isOnScreen(position: THREE.Vector3): boolean {
    return (
      position.x > -15 &&
      position.x < 15 &&
      position.y > -10 &&
      position.y < 15
    );
  }
}
