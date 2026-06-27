import { useState, useEffect } from 'react';

// Singleton variables to keep track of audio state globally
let globalAudio: HTMLAudioElement | null = null;
let activeTrack: string | null = null;
let fadeTimer: any = null;
let isMutedGlobal = localStorage.getItem('audio_muted') === 'true';
const listeners = new Set<(muted: boolean) => void>();

export function useAudio() {
  const [isMuted, setIsMuted] = useState(isMutedGlobal);

  useEffect(() => {
    const onChange = (muted: boolean) => setIsMuted(muted);
    listeners.add(onChange);
    return () => {
      listeners.delete(onChange);
    };
  }, []);

  const toggleMute = () => {
    const nextMuted = !isMutedGlobal;
    isMutedGlobal = nextMuted;
    localStorage.setItem('audio_muted', String(nextMuted));
    
    if (globalAudio) {
      globalAudio.muted = nextMuted;
    }
    
    listeners.forEach(listener => listener(nextMuted));
  };

  const playTrack = (trackPath: string | undefined) => {
    if (!trackPath) {
      stopAudio();
      return;
    }

    // Format path to ensure it starts with /
    const formattedPath = trackPath.startsWith('/') ? trackPath : '/' + trackPath;

    // Do nothing if the same track is already playing
    if (activeTrack === formattedPath) {
      return;
    }

    // Stop active fade timer
    if (fadeTimer) {
      clearInterval(fadeTimer);
      fadeTimer = null;
    }

    const fadeDuration = 1000; // 1 second transition
    const steps = 10;
    const stepInterval = fadeDuration / steps;

    const startNewTrack = () => {
      activeTrack = formattedPath;
      globalAudio = new Audio(formattedPath);
      globalAudio.loop = true;
      globalAudio.muted = isMutedGlobal; // Apply current mute setting
      globalAudio.volume = 0;

      globalAudio.play().then(() => {
        let currentVol = 0;
        const targetVol = 0.3; // Limit target volume for background comfort
        
        fadeTimer = setInterval(() => {
          currentVol += targetVol / steps;
          if (currentVol >= targetVol) {
            currentVol = targetVol;
            clearInterval(fadeTimer);
            fadeTimer = null;
          }
          if (globalAudio) {
            globalAudio.volume = currentVol;
          }
        }, stepInterval);
      }).catch(err => {
        console.warn('Autoplay blocked: user interaction required before playing audio.', err);
        
        // Retrying on next user interaction gesture
        const playOnInteraction = () => {
          if (globalAudio && globalAudio.paused) {
            globalAudio.play().then(() => {
              let currentVol = 0;
              const targetVol = 0.3;
              fadeTimer = setInterval(() => {
                currentVol += targetVol / steps;
                if (currentVol >= targetVol) {
                  currentVol = targetVol;
                  clearInterval(fadeTimer);
                  fadeTimer = null;
                }
                if (globalAudio) {
                  globalAudio.volume = currentVol;
                }
              }, stepInterval);
            }).catch(e => console.error("Playback failed on user gesture:", e));
          }
          document.removeEventListener('click', playOnInteraction);
          document.removeEventListener('keydown', playOnInteraction);
        };
        
        document.addEventListener('click', playOnInteraction);
        document.addEventListener('keydown', playOnInteraction);
      });
    };

    if (globalAudio) {
      // Fade out current audio
      let currentVol = globalAudio.volume;
      fadeTimer = setInterval(() => {
        currentVol -= globalAudio!.volume / steps;
        if (currentVol <= 0.05) {
          clearInterval(fadeTimer);
          fadeTimer = null;
          if (globalAudio) {
            globalAudio.pause();
          }
          globalAudio = null;
          startNewTrack();
        } else {
          if (globalAudio) {
            globalAudio.volume = currentVol;
          }
        }
      }, stepInterval);
    } else {
      startNewTrack();
    }
  };

  const stopAudio = () => {
    if (fadeTimer) {
      clearInterval(fadeTimer);
      fadeTimer = null;
    }
    if (globalAudio) {
      globalAudio.pause();
      globalAudio = null;
    }
    activeTrack = null;
  };

  return { playTrack, stopAudio, toggleMute, isMuted };
}
