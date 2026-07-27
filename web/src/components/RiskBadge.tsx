const STATUS_STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  low: { bg: "rgba(12,163,12,0.12)", fg: "var(--status-good)", label: "Low risk" },
  compliant: { bg: "rgba(12,163,12,0.12)", fg: "var(--status-good)", label: "Compliant" },
  medium: { bg: "rgba(201,133,0,0.14)", fg: "var(--status-warning)", label: "Medium risk" },
  conditional: { bg: "rgba(201,133,0,0.14)", fg: "var(--status-warning)", label: "Conditional" },
  high: { bg: "rgba(236,131,90,0.16)", fg: "var(--status-serious)", label: "High risk" },
  critical: { bg: "rgba(208,59,59,0.14)", fg: "var(--status-critical)", label: "Critical" },
  non_compliant: { bg: "rgba(208,59,59,0.14)", fg: "var(--status-critical)", label: "Non-compliant" },
  unknown: { bg: "rgba(137,135,129,0.16)", fg: "var(--ink-muted)", label: "Unknown" },
};

export function RiskBadge({ value }: { value: string }) {
  const key = value?.toLowerCase() ?? "unknown";
  const style = STATUS_STYLES[key] ?? {
    bg: "rgba(137,135,129,0.16)",
    fg: "var(--ink-muted)",
    label: value,
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ background: style.bg, color: style.fg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: style.fg }} />
      {style.label}
    </span>
  );
}
