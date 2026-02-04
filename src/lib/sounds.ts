// Sound Effects Manager
// Uses Web Audio API for lightweight sound effects

type SoundEffect = 'click' | 'success' | 'error' | 'levelUp' | 'achievement' | 'xp' | 'complete';

class SoundManager {
    private audioContext: AudioContext | null = null;
    private enabled: boolean = true;
    private volume: number = 0.3;

    constructor() {
        if (typeof window !== 'undefined') {
            this.enabled = localStorage.getItem('soundEnabled') !== 'false';
            this.volume = parseFloat(localStorage.getItem('soundVolume') || '0.3');
        }
    }

    private getContext(): AudioContext {
        if (!this.audioContext) {
            this.audioContext = new AudioContext();
        }
        return this.audioContext;
    }

    private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', rampDown = true) {
        if (!this.enabled) return;

        const ctx = this.getContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
        gainNode.gain.setValueAtTime(this.volume, ctx.currentTime);

        if (rampDown) {
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        }

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    }

    play(effect: SoundEffect) {
        if (!this.enabled) return;

        switch (effect) {
            case 'click':
                this.playTone(800, 0.05, 'sine');
                break;
            case 'success':
                this.playTone(523, 0.1, 'sine');
                setTimeout(() => this.playTone(659, 0.1, 'sine'), 100);
                setTimeout(() => this.playTone(784, 0.15, 'sine'), 200);
                break;
            case 'error':
                this.playTone(200, 0.2, 'sawtooth');
                break;
            case 'levelUp':
                [523, 659, 784, 1047].forEach((freq, i) => {
                    setTimeout(() => this.playTone(freq, 0.15, 'sine'), i * 100);
                });
                break;
            case 'achievement':
                this.playTone(880, 0.1, 'sine');
                setTimeout(() => this.playTone(1175, 0.15, 'sine'), 100);
                setTimeout(() => this.playTone(1319, 0.2, 'sine'), 200);
                break;
            case 'xp':
                this.playTone(1200, 0.08, 'sine');
                break;
            case 'complete':
                this.playTone(600, 0.1, 'triangle');
                setTimeout(() => this.playTone(800, 0.15, 'triangle'), 100);
                break;
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('soundEnabled', String(this.enabled));
        return this.enabled;
    }

    setVolume(vol: number) {
        this.volume = Math.max(0, Math.min(1, vol));
        localStorage.setItem('soundVolume', String(this.volume));
    }

    isEnabled() {
        return this.enabled;
    }

    getVolume() {
        return this.volume;
    }
}

export const soundManager = new SoundManager();
