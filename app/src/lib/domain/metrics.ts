import type { ActivityType, Difficulty } from "@/lib/domain/activity";

export const METRIC_EVENT_TYPES = [
  "PAGE_VIEW",
  "PAGE_DURATION",
  "GENERATION_SUCCESS",
  "GENERATION_FAILURE",
] as const;

export type MetricEventType = (typeof METRIC_EVENT_TYPES)[number];

export const METRIC_EVENT_SOURCES = ["LIVE", "SIMULATED", "TEST"] as const;
export type MetricEventSource = (typeof METRIC_EVENT_SOURCES)[number];

export const TRACKED_PAGE_PATHS = [
  "/",
  "/about",
  "/wordle",
  "/word-search",
  "/settings",
  "/dashboard",
] as const;

export type TrackedPagePath = (typeof TRACKED_PAGE_PATHS)[number];

export const GENERATION_FAILURE_CODES = [
  "EMPTY_ACTIVITY",
  "INVALID_DATA",
  "GENERATION_ERROR",
  "UNKNOWN",
] as const;

export type GenerationFailureCode = (typeof GENERATION_FAILURE_CODES)[number];

export const MIN_PAGE_DURATION_MS = 1_000;
export const MAX_PAGE_DURATION_MS = 30 * 60 * 1_000;

export type DashboardAlert = {
  code: string;
  severity: "INFO" | "WARNING" | "ERROR";
  title: string;
  message: string;
};

export type DashboardSummary = {
  generatedAt: string;
  health: {
    application: "HEALTHY";
    database: "CONNECTED";
  };
  activities: {
    total: number;
    wordle: number;
    wordSearch: number;
    recent: Array<{
      id: string;
      type: ActivityType;
      title: string;
      difficulty: Difficulty | null;
      wordCount: number;
      updatedAt: string;
    }>;
  };
  usage: {
    averageTimeOnPageMs: number | null;
    pageDurationSamples: number;
    mostUsedActivityType: ActivityType | null;
    mostUsedActivityTypeIsTied: boolean;
    activityTypeUsage: {
      wordle: number;
      wordSearch: number;
    };
    generations: {
      total: number;
      successful: number;
      failed: number;
      successRate: number | null;
    };
  };
  pageDurations: Array<{
    pagePath: string;
    averageDurationMs: number;
    samples: number;
  }>;
  generationTrend: Array<{
    date: string;
    successful: number;
    failed: number;
  }>;
  recentEvents: Array<{
    id: string;
    eventType: MetricEventType;
    activityType: ActivityType | null;
    pagePath: string | null;
    source: Exclude<MetricEventSource, "TEST">;
    createdAt: string;
  }>;
  sources: {
    live: number;
    simulated: number;
  };
  alerts: DashboardAlert[];
};
