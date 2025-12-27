
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export type SoundType = 'click' | 'correct' | 'wrong' | 'win' | 'lose' | 'pop' | 'shoot' | 'hover';

interface SoundContextType {
  playSound: (type: SoundType) => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const SoundContext = createContext<SoundContextType>({
  playSound: (_type: SoundType) => {},
  isMuted: false,
  toggleMute: () => {},
});

export const useSound = () => useContext(SoundContext);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize Audio Context on user interaction or mount
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtxRef.current = new AudioContextClass();
    }
  }, []);

  const playTone = (freq: number, type: OscillatorType, duration: number, startTime: number = 0, vol: number = 0.1) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);
  };

  const playNoise = (duration: number) => {
     if (!audioCtxRef.current) return;
     const ctx = audioCtxRef.current;
     const bufferSize = ctx.sampleRate * duration;
     const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
     const data = buffer.getChannelData(0);
     
     for (let i = 0; i < bufferSize; i++) {
         data[i] = Math.random() * 2 - 1;
     }

     const noise = ctx.createBufferSource();
     noise.buffer = buffer;
     const gain = ctx.createGain();
     
     gain.gain.setValueAtTime(0.05, ctx.currentTime);
     gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
     
     noise.connect(gain);
     gain.connect(ctx.destination);
     noise.start();
  };

  const playSound = useCallback((type: SoundType) => {
    if (isMuted || !audioCtxRef.current) return;
    
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }

    switch (type) {
      case 'click':
        playTone(800, 'sine', 0.05, 0, 0.05);
        break;
      case 'hover':
        playTone(400, 'sine', 0.02, 0, 0.02);
        break;
      case 'pop':
        playTone(600, 'sine', 0.1, 0, 0.1);
        playTone(1000, 'sine', 0.1, 0.05, 0.1);
        break;
      case 'shoot':
        playNoise(0.15);
        playTone(150, 'sawtooth', 0.15, 0, 0.1);
        break;
      case 'correct':
        playTone(523.25, 'sine', 0.2, 0, 0.1); // C5
        playTone(659.25, 'sine', 0.2, 0.1, 0.1); // E5
        playTone(783.99, 'sine', 0.4, 0.2, 0.1); // G5
        break;
      case 'wrong':
        playTone(150, 'sawtooth', 0.2, 0, 0.1);
        playTone(100, 'sawtooth', 0.4, 0.1, 0.1);
        break;
      case 'win':
        [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50].forEach((freq, i) => {
            playTone(freq, 'square', 0.3, i * 0.15, 0.05);
        });
        break;
      case 'lose':
        [300, 280, 260, 240].forEach((freq, i) => {
            playTone(freq, 'triangle', 0.4, i * 0.2, 0.1);
        });
        break;
    }
  }, [isMuted]);

  const toggleMute = () => setIsMuted(prev => !prev);

  return (
    <SoundContext.Provider value={{ playSound, isMuted, toggleMute }}>
      {children}
    </SoundContext.Provider>
  );
};

export default SoundProvider;
