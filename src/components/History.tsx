import { HistoryEntry } from '../types';
import { formatTime } from '../utils/timeFormatter';

interface HistoryProps {
  entries: HistoryEntry[];
  onDelete: (id: string) => void;
  onClear: () => void;
}

function DifficultyBadge({ difficulty }: { difficulty: 'E' | 'M' | 'H' | null }) {
  if (difficulty === null) return <span className="text-tn-muted">-</span>;

  const colors = {
    E: 'text-tn-green',
    M: 'text-tn-yellow',
    H: 'text-tn-red',
  };

  return <span className={`${colors[difficulty]} text-xs`}>{difficulty}</span>;
}

function GradeBadge({ grade }: { grade: number | null }) {
  if (grade === null) return <span className="text-tn-muted">-</span>;

  const colors: Record<number, string> = {
    1: 'text-tn-red',
    2: 'text-tn-yellow',
    3: 'text-tn-blue',
    4: 'text-tn-green',
  };

  return <span className={colors[grade]}>{grade}</span>;
}

export function History({ entries, onDelete, onClear }: HistoryProps) {
  if (entries.length === 0) return null;

  return (
    <div className="w-full max-w-xl mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg text-tn-fg">Recent Sessions</h2>
        <button
          onClick={onClear}
          className="text-xs text-tn-muted hover:text-tn-red transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="bg-tn-bg-hl rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-tn-muted text-tn-muted text-xs">
              <th className="text-left py-2 px-3">Date</th>
              <th className="text-left py-2 px-3">Problem</th>
              <th className="text-center py-2 px-3">Diff</th>
              <th className="text-center py-2 px-3">Time</th>
              <th className="text-center py-2 px-3">Grade</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {entries.slice(0, 10).map((entry) => (
              <tr key={entry.id} className="border-b border-tn-muted last:border-b-0">
                <td className="py-2 px-3 text-tn-muted text-xs">{entry.date}</td>
                <td className="py-2 px-3 text-tn-fg">
                  {entry.isLeetCode && entry.problemId && (
                    <span className="text-tn-muted">#{entry.problemId} </span>
                  )}
                  <span className="truncate">{entry.problemTitle}</span>
                </td>
                <td className="py-2 px-3 text-center">
                  <DifficultyBadge difficulty={entry.difficulty} />
                </td>
                <td className="py-2 px-3 text-center text-tn-fg tabular-nums">
                  {formatTime(entry.totalTime)}
                </td>
                <td className="py-2 px-3 text-center">
                  <GradeBadge grade={entry.grade} />
                </td>
                <td className="py-2 px-3">
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="text-tn-muted hover:text-tn-red transition-colors text-xs"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {entries.length > 10 && (
        <div className="text-xs text-tn-muted mt-2 text-center">
          Showing 10 of {entries.length} sessions
        </div>
      )}
    </div>
  );
}
