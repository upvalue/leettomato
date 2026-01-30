import { useState } from 'react';
import { PlayIcon, PauseIcon, ForwardIcon, ClockIcon } from '@heroicons/react/24/solid';

interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onNextPhase: () => void;
  onSetOffset: (ms: number) => void;
  nextPhaseLabel: string;
}

export function TimerControls({
  isRunning,
  onStart,
  onPause,
  onNextPhase,
  onSetOffset,
  nextPhaseLabel,
}: TimerControlsProps) {
  const [offsetMin, setOffsetMin] = useState(0);
  const [offsetSec, setOffsetSec] = useState(0);

  const showOffset = !isRunning;

  const handleSetOffset = () => {
    const ms = (offsetMin * 60 + offsetSec) * 1000;
    if (ms > 0) {
      onSetOffset(ms);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      <div className={`flex items-center gap-2 text-sm ${showOffset ? '' : 'invisible'}`}>
        <ClockIcon className="w-4 h-4 text-tn-muted" />
        <span className="text-tn-muted">Add time:</span>
        <input
          type="number"
          min={0}
          max={120}
          value={offsetMin}
          onChange={(e) => setOffsetMin(Math.max(0, Math.min(120, Number(e.target.value))))}
          className="w-14 px-2 py-1 bg-tn-bg text-tn-fg rounded border border-tn-muted text-center"
          tabIndex={showOffset ? 0 : -1}
        />
        <span className="text-tn-muted">m</span>
        <input
          type="number"
          min={0}
          max={59}
          value={offsetSec}
          onChange={(e) => setOffsetSec(Math.max(0, Math.min(59, Number(e.target.value))))}
          className="w-14 px-2 py-1 bg-tn-bg text-tn-fg rounded border border-tn-muted text-center"
          tabIndex={showOffset ? 0 : -1}
        />
        <span className="text-tn-muted">s</span>
        <button
          onClick={handleSetOffset}
          className="px-3 py-1 bg-tn-bg-hl text-tn-fg rounded hover:bg-opacity-80 transition-colors text-sm"
          tabIndex={showOffset ? 0 : -1}
        >
          Set
        </button>
      </div>
      <div className="flex flex-col gap-3 w-48">
        {isRunning ? (
          <button
            onClick={onPause}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-tn-bg-hl text-tn-fg rounded-lg hover:bg-opacity-80 transition-colors"
          >
            <PauseIcon className="w-5 h-5" />
            Pause
          </button>
        ) : (
          <button
            onClick={onStart}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-tn-blue text-tn-bg rounded-lg hover:bg-opacity-80 transition-colors"
          >
            <PlayIcon className="w-5 h-5" />
            Start
          </button>
        )}
        <button
          onClick={onNextPhase}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-tn-green text-tn-bg rounded-lg hover:bg-opacity-80 transition-colors"
        >
          <ForwardIcon className="w-5 h-5" />
          {nextPhaseLabel}
        </button>
      </div>
    </div>
  );
}
