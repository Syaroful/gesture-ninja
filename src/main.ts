/**
 * Gesture Ninja - Main Entry Point
 */

import * as THREE from 'three';
import { GameLoop } from './game/GameLoop';
import { GameStateManager } from './game/GameState';
import { SpawnSystem } from './systems/SpawnSystem';
import { ParticleSystem } from './systems/ParticleSystem';
import { CollisionSystem } from './systems/CollisionSystem';
import { SlashTrail } from './entities/SlashTrail';
import { Fruit } from './entities/Fruit';
import { Bomb } from './entities/Bomb';
import { GameObject } from './entities/GameObject';

class GestureNinja {
  // Three.js
  private scene!: THREE.Scene;
  private camera!: THREE.OrthographicCamera;
  private renderer!: THREE.WebGLRenderer;
  
  // Game systems
  private gameLoop!: GameLoop;
  private gameState!: GameStateManager;
  private spawnSystem!: SpawnSystem;
  private particles!: ParticleSystem;
  private slashTrail!: SlashTrail;
  
  // Hand tracking
  private handTracker: any = null;
  private isCameraRunning: boolean = false;
  private handPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private previousHandPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private handMarker!: THREE.Mesh;
  private isHandDetected: boolean = false;
  
  // Screen shake
  private screenShake: number = 0;
  private shakeIntensity: number = 0;
  
  constructor() {
    this.initThree();
    this.initGameSystems();
    this.initUI();
    this.initHandTracking();
    
    // Hide loading
    document.getElementById('loading')?.classList.add('hidden');
  }
  
  private initThree(): void {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0f);
    
