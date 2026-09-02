import { SoundType, AmbientSoundType } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a rich synthesized alarm / chime sound
 */
export function playSynthesizedSound(type: SoundType, volume: number = 0.7) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(Math.max(0.01, Math.min(volume, 1.0)), now);
    gainNode.connect(ctx.destination);

    switch (type) {
      case 'bell': {
        // High quality melodic bell (triad chime)
        const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          noteGain.gain.setValueAtTime(0.4, now + idx * 0.12);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.8);
          osc.connect(noteGain);
          noteGain.connect(gainNode);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 1.8);
        });
        break;
      }
      case 'zen': {
        // Tibetan Singing Bowl harmonic tone
        const fundamental = 220; // A3
        const harmonics = [1, 2.76, 5.4, 8.9];
        const weights = [0.6, 0.3, 0.15, 0.08];

        harmonics.forEach((mult, idx) => {
          const osc = ctx.createOscillator();
          const hGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(fundamental * mult, now);
          hGain.gain.setValueAtTime(weights[idx], now);
          hGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);
          osc.connect(hGain);
          hGain.connect(gainNode);
          osc.start(now);
          osc.stop(now + 3.5);
        });
        break;
      }
      case 'synth': {
        // Futuristic Cyberpunk Synth Chime
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();

        osc1.type = 'sawtooth';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(440, now);
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.3);
        osc2.frequency.setValueAtTime(444, now);
        osc2.frequency.exponentialRampToValueAtTime(888, now + 0.3);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1500, now);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.8);

        const envGain = ctx.createGain();
        envGain.gain.setValueAtTime(0.5, now);
        envGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(envGain);
        envGain.connect(gainNode);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.8);
        osc2.stop(now + 0.8);
        break;
      }
      case 'energetic': {
        // Urgent 3-beep alarm burst
        [0, 0.18, 0.36].forEach((offset) => {
          const osc = ctx.createOscillator();
          const bGain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(880, now + offset);
          osc.frequency.setValueAtTime(1174.66, now + offset + 0.08); // D6
          bGain.gain.setValueAtTime(0.3, now + offset);
          bGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.15);
          osc.connect(bGain);
          bGain.connect(gainNode);
          osc.start(now + offset);
          osc.stop(now + offset + 0.15);
        });
        break;
      }
      case 'radar': {
        // Sonar ping
        const osc = ctx.createOscillator();
        const rGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.4);
        rGain.gain.setValueAtTime(0.5, now);
        rGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(rGain);
        rGain.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.8);
        break;
      }
      case 'gentle':
      default: {
        // Warm soft woodblock / marimba pluck
        const chord = [440, 554.37, 659.25]; // A major
        chord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          gGain.gain.setValueAtTime(0.3, now + idx * 0.05);
          gGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 1.2);
          osc.connect(gGain);
          gGain.connect(gainNode);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 1.2);
        });
        break;
      }
    }
  } catch (err) {
    console.warn("Audio synthesis error:", err);
  }
}

/**
 * Play a satisfying click / completion pop
 */
export function playCompletionPop(volume: number = 0.5) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

    gain.gain.setValueAtTime(volume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  } catch (e) {
    console.warn(e);
  }
}

// Ambient Noise Generator Nodes
let ambientSource: AudioNode | null = null;
let ambientGain: GainNode | null = null;

export function stopAmbientSound() {
  if (ambientSource) {
    try {
      if ('stop' in ambientSource && typeof ambientSource.stop === 'function') {
        ambientSource.stop();
      }
      ambientSource.disconnect();
    } catch {
      // ignore
    }
    ambientSource = null;
  }
  if (ambientGain) {
    ambientGain.disconnect();
    ambientGain = null;
  }
}

export function startAmbientSound(type: AmbientSoundType, volume: number = 0.3) {
  stopAmbientSound();
  if (type === 'none') return;

  try {
    const ctx = getAudioContext();
    ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(Math.max(0.01, volume), ctx.currentTime);
    ambientGain.connect(ctx.destination);

    if (type === 'whitenoise' || type === 'rain') {
      // 5-second buffer of filtered noise looped
      const bufferSize = ctx.sampleRate * 4;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'rain') {
          // Pink/Brown noise filter for rain texture
          lastOut = (lastOut + 0.02 * white) / 1.02;
          output[i] = lastOut * 3.5;
        } else {
          output[i] = white * 0.2;
        }
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
      filter.frequency.setValueAtTime(type === 'rain' ? 800 : 1200, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(ambientGain);
      whiteNoise.start();
      ambientSource = whiteNoise;
    } else if (type === 'binaural' || type === 'zen_drone') {
      // Binaural alpha wave (200Hz left, 210Hz right -> 10Hz brainwave entrainment)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'sine';

      const baseFreq = type === 'zen_drone' ? 108 : 200;
      osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc2.frequency.setValueAtTime(baseFreq + (type === 'zen_drone' ? 2 : 10), ctx.currentTime);

      const merger = ctx.createChannelMerger(2);
      osc1.connect(merger, 0, 0);
      osc2.connect(merger, 0, 1);

      merger.connect(ambientGain);
      osc1.start();
      osc2.start();

      ambientSource = {
        stop: () => {
          osc1.stop();
          osc2.stop();
        },
        disconnect: () => {
          osc1.disconnect();
          osc2.disconnect();
          merger.disconnect();
        }
      } as unknown as AudioNode;
    }
  } catch (err) {
    console.warn("Could not start ambient audio:", err);
  }
}

export function updateAmbientVolume(volume: number) {
  if (ambientGain && audioCtx) {
    ambientGain.gain.setValueAtTime(Math.max(0, Math.min(volume, 1)), audioCtx.currentTime);
  }
}
