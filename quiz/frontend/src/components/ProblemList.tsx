import { Link } from "@tanstack/react-router";
import type { ProblemSummary } from "../types";
import { DifficultyBadge } from "./DifficultyBadge";
import { TopicTag } from "./TopicTag";

interface Props {
  problems: ProblemSummary[];
  total: number;
  offset: number;
  limit: number;
  onPageChange: (offset: number) => void;
}

const diffBorder = {
  Easy: "border-l-tn-green",
  Medium: "border-l-tn-yellow",
  Hard: "border-l-tn-red",
} as const;

export function ProblemList({
  problems,
  total,
  offset,
  limit,
  onPageChange,
}: Props) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="space-y-1.5">
        {problems.map((p) => (
          <Link
            key={p.id}
            to="/problem/$id"
            params={{ id: String(p.id) }}
            className={`block bg-bg-surface border border-border border-l-2 ${diffBorder[p.difficulty]} rounded-lg px-4 py-3 hover:bg-bg-elevated hover:border-border transition-all group`}
          >
            <div className="flex items-center gap-3">
              <span className="text-fg-muted text-xs font-mono w-12 shrink-0">
                #{p.source_id}
              </span>
              <span className="flex-1 text-fg-main group-hover:text-fg-bright transition-colors">
                {p.title}
              </span>
              <DifficultyBadge difficulty={p.difficulty} />
            </div>
            {p.topics.length > 0 && (
              <div className="flex gap-1 mt-2 ml-15 flex-wrap">
                {p.topics.map((t) => (
                  <TopicTag key={t} name={t} />
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>

      {problems.length === 0 && (
        <div className="text-center text-fg-muted py-16">
          <p className="text-lg mb-1">No problems found.</p>
          <p className="text-sm">Try adjusting your search or filters.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <button
            onClick={() => onPageChange(Math.max(0, offset - limit))}
            disabled={offset === 0}
            className="px-4 py-2 bg-bg-surface border border-border rounded-lg text-fg-muted hover:text-fg-main hover:border-fg-muted disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-fg-muted text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(offset + limit)}
            disabled={offset + limit >= total}
            className="px-4 py-2 bg-bg-surface border border-border rounded-lg text-fg-muted hover:text-fg-main hover:border-fg-muted disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
