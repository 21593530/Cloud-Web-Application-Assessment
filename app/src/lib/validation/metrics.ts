import { z } from "zod";
import { ACTIVITY_TYPES } from "@/lib/domain/activity";
import {
  GENERATION_FAILURE_CODES,
  MAX_PAGE_DURATION_MS,
  METRIC_EVENT_TYPES,
  MIN_PAGE_DURATION_MS,
  TRACKED_PAGE_PATHS,
} from "@/lib/domain/metrics";

const baseMetricEventSchema = z.object({
  eventType: z.enum(METRIC_EVENT_TYPES),
  activityType: z.enum(ACTIVITY_TYPES).optional(),
  activityId: z.string().cuid("Activity ID must be a valid CUID.").optional(),
  pagePath: z.enum(TRACKED_PAGE_PATHS).optional(),
  durationMs: z.number().int().min(MIN_PAGE_DURATION_MS).max(MAX_PAGE_DURATION_MS).optional(),
  failureCode: z.enum(GENERATION_FAILURE_CODES).optional(),
}).strict();

function addRequiredIssue(context: z.RefinementCtx, path: string, message: string) {
  context.addIssue({ code: "custom", path: [path], message });
}

function addForbiddenIssue(context: z.RefinementCtx, path: string, message: string) {
  context.addIssue({ code: "custom", path: [path], message });
}

export const metricEventInputSchema = baseMetricEventSchema.superRefine((event, context) => {
  const isPageEvent = event.eventType === "PAGE_VIEW" || event.eventType === "PAGE_DURATION";
  const isGenerationEvent = event.eventType === "GENERATION_SUCCESS" || event.eventType === "GENERATION_FAILURE";

  if (!event.pagePath) {
    addRequiredIssue(context, "pagePath", "A tracked page path is required.");
  }

  if (event.eventType === "PAGE_DURATION" && event.durationMs === undefined) {
    addRequiredIssue(context, "durationMs", "Page duration events require a duration.");
  }

  if (event.eventType !== "PAGE_DURATION" && event.durationMs !== undefined) {
    addForbiddenIssue(context, "durationMs", "Duration is only supported for page duration events.");
  }

  if (event.eventType === "GENERATION_FAILURE" && !event.failureCode) {
    addRequiredIssue(context, "failureCode", "Failed generation events require a failure code.");
  }

  if (event.eventType !== "GENERATION_FAILURE" && event.failureCode !== undefined) {
    addForbiddenIssue(context, "failureCode", "Failure codes are only supported for failed generation events.");
  }

  if (isGenerationEvent && !event.activityType) {
    addRequiredIssue(context, "activityType", "Generation events require an activity type.");
  }

  if (event.activityType && event.pagePath) {
    const expectedPath = event.activityType === "WORDLE" ? "/wordle" : "/word-search";
    if (event.pagePath !== expectedPath) {
      context.addIssue({
        code: "custom",
        path: ["pagePath"],
        message: `${event.activityType} events must use ${expectedPath}.`,
      });
    }
  }

  if (isPageEvent && event.activityType && event.pagePath !== "/wordle" && event.pagePath !== "/word-search") {
    addForbiddenIssue(context, "activityType", "Activity type is only supported for builder page events.");
  }
});

export type MetricEventInput = z.infer<typeof metricEventInputSchema>;
