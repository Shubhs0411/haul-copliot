"use client";

import { useEffect, useState } from "react";
import { checkHealth, getObservabilityStats, HealthResponse, ObservabilityStats } from "@/lib/api";

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ borderColor: "var(--border-hairline)", background: "var(--surface-1)" }}
    >
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="mt-1 text-xs" style={{ color: "var(--ink-muted)" }}>
        {label}
      </div>
    </div>
  );
}

export function StatusPanel() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [stats, setStats] = useState<ObservabilityStats | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([checkHealth(), getObservabilityStats()])
      .then(([h, s]) => {
        if (cancelled) return;
        setHealth(h);
        setStats(s);
      })
      .catch(() => !cancelled && setOffline(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const totalCalls = Number(stats?.total_calls ?? stats?.total_agent_calls ?? 0) || 0;
  const totalTokens =
    (Number(stats?.total_input_tokens ?? 0) || 0) + (Number(stats?.total_output_tokens ?? 0) || 0);
  const avgLatency = Number(stats?.avg_latency_ms ?? stats?.average_latency_ms ?? 0) || 0;

  return (
    <section id="status" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--brand-blue)" }}>
            System status
          </span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Live observability
          </h2>
        </div>
        <span
          className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm"
          style={{ borderColor: "var(--border-hairline)", color: "var(--ink-secondary)" }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: offline ? "var(--status-critical)" : health ? "var(--status-good)" : "var(--ink-muted)" }}
          />
          {offline ? "API unreachable" : health ? `${health.service} v${health.version}` : "Connecting…"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Agent calls this session" value={totalCalls} />
        <StatTile label="Total tokens processed" value={totalTokens.toLocaleString()} />
        <StatTile label="Avg. latency" value={avgLatency ? `${avgLatency.toFixed(0)} ms` : "—"} />
        <StatTile label="Specialist agents online" value={offline ? "—" : "4"} />
      </div>
    </section>
  );
}
