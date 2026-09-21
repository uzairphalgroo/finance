/**
 * Institutional Web Audio API Harmonic Synthesizer
 * Low-latency acoustic feedback with automatic user-gesture unlock
 */
class SoundFxService {
  private ctx: AudioContext | null = null;
  private enabled: boolean = false;
  private lastChimeTime: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.unlockAudio();
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('click', unlock);
      };
      window.addEventListener('pointerdown', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
      window.addEventListener('click', unlock, { passive: true });
    }
  }

  public unlockAudio(): void {
    if (typeof window === 'undefined') return;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // Audio context unlock failed silently
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      this.unlockAudio();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setEnabled(val: boolean): void {
    this.enabled = val;
    if (val) {
      this.unlockAudio();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Institutional Dual-Tone Harmonic Bell for Actionable Discrepancy (>0.15%)
   * Strictly throttled to at least 12 seconds to prevent audio fatigue
   */
  public playOpportunityChime(): void {
    if (!this.enabled) return;

    // Throttle chimes to max 1 per 12 seconds
    const nowMs = Date.now();
    if (nowMs - this.lastChimeTime < 12000) return;
    this.lastChimeTime = nowMs;

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freqs = [1046.5, 1318.51];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.025, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.3 + idx * 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.04);
        osc.stop(now + 0.38);
      });
    } catch {
      // Audio playback caught safely
    }
  }

  /**
   * Crisp Millisecond Trade Execution Acoustic Confirmation
   */
  public playExecutionSound(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.05); // A6

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Audio playback caught safely
    }
  }

  /**
   * Preview Test Chime for user feedback when toggling sound
   */
  public playTestChime(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1174.66, now); // D6
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Audio playback caught safely
    }
  }
}

export const SoundFx = new SoundFxService();
