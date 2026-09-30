// Romantic Web Audio Synthesizer: Ethereal ambient pads + crisp spatial fireworks + delicate wind chime / music box tones

class RomanticAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private spatialDelayL: DelayNode | null = null;
  private spatialDelayR: DelayNode | null = null;
  private spatialFeedbackGain: GainNode | null = null;
  private spatialFilter: BiquadFilterNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private chordIntervalId: number | null = null;
  private pentatonicScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Create spatial delay & ethereal reverb network
      this.initSpatialBus();

      // Pre-generate short noise buffer for crisp firework sizzle
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.2); // 200ms
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Ethereal spatial delay bus for wide, expansive starry-night acoustic reflections
  private initSpatialBus() {
    if (!this.ctx || !this.masterGain) return;

    try {
      this.spatialDelayL = this.ctx.createDelay(1.0);
      this.spatialDelayR = this.ctx.createDelay(1.0);
      this.spatialDelayL.delayTime.setValueAtTime(0.14, this.ctx.currentTime); // 140ms left echo
      this.spatialDelayR.delayTime.setValueAtTime(0.22, this.ctx.currentTime); // 220ms right echo

      this.spatialFeedbackGain = this.ctx.createGain();
      this.spatialFeedbackGain.gain.setValueAtTime(0.28, this.ctx.currentTime); // gentle airy decay

      // Filter to keep delays crystalline and floaty, removing muddy rumble
      this.spatialFilter = this.ctx.createBiquadFilter();
      this.spatialFilter.type = 'highpass';
      this.spatialFilter.frequency.setValueAtTime(900, this.ctx.currentTime);

      // Stereo merger for left/right spatial separation if supported
      if (this.ctx.createChannelMerger) {
        const merger = this.ctx.createChannelMerger(2);
        this.spatialDelayL.connect(merger, 0, 0); // left channel
        this.spatialDelayR.connect(merger, 0, 1); // right channel
        merger.connect(this.spatialFilter);
      } else {
        this.spatialDelayL.connect(this.spatialFilter);
        this.spatialDelayR.connect(this.spatialFilter);
      }

      this.spatialFilter.connect(this.spatialFeedbackGain);
      this.spatialFeedbackGain.connect(this.spatialDelayL);
      this.spatialFeedbackGain.connect(this.spatialDelayR);

      // Send spatial bus to master output
      this.spatialFilter.connect(this.masterGain);
    } catch {
      // Graceful fallback if spatial bus fails on legacy browsers
    }
  }

  public toggleMusic(): boolean {
    this.initContext();
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }

  public start() {
    if (this.isPlaying) return;
    this.initContext();
    this.isPlaying = true;

    // Start background gentle romantic progression
    this.playChordCycle();
    this.chordIntervalId = window.setInterval(() => {
      if (this.isPlaying) {
        this.playChordCycle();
      }
    }, 4200);
  }

  public stop() {
    this.isPlaying = false;
    if (this.chordIntervalId) {
      clearInterval(this.chordIntervalId);
      this.chordIntervalId = null;
    }
  }

  // Play a soft dreamy chord
  private playChordCycle() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    // Romantic lush chord progressions (e.g. Fmaj7, Cmaj7, Am9, Dm7)
    const chordProgressions = [
      [174.61, 261.63, 329.63, 392.00], // Fmaj7
      [130.81, 196.00, 261.63, 329.63], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [146.83, 220.00, 261.63, 349.23], // Dm7
    ];

    const chord = chordProgressions[Math.floor(Math.random() * chordProgressions.length)];
    const now = this.ctx.currentTime;

    chord.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);

      // Low pass filter for warm, dreamy, non-harsh tone
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650 + Math.random() * 200, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 1.2 + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + i * 0.12);
      osc.stop(now + 4.0);
    });
  }

  // Soft sparkle / bell chime triggered on touch or heart pulse
  public playChime(pitchMultiplier: number = 1) {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      const randomFreq = this.pentatonicScale[Math.floor(Math.random() * this.pentatonicScale.length)] * pitchMultiplier;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(randomFreq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 1.3);
    } catch {
      // AudioContext might be blocked until first gesture, silently catch
    }
  }

  /**
   * Crisp & Spatial Romantic Firework Bloom Sound
   * @param panX Horizontal stereo position (-1 left to +1 right)
   * @param relativeY Vertical screen position (0 top to 1 bottom)
   */
  public playFireworkSound(panX: number = 0, relativeY: number = 0.5) {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      const clampedPan = Math.max(-0.85, Math.min(0.85, panX));

      // 1. Stereo Panning Node for physical spatial localization
      let panner: StereoPannerNode | null = null;
      if (this.ctx.createStereoPanner) {
        panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(clampedPan, now);
      }

      // Shared node connector helper
      const connectToOutput = (node: AudioNode, sendToSpatialDelay = true) => {
        if (!this.ctx || !this.masterGain) return;
        if (panner) {
          node.connect(panner);
          panner.connect(this.masterGain);
          if (sendToSpatialDelay && this.spatialDelayL && this.spatialDelayR) {
            // Also send dry signal with 30% level to spatial reverb delays
            const sendGain = this.ctx.createGain();
            sendGain.gain.setValueAtTime(0.28, now);
            panner.connect(sendGain);
            sendGain.connect(this.spatialDelayL);
            sendGain.connect(this.spatialDelayR);
          }
        } else {
          node.connect(this.masterGain);
          if (sendToSpatialDelay && this.spatialDelayL && this.spatialDelayR) {
            const sendGain = this.ctx.createGain();
            sendGain.gain.setValueAtTime(0.28, now);
            node.connect(sendGain);
            sendGain.connect(this.spatialDelayL);
            sendGain.connect(this.spatialDelayR);
          }
        }
      };

      // ---------------------------------------------------------
      // Layer 1: Crisp Crystal Strike Transient (清脆琉璃撞击瞬态)
      // Rapid attack, micro pitch-drop envelope for tactile snap
      // ---------------------------------------------------------
      const baseFreq = 1480 + (1 - relativeY) * 600 + (Math.random() - 0.5) * 160; // Higher pitch when clicking higher up
      const strikeOsc = this.ctx.createOscillator();
      const strikeGain = this.ctx.createGain();

      strikeOsc.type = 'triangle';
      strikeOsc.frequency.setValueAtTime(baseFreq * 1.15, now);
      strikeOsc.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.015);

      strikeGain.gain.setValueAtTime(0.001, now);
      strikeGain.gain.linearRampToValueAtTime(0.09, now + 0.003); // ultra-fast 3ms attack = crisp "pop"
      strikeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

      strikeOsc.connect(strikeGain);
      connectToOutput(strikeGain, true);
      strikeOsc.start(now);
      strikeOsc.stop(now + 0.40);

      // High glass overtone (C7/D7 range ~2200Hz - 3200Hz)
      const glassOsc = this.ctx.createOscillator();
      const glassGain = this.ctx.createGain();
      glassOsc.type = 'sine';
      glassOsc.frequency.setValueAtTime(baseFreq * 1.98, now);

      glassGain.gain.setValueAtTime(0.001, now);
      glassGain.gain.linearRampToValueAtTime(0.045, now + 0.002);
      glassGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

      glassOsc.connect(glassGain);
      connectToOutput(glassGain, false);
      glassOsc.start(now);
      glassOsc.stop(now + 0.18);

      // ---------------------------------------------------------
      // Layer 2: Effervescent Air Sizzle (清脆星光爆散细屑声)
      // High-passed sparkling crackle
      // ---------------------------------------------------------
      if (this.noiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(5200 + Math.random() * 800, now);
        noiseFilter.Q.setValueAtTime(3.2, now); // resonant sparkling band

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.001, now);
        noiseGain.gain.linearRampToValueAtTime(0.04, now + 0.006);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        connectToOutput(noiseGain, false);

        noise.start(now);
        noise.stop(now + 0.10);
      }

      // ---------------------------------------------------------
      // Layer 3: Spatial Cascading Starlight Chimes (空间流光琶音漫射)
      // 4 cascading crystalline tones that echo across space
      // ---------------------------------------------------------
      const celestialPitches = [880.00, 1046.50, 1318.51, 1567.98, 1760.00, 2093.00, 2637.02];
      const startPitchIdx = Math.floor(Math.random() * 3);
      const chimeCount = 4;

      for (let i = 0; i < chimeCount; i++) {
        const delay = 0.035 + i * 0.055;
        const noteFreq = celestialPitches[startPitchIdx + i] || 1760;

        const chimeOsc = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();

        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(noteFreq, now + delay);

        chimeGain.gain.setValueAtTime(0.001, now + delay);
        chimeGain.gain.linearRampToValueAtTime(0.032 - i * 0.005, now + delay + 0.015);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.55);

        chimeOsc.connect(chimeGain);
        connectToOutput(chimeGain, true);

        chimeOsc.start(now + delay);
        chimeOsc.stop(now + delay + 0.6);
      }
    } catch {
      // AudioContext might need user gesture or is suspended
    }
  }

  // Heartbeat deep thump
  public playHeartbeat() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      
      // Dual systolic-diastolic thump: "lub-dub"
      [0, 0.22].forEach((delay, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(idx === 0 ? 68 : 55, now + delay);
        osc.frequency.exponentialRampToValueAtTime(32, now + delay + 0.18);

        gain.gain.setValueAtTime(0.001, now + delay);
        gain.gain.linearRampToValueAtTime(idx === 0 ? 0.08 : 0.06, now + delay + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + delay);
        osc.stop(now + delay + 0.28);
      });
    } catch {
      // ignore
    }
  }
}

export const romanticAudio = new RomanticAudio();

