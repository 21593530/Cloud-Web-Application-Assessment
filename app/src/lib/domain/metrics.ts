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
