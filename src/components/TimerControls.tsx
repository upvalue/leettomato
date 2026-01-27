interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onNextPhase: () => void;
  nextPhaseLabel: string;
}

export function TimerControls({
  isRunning,
  onStart,
  onPause,
  onNextPhase,
  nextPhaseLabel,
}: TimerControlsProps) {
  return (
    <div className="flex gap-4 justify-center mt-8">
      {isRunning ? (
        <button
          onClick={onPause}
          className="px-6 py-3 bg-tn-bg-hl text-tn-fg rounded-lg hover:bg-opacity-80 transition-colors"
        >
          Pause
        </button>
      ) : (
        <button
          onClick={onStart}
          className="px-6 py-3 bg-tn-blue text-tn-bg rounded-lg hover:bg-opacity-80 transition-colors"
        >
          Start
        </button>
      )}
      <button
        onClick={onNextPhase}
        className="px-6 py-3 bg-tn-green text-tn-bg rounded-lg hover:bg-opacity-80 transition-colors"
      >
        {nextPhaseLabel}
      </button>
    </div>
  );
}
