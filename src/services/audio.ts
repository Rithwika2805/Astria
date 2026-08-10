class AudioEngine {
  private ctx: AudioContext | null = null;
  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying = false;

  private initCtx(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public playClick(enabled = true): void {
    if (!enabled) return;
    try {
      const ctx = this.initCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Ignore audio context autoplay restriction
    }
  }

  public playCompletionChime(enabled = true): void {
    if (!enabled) return;
    try {
      const ctx = this.initCtx();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        const startTime = ctx.currentTime + idx * 0.12;
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.2);
      });
    } catch {
      // Ignore audio restriction
    }
  }

  public playLevelUpFanfare(enabled = true): void {
    if (!enabled) return;
    try {
      const ctx = this.initCtx();
      const notes = [440, 554.37, 659.25, 880, 1108.73]; // A4, C#5, E5, A5, C#6

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);

        const startTime = ctx.currentTime + idx * 0.09;
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.5);
      });
    } catch {
      // Ignore
    }
  }

  public startAmbientDrone(enabled = true): void {
    if (!enabled || this.isAmbientPlaying) return;
    try {
      const ctx = this.initCtx();
      this.ambientOsc1 = ctx.createOscillator();
      this.ambientOsc2 = ctx.createOscillator();
      this.ambientGain = ctx.createGain();

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 220;

      this.ambientOsc1.type = 'sine';
      this.ambientOsc1.frequency.setValueAtTime(108, ctx.currentTime); // Deep A2 sub drone

      this.ambientOsc2.type = 'sine';
      this.ambientOsc2.frequency.setValueAtTime(112.5, ctx.currentTime); // Soft binaural beat

      this.ambientGain.gain.setValueAtTime(0.001, ctx.currentTime);
      this.ambientGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 3);

      this.ambientOsc1.connect(filter);
      this.ambientOsc2.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(ctx.destination);

      this.ambientOsc1.start();
      this.ambientOsc2.start();
      this.isAmbientPlaying = true;
    } catch {
      // Ignore
    }
  }

  public stopAmbientDrone(): void {
    if (!this.isAmbientPlaying || !this.ambientGain || !this.ctx) return;
    try {
      this.ambientGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);
      setTimeout(() => {
        if (this.ambientOsc1) {
          this.ambientOsc1.stop();
          this.ambientOsc1.disconnect();
          this.ambientOsc1 = null;
        }
        if (this.ambientOsc2) {
          this.ambientOsc2.stop();
          this.ambientOsc2.disconnect();
          this.ambientOsc2 = null;
        }
        this.isAmbientPlaying = false;
      }, 1500);
    } catch {
      this.isAmbientPlaying = false;
    }
  }
}

export const AudioService = new AudioEngine();
