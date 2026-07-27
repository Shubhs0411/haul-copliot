export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, body || res.statusText);
  }
  return res.json() as Promise<T>;
}

export interface ComplianceResponse {
  query: string;
  intent: string | null;
  response: string;
  trace_id: string | null;
  route: string | null;
  timeline: Array<{ node?: string; [key: string]: unknown }>;
  optimizer: Record<string, unknown> | null;
  latency_ms: number;
}

export interface DqfFinding {
  item: string;
  status: "missing" | "stale";
  rule: string;
  next_step: string;
}

export interface DqfAuditResult {
  status: string;
  risk_level: string;
  missing_items: string[];
  stale_items: string[];
  findings: DqfFinding[];
  next_steps: string[];
  summary: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
}

export interface ObservabilityStats {
  [key: string]: unknown;
}

export function checkHealth() {
  return request<HealthResponse>("/health");
}

export function runComplianceQuery(query: string, optimized = false) {
  return request<ComplianceResponse>(
    optimized ? "/v1/compliance/query/optimized" : "/v1/compliance/query",
    { method: "POST", body: JSON.stringify({ query }) },
  );
}

export function auditDqfPacket(packet: Record<string, unknown>) {
  return request<DqfAuditResult>("/v1/dqf/audit", {
    method: "POST",
    body: JSON.stringify({ packet }),
  });
}

export function getObservabilityStats() {
  return request<ObservabilityStats>("/v1/observability/stats");
}

export function getArchitecture() {
  return request<{ framework: string; format: string; diagram: string }>(
    "/v1/graph/architecture",
  );
}
