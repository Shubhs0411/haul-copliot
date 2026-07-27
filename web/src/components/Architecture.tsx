const SPECIALISTS = [
  { name: "Carrier Vetting", intent: "carrier_vetting", color: "var(--brand-blue)" },
  { name: "Driver Qualification", intent: "driver_qualification", color: "var(--brand-aqua)" },
  { name: "CSA Scoring", intent: "csa_scoring", color: "var(--brand-orange)" },
  { name: "Compliance Oracle", intent: "regulation_lookup / risk / multi_domain", color: "var(--brand-violet)" },
];

const STAGES = [
  {
    title: "System of Understanding",
    desc: "Regulations, inspections, and operational documents become searchable, typed evidence via semantic retrieval (ChromaDB) and a knowledge graph of carriers, drivers, and violations.",
  },
  {
    title: "System of Velocity",
    desc: "A LangGraph orchestrator routes each query to the right specialist, gates sensitive decisions behind human approval, and serves everything through a FastAPI runtime.",
  },
  {
    title: "System of Continuous Improvement",
    desc: "Every run is traced end-to-end, scored against a 29-case eval suite, and can be rewritten by an evaluator-optimizer pass for higher-quality output.",
  },
];

function Node({ label, sub, color }: { label: string; sub?: string; color: string }) {
  return (
    <div
      className="flex min-w-[150px] flex-col items-center gap-0.5 rounded-xl border px-4 py-3 text-center shadow-sm"
      style={{ borderColor: "var(--border-hairline)", background: "var(--surface-1)" }}
    >
      <span className="h-1.5 w-6 rounded-full" style={{ background: color }} />
      <span className="mt-1.5 text-sm font-semibold">{label}</span>
      {sub && (
        <span className="text-[11px] leading-tight" style={{ color: "var(--ink-muted)" }}>
          {sub}
        </span>
      )}
    </div>
  );
}

function Arrow({ vertical = false }: { vertical?: boolean }) {
  return (
    <div
      className={vertical ? "h-6 w-px" : "h-px flex-1 min-w-6"}
      style={{ background: "var(--gridline)" }}
    />
  );
}

export function Architecture() {
  return (
    <section id="architecture" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-14 max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--brand-blue)" }}>
          Architecture
        </span>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Router → specialist → synthesizer
        </h2>
        <p className="mt-3 text-base" style={{ color: "var(--ink-secondary)" }}>
          Every query is classified, routed to a domain specialist, optionally paused for
          human review, then synthesized into a cited, auditable answer.
        </p>
      </div>

      <div
        className="overflow-x-auto rounded-2xl border p-8"
        style={{ borderColor: "var(--border-hairline)", background: "var(--surface-1)" }}
      >
        <div className="flex min-w-[760px] flex-col items-center gap-3">
          <Node label="User Query" color="var(--ink-muted)" />
          <Arrow vertical />
          <Node label="Router" sub="intent classification" color="var(--brand-blue)" />
          <Arrow vertical />

          <div className="flex w-full items-center justify-center gap-2">
            {SPECIALISTS.map((s, i) => (
              <div key={s.name} className="flex flex-1 items-center gap-2">
                {i > 0 && <Arrow />}
                <div className="flex-1">
                  <Node label={s.name} sub={s.intent} color={s.color} />
                </div>
              </div>
            ))}
          </div>

          <Arrow vertical />
          <Node label="Approval Gate" sub="HITL when required" color="var(--brand-orange)" />
          <Arrow vertical />
          <Node label="Synthesizer" sub="final response + citations" color="var(--brand-blue)" />
          <Arrow vertical />

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Node label="Trace + Timeline" sub="observability" color="var(--brand-aqua)" />
            <Node label="Eval Harness" sub="quality scoring" color="var(--brand-aqua)" />
            <Node label="FastAPI" sub="/v1/compliance/query" color="var(--brand-aqua)" />
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-3">
        {STAGES.map((stage, i) => (
          <div
            key={stage.title}
            className="rounded-xl border p-6"
            style={{ borderColor: "var(--border-hairline)", background: "var(--surface-1)" }}
          >
            <div
              className="mb-3 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ background: "var(--brand-blue)" }}
            >
              {i + 1}
            </div>
            <h3 className="text-sm font-semibold">{stage.title}</h3>
            <p className="mt-2 text-sm" style={{ color: "var(--ink-secondary)" }}>
              {stage.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
