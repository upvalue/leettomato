import { useState } from 'react';
import { SessionData } from '../types';
import { formatSessionAsCsv, getCsvHeader } from '../utils/csvFormatter';
import { formatTime } from '../utils/timeFormatter';

interface ResultsProps {
  session: SessionData;
  onReset: () => void;
}

function DifficultyBadge({ difficulty }: { difficulty: 'E' | 'M' | 'H' | null }) {
  if (difficulty === null) return <span className="text-tn-muted">-</span>;

  const colors = {
    E: 'text-tn-green',
    M: 'text-tn-yellow',
    H: 'text-tn-red',
  };
  const labels = { E: 'Easy', M: 'Medium', H: 'Hard' };

  return <span className={colors[difficulty]}>{labels[difficulty]}</span>;
}

function GradeBadge({ grade }: { grade: number | null }) {
  if (grade === null) return <span className="text-tn-muted">-</span>;

  const colors: Record<number, string> = {
    1: 'text-tn-red',
    2: 'text-tn-yellow',
    3: 'text-tn-blue',
    4: 'text-tn-green',
  };

  return <span className={`${colors[grade]} font-bold`}>{grade}/4</span>;
}

export function Results({ session, onReset }: ResultsProps) {
  const [copied, setCopied] = useState(false);
  const [showHeader, setShowHeader] = useState(false);

  if (!session.problem) return null;

  const { problem, designTime, codingTime, designOverThreshold, codingOverThreshold, grade, notes } =
    session;
  const totalTime = designTime + codingTime;

  const handleCopy = async () => {
    const csv = showHeader
      ? `${getCsvHeader()}\n${formatSessionAsCsv(session)}`
      : formatSessionAsCsv(session);

    try {
      await navigator.clipboard.writeText(csv);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="w-full max-w-xl">
      <h2 className="text-xl text-tn-fg mb-4">Session Complete</h2>

      <div className="bg-tn-bg-hl rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span>
            {problem.isLeetCode && problem.frontendId && (
              <span className="text-tn-muted">#{problem.frontendId} </span>
            )}
            <span className="text-tn-fg font-medium">{problem.title}</span>
            {!problem.isLeetCode && (
              <span className="text-tn-muted text-sm ml-2">(custom)</span>
            )}
          </span>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>

        <div className="grid grid-cols-3 gap-4 py-3 border-t border-tn-muted">
          <div className="text-center">
            <div className="text-tn-muted text-xs uppercase">Design</div>
            <div className={`text-lg ${designOverThreshold ? 'text-tn-red' : 'text-tn-fg'}`}>
              {formatTime(designTime)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-tn-muted text-xs uppercase">Coding</div>
            <div className={`text-lg ${codingOverThreshold ? 'text-tn-red' : 'text-tn-fg'}`}>
              {formatTime(codingTime)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-tn-muted text-xs uppercase">Total</div>
            <div className="text-lg text-tn-fg">{formatTime(totalTime)}</div>
          </div>
        </div>

        <div className="py-3 border-t border-tn-muted">
          <div className="flex justify-between items-center">
            <span className="text-tn-muted">Grade:</span>
            <GradeBadge grade={grade} />
          </div>
        </div>

        {notes && (
          <div className="py-3 border-t border-tn-muted">
            <div className="text-tn-muted text-xs uppercase mb-1">Notes</div>
            <div className="text-tn-fg text-sm whitespace-pre-wrap">{notes}</div>
          </div>
        )}

        {problem.topics.length > 0 && (
          <div className="pt-3 border-t border-tn-muted text-xs text-tn-muted">
            {problem.topics.join(', ')}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <label className="flex items-center gap-2 text-sm text-tn-muted cursor-pointer">
          <input
            type="checkbox"
            checked={showHeader}
            onChange={(e) => setShowHeader(e.target.checked)}
            className="rounded"
          />
          Include header row
        </label>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleCopy}
          className="flex-1 py-3 bg-tn-blue text-tn-bg rounded-lg hover:bg-opacity-80 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
        <button
          onClick={onReset}
          className="flex-1 py-3 bg-tn-bg-hl text-tn-fg rounded-lg hover:bg-opacity-80 transition-colors"
        >
          New Session
        </button>
      </div>
    </div>
  );
}
