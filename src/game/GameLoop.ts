/**
 * GameLoop.ts - Main game loop with fixed timestep
 */

export type UpdateCallback = (dt: number) => void;
export type RenderCallback = () => void;

export class GameLoop {
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly timestep: number = 1 / 60; // Fixed 60 FPS
  private maxFrameTime: number = 0.1; // Prevent spiral of death
  
  private isRunning: boolean = false;
  private animationId: number = 0;
  
  private updateCallback: UpdateCallback | null = null;
  private renderCallback: RenderCallback | null = null;
  
  private fps: number = 60;
  private frameCount: number = 0;
  private fpsTime: number = 0;
  
  constructor() {}
  
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.loop();
  }
  
  stop(): void {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
  
  onUpdate(callback: UpdateCallback): void {
    this.updateCallback = callback;
  }
  
  onRender(callback: RenderCallback): void {
    this.renderCallback = callback;
  }
  
  private loop = (): void => {
    if (!this.isRunning) return;
    
    const currentTime = performance.now();
    let frameTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    
    // Cap frame time to prevent spiral of death
    if (frameTime > this.maxFrameTime) {
      frameTime = this.maxFrameTime;
    }
    
    this.accumulator += frameTime;
    
    // Fixed timestep updates
    while (this.accumulator >= this.timestep) {
      if (this.updateCallback) {
        this.updateCallback(this.timestep);
      }
      this.accumulator -= this.timestep;
    }
    
    // Render
    if (this.renderCallback) {
      this.renderCallback();
    }
    
    // FPS counter
    this.frameCount++;
    this.fpsTime += frameTime;
    if (this.fpsTime >= 1) {
      this.fps = Math.round(this.frameCount / this.fpsTime);
      this.frameCount = 0;
      this.fpsTime = 0;
    }
    
    this.animationId = requestAnimationFrame(this.loop);
  }
  
  getFPS(): number {
    return this.fps;
  }
}
