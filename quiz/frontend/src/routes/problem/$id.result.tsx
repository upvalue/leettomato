import { useParams, Link } from "@tanstack/react-router";
import { GradingResult } from "../../components/GradingResult";
import type { GradingResult as GradingResultType } from "../../types";

export function ResultPage() {
  const { id } = useParams({ from: "/problem/$id/result" });

  const stored = sessionStorage.getItem(`grade-result-${id}`);
  if (!stored) {
    return (
      <div className="text-center py-16">
        <p className="text-fg-muted text-lg mb-4">No grading result found.</p>
        <Link
          to="/problem/$id"
          params={{ id }}
          className="text-tn-blue hover:text-tn-purple transition-colors border-b border-tn-blue/30"
        >
          Go back to problem
        </Link>
      </div>
    );
  }

  const result: GradingResultType = JSON.parse(stored);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-fg-bright">Grading Results</h1>
        <div className="flex gap-3">
          <Link
            to="/problem/$id"
            params={{ id }}
            className="px-4 py-2 bg-bg-surface border border-border rounded-xl text-fg-muted hover:text-fg-main hover:border-fg-muted transition-colors"
          >
            Try Again
          </Link>
          <Link
            to="/"
            className="px-4 py-2 bg-gradient-to-r from-tn-blue to-tn-purple text-bg-main font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-tn-blue/20"
          >
            Try Another
          </Link>
        </div>
      </div>
      <GradingResult result={result} />
    </div>
  );
}
