import { ZodError } from "zod";
import { jsonError, jsonSuccess } from "@/lib/api/responses";
import { MAX_METRIC_REQUEST_BYTES } from "@/lib/domain/metrics";
import { createMetricEvent } from "@/lib/server/metrics";
import { metricEventInputSchema } from "@/lib/validation/metrics";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;

  try {
    const result = await readLimitedBody(request);
    if (result.tooLarge) {
      return jsonError(
        "PAYLOAD_TOO_LARGE",
        `Metric event requests must not exceed ${MAX_METRIC_REQUEST_BYTES} bytes.`,
        413,
      );
    }
    body = JSON.parse(result.body);
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

async function readLimitedBody(request: Request): Promise<
  | { tooLarge: true }
  | { tooLarge: false; body: string }
> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_METRIC_REQUEST_BYTES) {
    return { tooLarge: true };
  }

  if (!request.body) return { tooLarge: false, body: "" };

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let byteLength = 0;
  let body = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    byteLength += value.byteLength;
    if (byteLength > MAX_METRIC_REQUEST_BYTES) {
      await reader.cancel();
      return { tooLarge: true };
    }
    body += decoder.decode(value, { stream: true });
  }

  body += decoder.decode();
  return { tooLarge: false, body };
}

function formatValidationErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path,
    message: issue.message,
  }));
}
