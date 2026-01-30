import { useState, useRef, useCallback, useEffect } from 'react';

interface UseTimerOptions {
  warningThresholdMs: number;
  onThresholdCrossed?: () => void;
}

interface UseTimerReturn {
  elapsed: number;
  isRunning: boolean;
  isOverThreshold: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  getElapsed: () => number;
  setInitialOffset: (ms: number) => void;
}

export function useTimer({ warningThresholdMs, onThresholdCrossed }: UseTimerOptions): UseTimerReturn {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const thresholdFiredRef = useRef(false);
  const onThresholdCrossedRef = useRef(onThresholdCrossed);
  onThresholdCrossedRef.current = onThresholdCrossed;

  const getElapsed = useCallback(() => {
    if (isRunning && startTimeRef.current !== null) {
      return accumulatedRef.current + (Date.now() - startTimeRef.current);
    }
    return accumulatedRef.current;
  }, [isRunning]);

  const start = useCallback(() => {
    if (!isRunning) {
      startTimeRef.current = Date.now();
      setIsRunning(true);
    }
  }, [isRunning]);

  const pause = useCallback(() => {
    if (isRunning && startTimeRef.current !== null) {
      accumulatedRef.current += Date.now() - startTimeRef.current;
      startTimeRef.current = null;
      setIsRunning(false);
      setElapsed(accumulatedRef.current);
    }
  }, [isRunning]);

  const reset = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
    accumulatedRef.current = 0;
    thresholdFiredRef.current = false;
    setElapsed(0);
    setIsRunning(false);
  }, []);

  const setInitialOffset = useCallback((ms: number) => {
    accumulatedRef.current += ms;
    setElapsed(accumulatedRef.current);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        if (startTimeRef.current !== null) {
          const now = accumulatedRef.current + (Date.now() - startTimeRef.current);
          setElapsed(now);
          if (!thresholdFiredRef.current && now > warningThresholdMs) {
            thresholdFiredRef.current = true;
            onThresholdCrossedRef.current?.();
          }
        }
      }, 100);
    } else if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const isOverThreshold = elapsed > warningThresholdMs;

  return {
    elapsed,
    isRunning,
    isOverThreshold,
    start,
    pause,
    reset,
    getElapsed,
    setInitialOffset,
  };
}
