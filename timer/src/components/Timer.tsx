import { formatTime } from '../utils/timeFormatter';

interface TimerProps {
  elapsed: number;
  isOverThreshold: boolean;
  isRunning: boolean;
  label: string;
}

export function Timer({ elapsed, isOverThreshold, isRunning, label }: TimerProps) {
  return (
    <div className="text-center">
      <div className="text-tn-muted text-sm uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
        <span className={`relative flex h-3 w-3 ${isRunning ? '' : 'invisible'}`}>
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tn-red opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-tn-red"></span>
        </span>
        {label}
      </div>
      <div
        className={`text-6xl font-bold tabular-nums ${
          isOverThreshold ? 'text-tn-red' : 'text-tn-fg'
        }`}
      >
        {formatTime(elapsed)}
      </div>
      <div className={`text-tn-red text-sm mt-2 ${isOverThreshold ? '' : 'invisible'}`}>
        Over time limit!
      </div>
    </div>
  );
}
