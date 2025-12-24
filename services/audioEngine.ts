// A simple synthesizer engine using Web Audio API to avoid external asset dependencies
// Generates Cyberpunk-style drones and SFX

class AudioEngine {
  private ctx: AudioContext | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private ambientGain: GainNode | null = null;
  private isMuted: boolean = false;
  private currentMood: 'exploration' | 'combat' = 'exploration';

  constructor() {
    // Context is initialized on first user interaction
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.startAmbience();
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.ctx) {
      if (this.isMuted) {
        this.ctx.suspend();
      } else {
        this.ctx.resume();
      }
    }
    return this.isMuted;
  }

  private createOscillator(type: OscillatorType, freq: number, detune: number = 0, gainVal: number = 0.1) {
    if (!this.ctx) return null;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    
    gain.gain.value = gainVal;
    
    osc.connect(gain);
    return { osc, gain };
  }

  startAmbience() {
    if (!this.ctx) return;
    this.stopAmbience();

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.connect(this.ctx.destination);
    this.ambientGain.gain.value = 0.15; // Master volume for ambience

    // Cyberpunk Drone (Low Sawtooth + Sine)
    const nodes = [];

    if (this.currentMood === 'exploration') {
      // Dark, brooding drone
      nodes.push(this.createOscillator('sawtooth', 55, 5, 0.1)); // Low A
      nodes.push(this.createOscillator('sine', 110, -5, 0.05)); // Octave up
      
      // Filter the saw to make it less harsh
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 200;
      
      nodes.forEach(n => {
        if(n) {
          n.gain.disconnect();
          n.gain.connect(filter);
          this.ambientOscillators.push(n.osc);
          n.osc.start();
        }
      });
      filter.connect(this.ambientGain);

    } else {
      // Combat: Aggressive, faster pulse
      nodes.push(this.createOscillator('sawtooth', 40, 0, 0.2)); // Deep Bass
      nodes.push(this.createOscillator('square', 80, 10, 0.1)); // Edgier
      
      // LFO for pulsing effect
      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 4; // 4Hz pulse
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 500;
      lfo.connect(lfoGain);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      lfoGain.connect(filter.frequency);
      lfo.start();
      this.ambientOscillators.push(lfo);

      nodes.forEach(n => {
        if(n) {
          n.gain.disconnect();
          n.gain.connect(filter);
          this.ambientOscillators.push(n.osc);
          n.osc.start();
        }
      });
      filter.connect(this.ambientGain);
    }
  }

  stopAmbience() {
    this.ambientOscillators.forEach(osc => {
      try { osc.stop(); } catch(e) {}
    });
    this.ambientOscillators = [];
    if (this.ambientGain) {
      this.ambientGain.disconnect();
    }
  }

  setMood(mood: 'exploration' | 'combat') {
    if (this.currentMood !== mood) {
      this.currentMood = mood;
      if (this.ctx && !this.isMuted) {
        // Crossfade or restart
        // Simple restart for now
        const now = this.ctx.currentTime;
        if (this.ambientGain) {
          this.ambientGain.gain.exponentialRampToValueAtTime(0.001, now + 1);
        }
        setTimeout(() => this.startAmbience(), 1000);
      }
    }
  }

  playSFX(type: 'pickup' | 'damage' | 'click' | 'success') {
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    if (type === 'pickup') {
      // High tech ping
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.start(t);
      osc.stop(t + 0.3);
    } else if (type === 'damage') {
      // Noise burst / Low thump
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.2);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.start(t);
      osc.stop(t + 0.4);
    } else if (type === 'click') {
      // UI Click
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2000, t);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.start(t);
      osc.stop(t + 0.05);
    } else if (type === 'success') {
      // Quest update
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.setValueAtTime(554, t + 0.1); // C#
      osc.frequency.setValueAtTime(659, t + 0.2); // E
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.6);
      osc.start(t);
      osc.stop(t + 0.6);
    }
  }
}

export const audio = new AudioEngine();
