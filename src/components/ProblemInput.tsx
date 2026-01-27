import { useState, useRef, useEffect } from 'react';
import { Problem } from '../types';
import { useProblemSearch } from '../hooks/useProblemSearch';

interface ProblemInputProps {
  onSelect: (problem: Problem) => void;
  disabled?: boolean;
}

function DifficultyBadge({ difficulty }: { difficulty: 'E' | 'M' | 'H' | null }) {
  if (difficulty === null) return null;

  const colors = {
    E: 'text-tn-green',
    M: 'text-tn-yellow',
    H: 'text-tn-red',
  };
  const labels = { E: 'Easy', M: 'Medium', H: 'Hard' };

  return (
    <span className={`${colors[difficulty]} text-sm`}>
      {labels[difficulty]}
    </span>
  );
}

export function ProblemInput({ onSelect, disabled }: ProblemInputProps) {
  const { query, setQuery, results, selectedProblem, selectProblem, selectFreeform, clearSelection } =
    useProblemSearch();
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedProblem) {
      onSelect(selectedProblem);
    }
  }, [selectedProblem, onSelect]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowDropdown(true);
    if (selectedProblem && e.target.value !== selectedProblem.title) {
      clearSelection();
    }
  };

  const handleSelect = (problem: Problem) => {
    selectProblem(problem);
    setShowDropdown(false);
  };

  const handleUseFreeform = () => {
    selectFreeform();
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim() && !selectedProblem) {
      if (results.length > 0) {
        handleSelect(results[0]);
      } else {
        handleUseFreeform();
      }
    }
  };

  return (
    <div className="relative w-full max-w-xl">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => setShowDropdown(true)}
        onKeyDown={handleKeyDown}
        placeholder="Enter LeetCode URL, problem # or name..."
        disabled={disabled}
        className="w-full px-4 py-3 bg-tn-bg-hl text-tn-fg rounded-lg border border-tn-muted focus:border-tn-blue focus:outline-none placeholder-tn-muted disabled:opacity-50"
      />

      {showDropdown && query.trim() && !selectedProblem && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-tn-bg-hl border border-tn-muted rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {results.map((problem) => (
            <button
              key={problem.slug}
              onClick={() => handleSelect(problem)}
              className="w-full px-4 py-3 text-left hover:bg-tn-bg transition-colors border-b border-tn-muted"
            >
              <div className="flex items-center justify-between">
                <span className="text-tn-fg">
                  <span className="text-tn-muted">#{problem.frontendId}</span>{' '}
                  {problem.title}
                </span>
                <DifficultyBadge difficulty={problem.difficulty} />
              </div>
              <div className="text-xs text-tn-muted mt-1">
                {problem.topics.slice(0, 3).join(', ')}
              </div>
            </button>
          ))}

          {/* Freeform option */}
          <button
            onClick={handleUseFreeform}
            className="w-full px-4 py-3 text-left hover:bg-tn-bg transition-colors border-t border-tn-muted"
          >
            <div className="flex items-center justify-between">
              <span className="text-tn-fg">
                Use "<span className="text-tn-blue">{query}</span>" as custom problem
              </span>
              <span className="text-tn-muted text-sm">Enter</span>
            </div>
          </button>
        </div>
      )}

      {selectedProblem && (
        <div className="mt-3 p-3 bg-tn-bg-hl rounded-lg">
          <div className="flex items-center justify-between">
            <span>
              {selectedProblem.isLeetCode && selectedProblem.frontendId && (
                <span className="text-tn-muted">#{selectedProblem.frontendId} </span>
              )}
              <span className="text-tn-fg font-medium">{selectedProblem.title}</span>
              {!selectedProblem.isLeetCode && (
                <span className="text-tn-muted text-sm ml-2">(custom)</span>
              )}
            </span>
            <DifficultyBadge difficulty={selectedProblem.difficulty} />
          </div>
          {selectedProblem.topics.length > 0 && (
            <div className="text-xs text-tn-muted mt-1">
              {selectedProblem.topics.join(', ')}
            </div>
          )}
          {selectedProblem.url && (
            <a
              href={selectedProblem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-tn-blue hover:underline mt-1 block"
            >
              Open on LeetCode
            </a>
          )}
        </div>
      )}
    </div>
  );
}
