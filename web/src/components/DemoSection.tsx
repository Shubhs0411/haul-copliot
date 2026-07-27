"use client";

import { useState } from "react";
import { QueryDemo } from "./QueryDemo";
import { DqfDemo } from "./DqfDemo";

const TABS = [
  { id: "query", label: "Compliance Query" },
  { id: "dqf", label: "DQF Auditor" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function DemoSection() {
  const [tab, setTab] = useState<TabId>("query");

  return (
    <section id="demo" className="border-t" style={{ borderColor: "var(--border-hairline)", background: "var(--surface-0)" }}>
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-10 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--brand-blue)" }}>
            Live demo
          </span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Talk to the orchestrator
          </h2>
          <p className="mt-3 text-base" style={{ color: "var(--ink-secondary)" }}>
            This calls your live FastAPI backend. Set <code className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-[13px]">NEXT_PUBLIC_API_URL</code> to point it at your deployment.
          </p>
        </div>

        <div className="mb-6 flex w-fit gap-1 rounded-lg border p-1" style={{ borderColor: "var(--border-hairline)" }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="rounded-md px-4 py-1.5 text-sm font-medium transition-colors"
              style={
                tab === t.id
                  ? { background: "var(--brand-blue)", color: "white" }
                  : { color: "var(--ink-secondary)" }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "query" ? <QueryDemo /> : <DqfDemo />}
      </div>
    </section>
  );
}
