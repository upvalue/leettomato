import { useState } from "react";
import { smokeTest, type SmokeResponse } from "../api/client";

export function SmokePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmokeResponse | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setResult(null);
    setError(null);
    setElapsed(null);
    const start = performance.now();
    try {
      const res = await smokeTest();
      setElapsed(Math.round(performance.now() - start));
      setResult(res);
    } catch (e) {
      setElapsed(Math.round(performance.now() - start));
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg-bright">Smoke Test</h1>
        <p className="text-fg-muted text-sm mt-1">
          Send a hello-world prompt to the LLM to verify the connection.
        </p>
      </div>

      <button
        onClick={run}
        disabled={loading}
        className="px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-tn-blue to-tn-purple text-bg-main hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {loading ? "Querying LLM..." : "Run Smoke Test"}
      </button>

      {result && (
        <div
          className={`rounded-xl border p-5 space-y-3 ${
            result.ok
              ? "border-tn-green/40 bg-tn-green/5"
              : "border-tn-red/40 bg-tn-red/5"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold ${
                result.ok
                  ? "bg-tn-green/20 text-tn-green"
                  : "bg-tn-red/20 text-tn-red"
              }`}
            >
              {result.ok ? "✓" : "✗"}
            </span>
            <span className={`font-semibold ${result.ok ? "text-tn-green" : "text-tn-red"}`}>
              {result.ok ? "OK" : "Failed"}
            </span>
            {elapsed !== null && (
              <span className="text-fg-muted text-xs ml-auto">{elapsed}ms</span>
            )}
          </div>

          {result.ok && result.model_reply && (
            <p className="text-fg-main text-sm bg-bg-elevated rounded-lg p-3">
              {result.model_reply}
            </p>
          )}

          {!result.ok && result.error && (
            <pre className="text-tn-red text-xs bg-bg-elevated rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
              {result.error}
            </pre>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-tn-red/40 bg-tn-red/5 p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold bg-tn-red/20 text-tn-red">
              ✗
            </span>
            <span className="font-semibold text-tn-red">Network Error</span>
            {elapsed !== null && (
              <span className="text-fg-muted text-xs ml-auto">{elapsed}ms</span>
            )}
          </div>
          <pre className="text-tn-red text-xs bg-bg-elevated rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
            {error}
          </pre>
        </div>
      )}
    </div>
  );
}
