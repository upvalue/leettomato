import { useRef, useCallback, useEffect } from 'react';

function preload(src: string): HTMLAudioElement {
  const audio = new Audio(src);
  audio.preload = 'auto';
  return audio;
}

function play(audio: HTMLAudioElement) {
  // Clone for overlapping playback
  const clone = audio.cloneNode() as HTMLAudioElement;
  clone.play().catch(() => {});
}

export function useSoundEffects(enabled: boolean) {
  const startRef = useRef<HTMLAudioElement | null>(null);
  const warningRef = useRef<HTMLAudioElement | null>(null);
  const completeRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (enabled) {
      // Derive base path from current page URL to work with any deploy prefix
      const base = new URL('.', document.baseURI).pathname;
      startRef.current = preload(`${base}sounds/start.wav`);
      warningRef.current = preload(`${base}sounds/warning.wav`);
      completeRef.current = preload(`${base}sounds/complete.wav`);
    }
  }, [enabled]);

  const playStart = useCallback(() => {
    if (enabled && startRef.current) play(startRef.current);
  }, [enabled]);

  const playOverThreshold = useCallback(() => {
    if (enabled && warningRef.current) play(warningRef.current);
  }, [enabled]);

  const playComplete = useCallback(() => {
    if (enabled && completeRef.current) play(completeRef.current);
  }, [enabled]);

  return { playStart, playOverThreshold, playComplete };
}
