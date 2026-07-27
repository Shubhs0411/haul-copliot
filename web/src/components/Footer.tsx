export function Footer() {
  return (
    <footer className="border-t" style={{ borderColor: "var(--border-hairline)" }}>
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, var(--brand-blue), var(--brand-violet))" }}
          >
            HC
          </span>
          <span className="text-sm font-medium">Haul Copilot</span>
        </div>
        <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
          Multi-agent transportation compliance intelligence · FMCSA · DOT · CSA · 49 CFR
        </p>
        <a
          href="https://github.com/Shubhs0411/haul-copliot"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium"
          style={{ color: "var(--ink-secondary)" }}
        >
          View source →
        </a>
      </div>
    </footer>
  );
}
