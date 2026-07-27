export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur-md" style={{ borderColor: "var(--border-hairline)", background: "color-mix(in srgb, var(--surface-0) 85%, transparent)" }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, var(--brand-blue), var(--brand-violet))" }}
          >
            HC
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Haul Copilot</span>
        </a>
        <nav className="hidden items-center gap-7 text-sm md:flex" style={{ color: "var(--ink-secondary)" }}>
          <a href="#architecture" className="hover:opacity-80">Architecture</a>
          <a href="#demo" className="hover:opacity-80">Live Demo</a>
          <a href="#status" className="hover:opacity-80">System Status</a>
          <a href="#api" className="hover:opacity-80">API</a>
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Shubhs0411/haul-copliot"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-lg border px-3.5 py-1.5 text-sm font-medium sm:block"
            style={{ borderColor: "var(--border-hairline)" }}
          >
            GitHub
          </a>
          <a
            href="#demo"
            className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-white"
            style={{ background: "var(--brand-blue)" }}
          >
            Try the demo
          </a>
        </div>
      </div>
    </header>
  );
}
