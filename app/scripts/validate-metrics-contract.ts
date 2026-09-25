import { metricEventInputSchema } from "../src/lib/validation/metrics";

const validEvents = [
  { eventType: "PAGE_VIEW", pagePath: "/dashboard" },
  { eventType: "PAGE_DURATION", pagePath: "/wordle", activityType: "WORDLE", durationMs: 75_000 },
  { eventType: "GENERATION_SUCCESS", pagePath: "/word-search", activityType: "WORD_SEARCH" },
  {
    eventType: "GENERATION_FAILURE",
    pagePath: "/wordle",
    activityType: "WORDLE",
    failureCode: "INVALID_DATA",
  },
];

const invalidEvents = [
  { eventType: "PAGE_DURATION", pagePath: "/wordle", durationMs: 999 },
  { eventType: "PAGE_DURATION", pagePath: "/wordle" },
  { eventType: "GENERATION_SUCCESS", pagePath: "/word-search", activityType: "WORDLE" },
  { eventType: "GENERATION_SUCCESS", pagePath: "/wordle", activityType: "WORDLE", failureCode: "UNKNOWN" },
  { eventType: "GENERATION_FAILURE", pagePath: "/wordle", activityType: "WORDLE" },
  { eventType: "PAGE_VIEW", pagePath: "/private" },
  { eventType: "PAGE_VIEW", pagePath: "/", source: "SIMULATED" },
  { eventType: "PAGE_VIEW", pagePath: "/", metadata: { rawWord: "must not be accepted" } },
];

validEvents.forEach((event, index) => {
  if (!metricEventInputSchema.safeParse(event).success) {
    throw new Error(`Expected valid metric event ${index + 1} to pass.`);
  }
});

invalidEvents.forEach((event, index) => {
  if (metricEventInputSchema.safeParse(event).success) {
    throw new Error(`Expected invalid metric event ${index + 1} to fail.`);
  }
});

console.log(`Metrics contract passed: ${validEvents.length} valid events accepted and ${invalidEvents.length} invalid events rejected.`);
