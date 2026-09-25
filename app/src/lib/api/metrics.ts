import type { ActivitySuccessResponse } from "@/lib/domain/activity";
import type { DashboardSummary } from "@/lib/domain/metrics";
import type { MetricEventInput } from "@/lib/validation/metrics";

type MetricWriteResponse = ActivitySuccessResponse<{ id: string; recorded: true }>;
type DashboardSummaryResponse = ActivitySuccessResponse<DashboardSummary>;

export async function recordMetricEvent(input: MetricEventInput) {
  try {
    const response = await fetch("/api/metrics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      keepalive: true,
    });

    if (!response.ok) {
      console.warn(`Metric event was not recorded (HTTP ${response.status}).`);
      return { recorded: false as const };
    }

    const body = await response.json() as MetricWriteResponse;
    return body.data;
  } catch (error) {
    console.warn("Metric event was not recorded.", error);
    return { recorded: false as const };
  }
}

export async function fetchDashboardSummary() {
  const response = await fetch("/api/dashboard/summary", { cache: "no-store" });
  const body = await response.json().catch(() => null) as DashboardSummaryResponse & { error?: { message?: string } } | null;

  if (!response.ok) {
    throw new Error(body?.error?.message ?? `Dashboard request failed with status ${response.status}.`);
  }

  if (!body?.data) {
    throw new Error("Dashboard response did not contain summary data.");
  }

  return body.data;
}
