/**
 * GameState.ts - Central game state management
 */

export type GameState = 'loading' | 'menu' | 'playing' | 'paused' | 'gameOver';

export interface GameData {
  state: GameState;
  score: number;
  lives: number;
  combo: number;
  comboTimer: number;
  highScore: number;
  difficulty: number;
  time: number;
}

export class GameStateManager {
  private state: GameData;
  private listeners: ((state: GameData) => void)[] = [];
  
  constructor() {
    const savedHighScore = localStorage.getItem('gestureNinjaHighScore');
    this.state = {
      state: 'loading',
      score: 0,
      lives: 3,
      combo: 0,
      comboTimer: 0,
      highScore: savedHighScore ? parseInt(savedHighScore) : 0,
      difficulty: 1,
      time: 0
    };
  }
  
  get(): GameData {
    return { ...this.state };
  }
  
  setState(newState: GameState): void {
    this.state.state = newState;
    this.notify();
  }
  
  addScore(points: number): void {
    const comboMultiplier = Math.max(1, this.state.combo);
    this.state.score += points * comboMultiplier;
    this.state.combo++;
    this.state.comboTimer = 1.5; // 1.5 seconds to maintain combo
    
    if (this.state.score > this.state.highScore) {
      this.state.highScore = this.state.score;
      localStorage.setItem('gestureNinjaHighScore', this.state.highScore.toString());
    }
    
    this.updateDifficulty();
    this.notify();
  }
  
  loseLife(): void {
    this.state.lives--;
    this.state.combo = 0;
    this.notify();
  }
  
  updateDifficulty(): void {
    // Increase difficulty every 100 points
    this.state.difficulty = 1 + Math.floor(this.state.score / 100) * 0.1;
  }
  
  update(dt: number): void {
    this.state.time += dt;
    
    // Combo timer
    if (this.state.comboTimer > 0) {
      this.state.comboTimer -= dt;
      if (this.state.comboTimer <= 0) {
        this.state.combo = 0;
        this.notify();
      }
    }
  }
  
  reset(): void {
    this.state.score = 0;
    this.state.lives = 3;
    this.state.combo = 0;
    this.state.comboTimer = 0;
    this.state.difficulty = 1;
    this.notify();
  }
  
  subscribe(listener: (state: GameData) => void): void {
    this.listeners.push(listener);
  }
  
  private notify(): void {
    this.listeners.forEach(l => l(this.get()));
  }
}
