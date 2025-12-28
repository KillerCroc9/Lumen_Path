export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.ambientGain = null;
        this.sfxGain = null;
        this.ambientOscillators = [];
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create gain nodes for mixing
            this.ambientGain = this.audioContext.createGain();
            this.ambientGain.gain.value = 0.15;
            this.ambientGain.connect(this.audioContext.destination);
            
            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.gain.value = 0.3;
            this.sfxGain.connect(this.audioContext.destination);
            
            this.initialized = true;
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }

    playAmbient() {
        if (!this.initialized) this.init();
        if (!this.audioContext) return;

        // Create ambient pad with multiple oscillators
        const frequencies = [
            { freq: 110, detune: 0 },     // A2
            { freq: 146.83, detune: 5 },   // D3
            { freq: 164.81, detune: -5 },  // E3
            { freq: 220, detune: 0 }       // A3
        ];

        frequencies.forEach(({ freq, detune }) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.value = freq;
            oscillator.detune.value = detune;
            
            gainNode.gain.value = 0.05;
            
            oscillator.connect(gainNode);
            gainNode.connect(this.ambientGain);
            
            oscillator.start();
            this.ambientOscillators.push(oscillator);
        });

        // Add subtle wind sound with filtered noise
        this.createWindSound();
    }

    createWindSound() {
        const bufferSize = this.audioContext.sampleRate * 2;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const whiteNoise = this.audioContext.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        
        const bandpass = this.audioContext.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 500;
        bandpass.Q.value = 0.5;
        
        const windGain = this.audioContext.createGain();
        windGain.gain.value = 0.02;
        
        whiteNoise.connect(bandpass);
        bandpass.connect(windGain);
        windGain.connect(this.ambientGain);
        
        whiteNoise.start();
    }

    playBeaconActivation() {
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;
        
        // Create a pleasant chime sound
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
        
        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.value = freq;
            
            gainNode.gain.value = 0;
            gainNode.gain.setValueAtTime(0, now + index * 0.1);
            gainNode.gain.linearRampToValueAtTime(0.3, now + index * 0.1 + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.1 + 1);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.sfxGain);
            
            oscillator.start(now + index * 0.1);
            oscillator.stop(now + index * 0.1 + 1.1);
        });

        // Add a bass note
        const bass = this.audioContext.createOscillator();
        const bassGain = this.audioContext.createGain();
        
        bass.type = 'sine';
        bass.frequency.value = 130.81; // C3
        
        bassGain.gain.value = 0;
        bassGain.gain.setValueAtTime(0, now);
        bassGain.gain.linearRampToValueAtTime(0.2, now + 0.05);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
        
        bass.connect(bassGain);
        bassGain.connect(this.sfxGain);
        
        bass.start(now);
        bass.stop(now + 1.6);
    }

    playVictory() {
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;
        
        // Play a triumphant chord progression
        const progression = [
            [261.63, 329.63, 392.00], // C major
            [293.66, 369.99, 440.00], // D minor
            [329.63, 392.00, 493.88], // E minor
            [349.23, 440.00, 523.25]  // F major
        ];

        progression.forEach((chord, chordIndex) => {
            chord.forEach(freq => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.value = freq;
                
                const startTime = now + chordIndex * 0.5;
                gainNode.gain.value = 0;
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8);
                
                oscillator.connect(gainNode);
                gainNode.connect(this.sfxGain);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + 0.9);
            });
        });

        // Increase ambient volume
        this.ambientGain.gain.linearRampToValueAtTime(0.25, now + 2);
    }

    stop() {
        this.ambientOscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) {
                // Oscillator might already be stopped
            }
        });
        this.ambientOscillators = [];
    }
}
