import { useState, useEffect, useCallback, useRef } from "react";
import { ProblemSearch } from "../components/ProblemSearch";
import { ProblemList } from "../components/ProblemList";
import { listProblems } from "../api/client";
import type { ProblemSummary } from "../types";

const DIFFICULTIES = [
  { value: "Easy", color: "text-tn-green border-tn-green/40 bg-tn-green/10" },
  {
    value: "Medium",
    color: "text-tn-yellow border-tn-yellow/40 bg-tn-yellow/10",
  },
  { value: "Hard", color: "text-tn-red border-tn-red/40 bg-tn-red/10" },
] as const;

export function HomePage() {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 50;

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const fetchProblems = useCallback(
    async (q: string, diff: string, off: number) => {
      setLoading(true);
      try {
        const res = await listProblems({
          q: q || undefined,
          difficulty: diff || undefined,
          limit,
          offset: off,
        });
        setProblems(res.problems);
        setTotal(res.total);
      } catch (err) {
        console.error("Failed to fetch problems:", err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setOffset(0);
      fetchProblems(query, difficulty, 0);
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, difficulty, fetchProblems]);

  // Page change (no debounce)
  const handlePageChange = useCallback(
    (newOffset: number) => {
      setOffset(newOffset);
      fetchProblems(query, difficulty, newOffset);
    },
    [query, difficulty, fetchProblems],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg-bright mb-1">Problems</h1>
        <p className="text-sm text-fg-muted">
          Search for a problem, write your solution approach, and get
          LLM-graded feedback.
        </p>
      </div>

      <ProblemSearch value={query} onChange={setQuery} />

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setDifficulty("")}
          className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
            difficulty === ""
              ? "bg-tn-blue/15 text-tn-blue border-tn-blue/40"
              : "bg-transparent text-fg-muted border-border hover:text-fg-main hover:border-fg-muted"
          }`}
        >
          All
        </button>
        {DIFFICULTIES.map((d) => (
          <button
            key={d.value}
            onClick={() =>
              setDifficulty(difficulty === d.value ? "" : d.value)
            }
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              difficulty === d.value
                ? d.color
                : "bg-transparent text-fg-muted border-border hover:text-fg-main hover:border-fg-muted"
            }`}
          >
            {d.value}
          </button>
        ))}

        {!loading && (
          <span className="ml-auto text-xs text-fg-muted self-center">
            {total} problems
          </span>
        )}
      </div>

      {loading ? (
        <div className="text-center text-fg-muted py-16">
          <div className="inline-block w-5 h-5 border-2 border-fg-muted border-t-tn-blue rounded-full animate-spin mb-3" />
          <p>Loading problems...</p>
        </div>
      ) : (
        <ProblemList
          problems={problems}
          total={total}
          offset={offset}
          limit={limit}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
