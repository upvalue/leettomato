import { useState } from 'react';

interface ChecklistProps {
  onComplete: (grade: number, notes: string) => void;
}

export function Checklist({ onComplete }: ChecklistProps) {
  const [grade, setGrade] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (grade !== null) {
      onComplete(grade, notes);
    }
  };

  return (
    <div className="w-full max-w-xl">
      <h2 className="text-xl text-tn-fg mb-4">Self-Grading</h2>

      <div className="bg-tn-bg-hl rounded-lg p-4 mb-4">
        <div className="text-tn-muted text-sm mb-3">How did you do overall?</div>
        <div className="flex gap-3 justify-center">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => setGrade(n)}
              className={`w-14 h-14 rounded-lg text-xl font-bold transition-colors ${
                grade === n
                  ? 'bg-tn-blue text-tn-bg'
                  : 'bg-tn-bg text-tn-muted hover:text-tn-fg'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-tn-muted mt-2 px-2">
          <span>Struggled</span>
          <span>Nailed it</span>
        </div>
      </div>

      <div className="bg-tn-bg-hl rounded-lg p-4 mb-4">
        <label className="text-tn-muted text-sm block mb-2">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What went well? What to improve?"
          className="w-full px-3 py-2 bg-tn-bg text-tn-fg rounded-lg border border-tn-muted focus:border-tn-blue focus:outline-none placeholder-tn-muted resize-none"
          rows={3}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={grade === null}
        className={`w-full py-3 rounded-lg transition-colors ${
          grade !== null
            ? 'bg-tn-blue text-tn-bg hover:bg-opacity-80'
            : 'bg-tn-bg-hl text-tn-muted cursor-not-allowed'
        }`}
      >
        Complete
      </button>
    </div>
  );
}
