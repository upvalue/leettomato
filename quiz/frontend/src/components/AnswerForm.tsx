import { useState } from "react";

interface Props {
  onSubmit: (answer: string) => void;
  loading: boolean;
}

export function AnswerForm({ onSubmit, loading }: Props) {
  const [answer, setAnswer] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-fg-muted mb-3">
          Your Solution (text/pseudocode)
        </label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={12}
          placeholder={`Describe your approach:
- What pattern/algorithm would you use?
- Walk through the steps of your solution
- What is the time and space complexity?
- Is this the optimal approach?`}
          className="w-full bg-bg-main border border-border rounded-xl px-4 py-3 text-fg-main placeholder-fg-muted focus:outline-none focus:border-tn-blue focus:ring-1 focus:ring-tn-blue/30 transition-all resize-y font-mono text-sm leading-relaxed"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        disabled={!answer.trim() || loading}
        className="px-6 py-3 bg-gradient-to-r from-tn-blue to-tn-purple text-bg-main font-semibold rounded-xl hover:opacity-90 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-lg shadow-tn-blue/20"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-bg-main border-t-transparent rounded-full animate-spin" />
            Grading...
          </span>
        ) : (
          "Submit for Grading"
        )}
      </button>
    </form>
  );
}
