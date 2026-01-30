import type { Problem } from "../types";
import { DifficultyBadge } from "./DifficultyBadge";
import { TopicTag } from "./TopicTag";

interface Props {
  problem: Problem;
}

export function ProblemDetail({ problem }: Props) {
  const leetcodeUrl = `https://leetcode.com/problems/${problem.slug}/`;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-fg-muted font-mono">#{problem.source_id}</span>
          <h1 className="text-2xl font-bold text-fg-bright">{problem.title}</h1>
          <DifficultyBadge difficulty={problem.difficulty} size="md" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {problem.topics.map((t) => (
            <TopicTag key={t} name={t} />
          ))}
          <a
            href={leetcodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-tn-blue hover:text-tn-purple transition-colors ml-2 border-b border-tn-blue/30 hover:border-tn-purple/30"
          >
            View on LeetCode
          </a>
        </div>
      </div>

      {problem.description && (
        <section className="bg-bg-surface border border-border rounded-xl p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-muted mb-3">
            Description
          </h2>
          <div className="text-fg-main whitespace-pre-wrap leading-relaxed">
            {problem.description}
          </div>
        </section>
      )}

      {problem.examples.length > 0 && (
        <section className="bg-bg-surface border border-border rounded-xl p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-muted mb-3">
            Examples
          </h2>
          <div className="space-y-3">
            {problem.examples.map((ex, i) => (
              <pre
                key={i}
                className="text-sm text-fg-main whitespace-pre-wrap bg-bg-main border border-border rounded-lg p-4"
              >
                {ex.example_text}
              </pre>
            ))}
          </div>
        </section>
      )}

      {problem.constraints.length > 0 && (
        <section className="bg-bg-surface border border-border rounded-xl p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-muted mb-3">
            Constraints
          </h2>
          <ul className="list-disc list-inside text-sm text-fg-main space-y-1">
            {problem.constraints.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </section>
      )}

      {problem.python3_snippet && (
        <section className="bg-bg-surface border border-border rounded-xl p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-muted mb-3">
            Function Signature
          </h2>
          <pre className="text-sm text-tn-green bg-bg-main border border-border rounded-lg p-4 overflow-x-auto">
            {problem.python3_snippet}
          </pre>
        </section>
      )}

      {problem.hints.length > 0 && (
        <details className="bg-bg-surface border border-border rounded-xl p-5 group">
          <summary className="text-xs font-semibold uppercase tracking-wider text-fg-muted cursor-pointer select-none">
            Hints ({problem.hints.length})
          </summary>
          <ul className="mt-3 space-y-2">
            {problem.hints.map((h, i) => (
              <li
                key={i}
                className="text-sm text-fg-main pl-4 border-l-2 border-tn-purple/30"
                dangerouslySetInnerHTML={{ __html: h }}
              />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
