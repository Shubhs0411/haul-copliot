const GROUPS: Array<{ title: string; endpoints: Array<{ method: string; path: string }> }> = [
  {
    title: "Compliance & orchestration",
    endpoints: [
      { method: "POST", path: "/v1/compliance/query" },
      { method: "POST", path: "/v1/compliance/query/optimized" },
      { method: "POST", path: "/v1/compliance/query/hitl" },
      { method: "POST", path: "/v1/compliance/query/hitl/{thread_id}/resume" },
    ],
  },
  {
    title: "Observability & graph",
    endpoints: [
      { method: "GET", path: "/v1/observability/stats" },
      { method: "GET", path: "/v1/observability/traces" },
      { method: "GET", path: "/v1/graph/architecture" },
      { method: "GET", path: "/v1/graph/carrier/{dot_number}" },
    ],
  },
  {
    title: "Ingestion & compliance ops",
    endpoints: [
      { method: "POST", path: "/v1/ingest/text" },
      { method: "POST", path: "/v1/ingest/pdf" },
      { method: "POST", path: "/v1/dqf/audit" },
      { method: "POST", path: "/v1/eval/run" },
    ],
  },
];

const METHOD_COLOR: Record<string, string> = {
  GET: "var(--brand-aqua)",
  POST: "var(--brand-blue)",
};

export function ApiSurface() {
  return (
    <section id="api" className="border-t" style={{ borderColor: "var(--border-hairline)", background: "var(--surface-0)" }}>
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-10 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--brand-blue)" }}>
            API surface
          </span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything is API-first
          </h2>
          <p className="mt-3 text-base" style={{ color: "var(--ink-secondary)" }}>
            Full interactive docs are always available at{" "}
            <code className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-[13px]">/docs</code>.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {GROUPS.map((g) => (
            <div
              key={g.title}
              className="rounded-xl border p-5"
              style={{ borderColor: "var(--border-hairline)", background: "var(--surface-1)" }}
            >
              <h3 className="mb-4 text-sm font-semibold">{g.title}</h3>
              <ul className="space-y-2.5">
                {g.endpoints.map((e) => (
                  <li key={e.path} className="flex items-start gap-2 font-mono text-xs">
                    <span className="font-semibold" style={{ color: METHOD_COLOR[e.method] }}>
                      {e.method}
                    </span>
                    <span style={{ color: "var(--ink-secondary)" }}>{e.path}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
