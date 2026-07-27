"use client";

import { useState } from "react";
import { ApiError, ComplianceResponse, runComplianceQuery } from "@/lib/api";
import { RiskBadge } from "./RiskBadge";

const EXAMPLES = [
  "Run a full safety check on DOT 2345678",
  "Should we approve DOT 2345678 for hazmat today?",
  "Check driver qualification status for CDL license D1234567",
  "What is the CSA intervention threshold for unsafe driving?",
];

export function QueryDemo() {
  const [query, setQuery] = useState(EXAMPLES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ComplianceResponse | null>(null);

  async function submit(q: string) {
    if (!q.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await runComplianceQuery(q.trim());
      setResult(res);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`API error (${err.status}): ${err.message.slice(0, 300)}`);
      } else {
        setError("Could not reach the Haul Copilot API. Is the backend running and NEXT_PUBLIC_API_URL set?");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <label className="mb-2 block text-sm font-medium">Compliance query</label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={4}
          className="w-full rounded-lg border p-3 text-sm outline-none focus:ring-2"
          style={{
            borderColor: "var(--border-hairline)",
            background: "var(--surface-1)",
            color: "var(--ink-primary)",
          }}
          placeholder="Ask about a carrier, driver, or regulation..."
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setQuery(ex)}
              className="rounded-full border px-3 py-1 text-xs transition-colors hover:bg-[var(--surface-2)]"
              style={{ borderColor: "var(--border-hairline)", color: "var(--ink-secondary)" }}
            >
              {ex.length > 42 ? ex.slice(0, 42) + "…" : ex}
            </button>
          ))}
        </div>

        <button
          onClick={() => submit(query)}
          disabled={loading}
          className="mt-4 w-full rounded-lg py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity disabled:opacity-60 sm:w-auto sm:px-6"
          style={{ background: "var(--brand-blue)" }}
        >
          {loading ? "Routing query…" : "Run query"}
        </button>
      </div>

      <div className="lg:col-span-3">
        <div
          className="min-h-[280px] rounded-xl border p-5"
          style={{ borderColor: "var(--border-hairline)", background: "var(--surface-1)" }}
        >
          {!result && !error && !loading && (
            <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
              Results will appear here — including routed intent, latency, and citations.
            </p>
          )}
          {loading && (
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--ink-secondary)" }}>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Router → specialist → synthesizer…
            </div>
          )}
          {error && (
            <div className="text-sm" style={{ color: "var(--status-critical)" }}>
              {error}
            </div>
          )}
          {result && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: "var(--ink-muted)" }}>
                {result.intent && <RiskBadge value={result.intent === "risk_assessment" ? "high" : "low"} />}
                {result.route && (
                  <span className="rounded-full border px-2.5 py-1" style={{ borderColor: "var(--border-hairline)" }}>
                    route: {result.route}
                  </span>
                )}
                <span className="rounded-full border px-2.5 py-1 tabular-nums" style={{ borderColor: "var(--border-hairline)" }}>
                  {result.latency_ms.toFixed(0)} ms
                </span>
                {result.trace_id && (
                  <span className="rounded-full border px-2.5 py-1 font-mono" style={{ borderColor: "var(--border-hairline)" }}>
                    {result.trace_id.slice(0, 8)}
                  </span>
                )}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{result.response}</p>
              {result.timeline?.length > 0 && (
                <div className="border-t pt-3" style={{ borderColor: "var(--border-hairline)" }}>
                  <div className="mb-2 text-xs font-medium" style={{ color: "var(--ink-muted)" }}>
                    Orchestration timeline
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.timeline.map((step, i) => (
                      <span
                        key={i}
                        className="rounded-md px-2 py-1 text-[11px]"
                        style={{ background: "var(--surface-2)", color: "var(--ink-secondary)" }}
                      >
                        {String(step.node ?? JSON.stringify(step))}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
