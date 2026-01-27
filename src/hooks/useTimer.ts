import { useState, useRef, useCallback, useEffect } from 'react';

interface UseTimerOptions {
  warningThresholdMs: number;
}

interface UseTimerReturn {
  elapsed: number;
  isRunning: boolean;
  isOverThreshold: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  getElapsed: () => number;
}

export function useTimer({ warningThresholdMs }: UseTimerOptions): UseTimerReturn {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const intervalRef = useRef<number | null>(null);

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
    setElapsed(0);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        if (startTimeRef.current !== null) {
          setElapsed(accumulatedRef.current + (Date.now() - startTimeRef.current));
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
  };
}