    // Camera (orthographic for 2D-like gameplay)
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 10;
    this.camera = new THREE.OrthographicCamera(
      -frustumSize * aspect, frustumSize * aspect,
      frustumSize, -frustumSize,
      0.1, 100
    );
    this.camera.position.z = 10;
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('game-container')?.appendChild(this.renderer.domElement);
    
    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);
    
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(5, 10, 5);
    this.scene.add(directional);
    
    // Background particles (stars)
    this.createBackground();
    
    // Hand tracking marker
    this.createHandMarker();
    
    // Resize handler
    window.addEventListener('resize', () => this.onResize());
  }
  
  private createBackground(): void {
    const starCount = 200;
    const positions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = -10;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });
    
    const stars = new THREE.Points(geometry, material);
    this.scene.add(stars);
  }
  
  private createHandMarker(): void {
    // Create a glowing sphere to show hand position
    const geometry = new THREE.SphereGeometry(0.3, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.8
    });
    this.handMarker = new THREE.Mesh(geometry, material);
    this.handMarker.visible = false;
    this.scene.add(this.handMarker);
    
    // Add a glow ring around it
    const ringGeometry = new THREE.RingGeometry(0.4, 0.5, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    this.handMarker.add(ring);
  }
  
  private updateHandMarker(visible: boolean): void {
    this.handMarker.visible = visible;
    const material = this.handMarker.material as THREE.MeshBasicMaterial;
    const ring = this.handMarker.children[0] as THREE.Mesh;
    const ringMaterial = ring.material as THREE.MeshBasicMaterial;
    
    if (visible) {
      material.color.setHex(0x00ff64);
      material.opacity = 0.8;
      ringMaterial.color.setHex(0x00ff64);
    } else {
      material.color.setHex(0xff6464);
      material.opacity = 0.5;
      ringMaterial.color.setHex(0xff6464);
    }
  }
  
  private initGameSystems(): void {
    this.gameState = new GameStateManager();
    this.gameLoop = new GameLoop();
    
    this.spawnSystem = new SpawnSystem(this.scene);
    this.particles = new ParticleSystem(this.scene);
    this.slashTrail = new SlashTrail(this.scene);
    
    // Game loop callbacks
    this.gameLoop.onUpdate((dt) => this.update(dt));
    this.gameLoop.onRender(() => this.render());
    
    // Subscribe to state changes
    this.gameState.subscribe((state) => this.onStateChange(state));
  }
  
  private initUI(): void {
    const startBtn = document.getElementById('btn-start');
    const restartBtn = document.getElementById('btn-restart');
    
    startBtn?.addEventListener('click', () => this.startGame());
    restartBtn?.addEventListener('click', () => this.startGame());
  }
  
  private async initHandTracking(): Promise<void> {
    // We'll initialize MediaPipe when the game starts
    // to avoid blocking the UI
  }
  
  private async startCamera(): Promise<void> {
    const videoElement = document.getElementById('camera-preview') as HTMLVideoElement;
    
    try {
      // Request camera access first
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      videoElement.srcObject = stream;
      await videoElement.play();
      
      // Dynamic import MediaPipe
      const mpHands = await import('@mediapipe/hands');
      const mpCamera = await import('@mediapipe/camera_utils');
      
      this.handTracker = new mpHands.Hands({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });
      
      this.handTracker.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5
      });
      
      this.handTracker.onResults((results: any) => this.onHandResults(results));
      
      // Use MediaPipe Camera class for frame processing
      // @ts-ignore
      const camera = new mpCamera.Camera(videoElement, {
        onFrame: async () => {
          if (this.handTracker) {
            await this.handTracker.send({ image: videoElement });
          }
        },
        width: 640,
        height: 480
      });
      
      await camera.start();
      this.isCameraRunning = true;
      videoElement.classList.add('visible');
      
    } catch (error) {
      console.error('Failed to start camera:', error);
      const statusEl = document.getElementById('tracking-status');
      const statusText = document.getElementById('tracking-text');
      if (statusEl && statusText) {
        statusEl.className = 'not-detected';
        statusEl.style.display = 'flex';
        statusText.textContent = 'Camera Error!';
      }
    }
  }
  
  private onHandResults(results: any): void {
    const statusEl = document.getElementById('tracking-status');
    const statusText = document.getElementById('tracking-text');
    
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      // No hand detected
      this.isHandDetected = false;
      this.updateHandMarker(false);
      
      if (statusEl && statusText) {
        statusEl.className = 'not-detected';
        statusEl.style.display = 'flex';
        statusText.textContent = 'No Hand Detected';
      }
      return;
    }
    
    // Hand detected!
    this.isHandDetected = true;
    this.updateHandMarker(true);
    
    if (statusEl && statusText) {
      statusEl.className = 'detected';
      statusEl.style.display = 'flex';
      statusText.textContent = 'Hand Detected!';
    }
    
    const landmarks = results.multiHandLandmarks[0];
    
    // Get index finger tip (landmark 8) and palm center (landmark 9)
    const indexTip = landmarks[8];
    const palmCenter = landmarks[9];
    
    // Convert to world coordinates (approximate)
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 10;
    
    // Mirror X because webcam is mirrored
    this.handPosition.x = (1 - indexTip.x - 0.5) * 2 * frustumSize * aspect;
    this.handPosition.y = (0.5 - indexTip.y) * 2 * frustumSize;
    this.handPosition.z = 0;
    
    // Update marker position
    this.handMarker.position.copy(this.handPosition);
  }
  
  private onStateChange(state: any): void {
    // Update UI
    const scoreEl = document.getElementById('score');
    const livesEl = document.getElementById('lives');
    const comboEl = document.getElementById('combo');
    
    if (scoreEl) scoreEl.textContent = state.score.toString();
    
    if (livesEl) {
      livesEl.textContent = '❤️'.repeat(state.lives);
    }
    
    if (comboEl) {
      if (state.combo > 1) {
        comboEl.textContent = `${state.combo}x COMBO!`;
        comboEl.classList.add('visible');
      } else {
        comboEl.classList.remove('visible');
      }
    }
  }
  
  private startGame(): void {
    // Hide screens
    document.getElementById('start-screen')?.classList.add('hidden');
    document.getElementById('game-over')?.classList.add('hidden');
    
    // Reset state
    this.gameState.reset();
    this.spawnSystem.clear();
    
    // Start camera
    this.startCamera();
    
    // Start game loop
    this.gameState.setState('playing');
    this.gameLoop.start();
  }
  
  private gameOver(): void {
    this.gameState.setState('gameOver');
    this.gameLoop.stop();
    
    // Stop camera
    if (this.handTracker) {
      this.handTracker = null;
      this.isCameraRunning = false;
      document.getElementById('camera-preview')?.classList.remove('visible');
    }
    
    // Show game over screen
    const state = this.gameState.get();
    const finalScoreEl = document.getElementById('final-score');
    const highScoreEl = document.getElementById('high-score');
    
    if (finalScoreEl) finalScoreEl.textContent = state.score.toString();
    if (highScoreEl) highScoreEl.textContent = `HIGH SCORE: ${state.highScore}`;
    
    document.getElementById('game-over')?.classList.remove('hidden');
  }
  
  private update(dt: number): void {
    const state = this.gameState.get();
    
    if (state.state !== 'playing') return;
    
    // Update state manager
    this.gameState.update(dt);
    
    // Update spawn system
    this.spawnSystem.setDifficulty(state.difficulty);
    this.spawnSystem.update(dt);
    
    // Update particles
    this.particles.update(dt);
    
    // Update slash trail
    this.slashTrail.update(dt);
    
    // Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake -= dt * 5;
      if (this.screenShake < 0) this.screenShake = 0;
    }
    
    // Hand tracking & collision
    this.handleSlash();
  }
  
  private handleSlash(): void {
    // Check if hand is moving fast enough to slash
    const speed = this.handPosition.distanceTo(this.previousHandPosition);
    
    if (speed > 0.1) {
      // Update slash trail
      this.slashTrail.updatePosition(this.handPosition);
      
      // Check collision
      const objects = this.spawnSystem.getObjects();
      const hits = CollisionSystem.checkSlashCollision(
        this.previousHandPosition,
        this.handPosition,
        objects
      );
      
      // Process hits
      for (const obj of hits) {
        this.processHit(obj);
      }
    }
    
    this.previousHandPosition.copy(this.handPosition);
  }
  
  private processHit(obj: GameObject): void {
    if (obj.config.sliced) return;
    
    obj.slice();
    
    const type = obj.config.type;
    const position = obj.config.position.clone();
    
    if (type === 'bomb') {
      // Bomb hit!
      this.gameState.loseLife();
      this.particles.emitExplosion(position, 50);
      this.triggerScreenShake(1);
      
      // Flash screen red
      this.scene.background = new THREE.Color(0xff0000);
      setTimeout(() => {
        this.scene.background = new THREE.Color(0x0a0a0f);
      }, 100);
      
      // Check game over
      if (this.gameState.get().lives <= 0) {
        this.gameOver();
      }
    } else {
      // Fruit hit!
      const fruit = obj as Fruit;
      this.gameState.addScore(fruit.getPoints());
      
      // Juice particles
      const colors: { [key: string]: THREE.Color } = {
        apple: new THREE.Color(0xff3333),
        watermelon: new THREE.Color(0xff6666),
        orange: new THREE.Color(0xffaa00),
        pineapple: new THREE.Color(0xffff00),
        golden: new THREE.Color(0xffd700),
        freeze: new THREE.Color(0x00ffff)
      };
      
      const color = colors[type] || new THREE.Color(0xff6666);
      this.particles.emit(position, 20, color);
    }
  }
  
  private triggerScreenShake(intensity: number): void {
    this.screenShake = intensity;
    this.shakeIntensity = intensity;
  }
  
  private render(): void {
    // Apply screen shake
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.shakeIntensity * 0.5;
      const shakeY = (Math.random() - 0.5) * this.shakeIntensity * 0.5;
      this.camera.position.x = shakeX;
      this.camera.position.y = shakeY;
    } else {
      this.camera.position.x = 0;
      this.camera.position.y = 0;
    }
    
    this.renderer.render(this.scene, this.camera);
  }
  
  private onResize(): void {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 10;
    
    this.camera.left = -frustumSize * aspect;
    this.camera.right = frustumSize * aspect;
    this.camera.top = frustumSize;
    this.camera.bottom = -frustumSize;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Start the game
document.addEventListener('DOMContentLoaded', () => {
  new GestureNinja();
});
