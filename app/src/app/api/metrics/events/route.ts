import { ZodError } from "zod";
import { jsonError, jsonSuccess } from "@/lib/api/responses";
import { createMetricEvent } from "@/lib/server/metrics";
import { metricEventInputSchema } from "@/lib/validation/metrics";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  const parsed = metricEventInputSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Metric event data is invalid.", 400, formatValidationErrors(parsed.error));
  }

  try {
    const event = await createMetricEvent(parsed.data);
    return jsonSuccess({ id: event.id, recorded: true as const }, 201);
  } catch (error) {
    console.error("Failed to record metric event", error);
    return jsonError("DATABASE_ERROR", "Metric event could not be recorded.", 500);
  }
}

function formatValidationErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path,
    message: issue.message,
  }));
}
