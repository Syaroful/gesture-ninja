/**
 * SoundManager.ts - Procedural sound effects using Web Audio API
 */

export class SoundManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;
  
  constructor() {
    // Initialize on first user interaction
    document.addEventListener('click', () => this.init(), { once: true });
    document.addEventListener('keydown', () => this.init(), { once: true });
  }
  
  private init(): void {
    if (this.audioContext) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.audioContext.destination);
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }
  
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
  
  /**
   * Slice/swipe whoosh sound
   */
  playSlice(): void {
    if (!this.enabled || !this.audioContext || !this.masterGain) return;
    
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    // Noise-based whoosh
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      // Envelope: quick attack, fade out
      const env = Math.exp(-i / (bufferSize * 0.3));
      data[i] = (Math.random() * 2 - 1) * env;
    }
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    
    // Bandpass filter for whoosh character
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1500;
    filter.Q.value = 1;
    
    // Pitch shift sweep
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(500, now + 0.15);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    source.start(now);
    source.stop(now + 0.15);
  }
  
  /**
   * Fruit slice/hit sound (squelchy)
   */
  playFruitHit(): void {
    if (!this.enabled || !this.audioContext || !this.masterGain) return;
    
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    // Short noise burst with low-pass
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const env = Math.exp(-i / (bufferSize * 0.2));
      data[i] = (Math.random() * 2 - 1) * env;
    }
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    source.start(now);
    source.stop(now + 0.1);
  }
  
  /**
   * Bomb explosion sound
   */
  playBomb(): void {
    if (!this.enabled || !this.audioContext || !this.masterGain) return;
    
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    // Low frequency boom
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);
    
    // Noise burst
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const env = Math.exp(-i / (bufferSize * 0.15));
      data[i] = (Math.random() * 2 - 1) * env;
    }
    
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 1000;
    
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.7, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.3);
    noiseSource.start(now);
    noiseSource.stop(now + 0.5);
  }
  
  /**
   * Combo sound (rising tone)
   */
  playCombo(combo: number): void {
    if (!this.enabled || !this.audioContext || !this.masterGain) return;
    
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    const baseFreq = 400 + (combo * 50);
    
    // Rising arpeggio
    for (let i = 0; i < Math.min(combo, 5); i++) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = baseFreq + (i * 100);
      
      const gain = ctx.createGain();
      const startTime = now + i * 0.05;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(startTime);
      osc.stop(startTime + 0.15);
    }
  }
  
  /**
   * Game over sound
   */
  playGameOver(): void {
    if (!this.enabled || !this.audioContext || !this.masterGain) return;
    
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    // Sad descending tone
    const freqs = [400, 350, 300, 250, 200];
    
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const gain = ctx.createGain();
      const startTime = now + i * 0.15;
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }
  
  /**
   * Button click sound
   */
  playClick(): void {
    if (!this.enabled || !this.audioContext || !this.masterGain) return;
    
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.05);
  }
}
