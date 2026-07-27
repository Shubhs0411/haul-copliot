"use client";

import { useEffect, useState } from "react";
import { checkHealth } from "@/lib/api";

type BackendState = "checking" | "online" | "offline";

const STATS = [
  { value: "4", label: "Specialist agents" },
  { value: "29", label: "Eval cases" },
  { value: "3", label: "Compliance stages" },
  { value: "100%", label: "Cited responses" },
];

export function Hero() {
  const [state, setState] = useState<BackendState>("checking");

  useEffect(() => {
    let cancelled = false;
    checkHealth()
      .then(() => !cancelled && setState("online"))
      .catch(() => !cancelled && setState("offline"));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="top" className="relative overflow-hidden bg-grid" style={{ background: "var(--surface-0)" }}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, color-mix(in srgb, var(--brand-blue) 16%, transparent), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 text-center sm:pt-28">
        <div
          className="animate-fade-up mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium"
          style={{ borderColor: "var(--border-hairline)", color: "var(--ink-secondary)" }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background:
                state === "online" ? "var(--status-good)" : state === "offline" ? "var(--status-critical)" : "var(--ink-muted)",
            }}
          />
          {state === "checking" && "Checking API connection..."}
          {state === "online" && "Live API connected"}
          {state === "offline" && "API offline — showing static preview"}
        </div>

        <h1
          className="animate-fade-up mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl"
          style={{ animationDelay: "60ms" }}
        >
          Multi-agent compliance intelligence for{" "}
          <span
            style={{
              background: "linear-gradient(135deg, var(--brand-blue), var(--brand-violet))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            FMCSA, DOT & CSA
          </span>{" "}
          workflows
        </h1>

        <p
          className="animate-fade-up mx-auto mt-6 max-w-2xl text-base sm:text-lg"
          style={{ color: "var(--ink-secondary)", animationDelay: "120ms" }}
        >
          Haul Copilot routes high-stakes carrier, driver, and CSA questions to
          specialist agents and returns evidence-backed answers with citations,
          traceability, and human approval where it matters.
        </p>

        <div className="animate-fade-up mt-9 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "180ms" }}>
          <a
            href="#demo"
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--brand-blue)" }}
          >
            Run a live query
          </a>
          <a
            href="#architecture"
            className="rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--surface-1)]"
            style={{ borderColor: "var(--border-hairline)" }}
          >
            See the architecture
          </a>
        </div>

        <div className="animate-fade-up mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4" style={{ animationDelay: "240ms" }}>
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-semibold tabular-nums sm:text-3xl">{s.value}</div>
              <div className="mt-1 text-xs" style={{ color: "var(--ink-muted)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
