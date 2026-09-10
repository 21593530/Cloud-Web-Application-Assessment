import { ZodError } from "zod";
import { jsonError, jsonSuccess } from "@/lib/api/responses";
import { createActivity, listActivities } from "@/lib/server/activities";
import { activityCreateSchema } from "@/lib/validation/activity";

export const runtime = "nodejs";

export async function GET() {
  try {
    return jsonSuccess(await listActivities());
  } catch (error) {
    console.error("Failed to list activities", error);
    return jsonError("DATABASE_ERROR", "Activities could not be loaded.", 500);
  }
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  const parsed = activityCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Activity data is invalid.", 400, formatValidationErrors(parsed.error));
  }

  try {
    return jsonSuccess(await createActivity(parsed.data), 201);
  } catch (error) {
    console.error("Failed to create activity", error);
    return jsonError("DATABASE_ERROR", "Activity could not be created.", 500);
  }
}

function formatValidationErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path,
    message: issue.message,
  }));
}
