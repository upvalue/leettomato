import type { GradingResult as GradingResultType } from "../types";

interface Props {
  result: GradingResultType;
}

const criteriaLabels = [
  { key: "pattern_identified" as const, label: "Pattern Identified", desc: "Correct algorithmic technique" },
  { key: "solution_works" as const, label: "Solution Works", desc: "Produces correct results" },
  { key: "complexity_analysis" as const, label: "Complexity Analysis", desc: "Time and space stated correctly" },
  { key: "optimal_solution" as const, label: "Optimal Solution", desc: "Best known time complexity" },
];

export function GradingResult({ result }: Props) {
  const score = criteriaLabels.filter((c) => result[c.key].score).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-6 bg-bg-surface border border-border rounded-xl">
        <div className="text-4xl font-bold bg-gradient-to-r from-tn-blue to-tn-purple bg-clip-text text-transparent">
          {score}/4
        </div>
        <div>
          <div className="text-fg-bright font-medium">
            {score === 4 ? "Excellent" : score >= 3 ? "Good" : score >= 2 ? "Partial" : score >= 1 ? "Needs Work" : "Incorrect"}
          </div>
          <div className="text-sm text-fg-muted">criteria passed</div>
        </div>
        <div className="ml-auto flex gap-1.5">
          {criteriaLabels.map(({ key }) => (
            <div
              key={key}
              className={`w-3 h-3 rounded-full ${result[key].score ? "bg-tn-green" : "bg-tn-red/50"}`}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {criteriaLabels.map(({ key, label, desc }) => {
          const criterion = result[key];
          return (
            <div
              key={key}
              className={`bg-bg-surface border rounded-xl p-4 ${
                criterion.score ? "border-tn-green/30" : "border-tn-red/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-sm font-bold ${
                    criterion.score
                      ? "bg-tn-green/15 text-tn-green"
                      : "bg-tn-red/15 text-tn-red"
                  }`}
                >
                  {criterion.score ? "\u2713" : "\u2717"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-fg-bright">{label}</span>
                    <span className="text-xs text-fg-muted">{desc}</span>
                  </div>
                  <p className="text-sm text-fg-muted mt-1 leading-relaxed">
                    {criterion.comment}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-bg-surface border border-border rounded-xl p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-fg-muted mb-3">
          Overall Feedback
        </h3>
        <p className="text-fg-main leading-relaxed">
          {result.overall_feedback}
        </p>
      </div>
    </div>
  );
}
