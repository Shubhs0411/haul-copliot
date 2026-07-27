"use client";

import { useState } from "react";
import { ApiError, DqfAuditResult, auditDqfPacket } from "@/lib/api";
import { RiskBadge } from "./RiskBadge";

const BOOL_FIELDS: Array<{ key: string; label: string }> = [
  { key: "employment_application", label: "Employment application on file" },
  { key: "mvr_initial", label: "Initial MVR pulled" },
  { key: "road_test_or_cdl_copy", label: "Road test or CDL copy on file" },
  { key: "clearinghouse_preemployment_query", label: "Pre-employment Clearinghouse query" },
];

const DATE_FIELDS: Array<{ key: string; label: string }> = [
  { key: "mvr_annual_review_date", label: "MVR annual review date" },
  { key: "medical_certificate_expiration", label: "Medical certificate expiration" },
  { key: "clearinghouse_annual_query_date", label: "Clearinghouse annual query date" },
];

const DEFAULT_PACKET: Record<string, unknown> = {
  employment_application: true,
  mvr_initial: false,
  mvr_annual_review_date: "2024-01-10",
  medical_certificate_expiration: "2025-01-05",
  road_test_or_cdl_copy: true,
  clearinghouse_preemployment_query: false,
  clearinghouse_annual_query_date: "",
};

export function DqfDemo() {
  const [packet, setPacket] = useState<Record<string, unknown>>(DEFAULT_PACKET);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DqfAuditResult | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const cleaned = Object.fromEntries(
        Object.entries(packet).filter(([, v]) => v !== ""),
      );
      const res = await auditDqfPacket(cleaned);
      setResult(res);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? `API error (${err.status}): ${err.message.slice(0, 300)}`
          : "Could not reach the Haul Copilot API.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        {BOOL_FIELDS.map((f) => (
          <label key={f.key} className="flex cursor-pointer items-center justify-between text-sm">
            <span>{f.label}</span>
            <input
              type="checkbox"
              checked={Boolean(packet[f.key])}
              onChange={(e) => setPacket((p) => ({ ...p, [f.key]: e.target.checked }))}
              className="h-4 w-4 accent-[var(--brand-blue)]"
            />
          </label>
        ))}
        {DATE_FIELDS.map((f) => (
          <label key={f.key} className="block text-sm">
            <span className="mb-1 block">{f.label}</span>
            <input
              type="date"
              value={(packet[f.key] as string) ?? ""}
              onChange={(e) => setPacket((p) => ({ ...p, [f.key]: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ borderColor: "var(--border-hairline)", background: "var(--surface-1)" }}
            />
          </label>
        ))}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded-lg py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
          style={{ background: "var(--brand-blue)" }}
        >
          {loading ? "Auditing…" : "Audit DQF packet"}
        </button>
      </div>

      <div className="lg:col-span-3">
        <div
          className="min-h-[280px] rounded-xl border p-5"
          style={{ borderColor: "var(--border-hairline)", background: "var(--surface-1)" }}
        >
          {!result && !error && !loading && (
            <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
              Toggle the driver qualification file fields and audit for missing/stale
              items against 49 CFR 391/382 rules.
            </p>
          )}
          {loading && (
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--ink-secondary)" }}>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Checking rule-linked requirements…
            </div>
          )}
          {error && (
            <div className="text-sm" style={{ color: "var(--status-critical)" }}>
              {error}
            </div>
          )}
          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <RiskBadge value={result.status} />
                <RiskBadge value={result.risk_level} />
              </div>
              <p className="text-sm">{result.summary}</p>
              {result.findings.length > 0 && (
                <div className="overflow-hidden rounded-lg border" style={{ borderColor: "var(--border-hairline)" }}>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr style={{ background: "var(--surface-2)", color: "var(--ink-muted)" }}>
                        <th className="px-3 py-2 font-medium">Item</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">Rule</th>
                        <th className="px-3 py-2 font-medium">Next step</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.findings.map((f) => (
                        <tr key={f.item} className="border-t" style={{ borderColor: "var(--border-hairline)" }}>
                          <td className="px-3 py-2">{f.item.replace(/_/g, " ")}</td>
                          <td className="px-3 py-2">
                            <RiskBadge value={f.status === "stale" ? "high" : "medium"} />
                          </td>
                          <td className="px-3 py-2 font-mono" style={{ color: "var(--ink-secondary)" }}>
                            {f.rule}
                          </td>
                          <td className="px-3 py-2" style={{ color: "var(--ink-secondary)" }}>
                            {f.next_step}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
