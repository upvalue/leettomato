import { formatTime } from '../utils/timeFormatter';

interface TimerProps {
  elapsed: number;
  isOverThreshold: boolean;
  label: string;
}

export function Timer({ elapsed, isOverThreshold, label }: TimerProps) {
  return (
    <div className="text-center">
      <div className="text-tn-muted text-sm uppercase tracking-wider mb-2">
        {label}
      </div>
      <div
        className={`text-6xl font-bold tabular-nums ${
          isOverThreshold ? 'text-tn-red' : 'text-tn-fg'
        }`}
      >
        {formatTime(elapsed)}
      </div>
      {isOverThreshold && (
        <div className="text-tn-red text-sm mt-2">Over time limit!</div>
      )}
    </div>
  );
}
