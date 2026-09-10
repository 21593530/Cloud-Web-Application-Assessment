import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { jsonError, jsonSuccess } from "@/lib/api/responses";
import {
  deleteActivity,
  getActivity,
  updateActivity,
} from "@/lib/server/activities";
import { activityIdSchema, activityUpdateSchema } from "@/lib/validation/activity";

export const runtime = "nodejs";

type ActivityRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: ActivityRouteContext) {
  const idResult = await getId(context);
  if (idResult.error) return idResult.error;

  try {
    const activity = await getActivity(idResult.id);
    return activity ? jsonSuccess(activity) : jsonError("NOT_FOUND", "Activity was not found.", 404);
  } catch (error) {
    console.error("Failed to load activity", error);
    return jsonError("DATABASE_ERROR", "Activity could not be loaded.", 500);
  }
}

export async function PATCH(request: Request, context: ActivityRouteContext) {
  const idResult = await getId(context);
  if (idResult.error) return idResult.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  const parsed = activityUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("VALIDATION_ERROR", "Activity data is invalid.", 400, formatValidationErrors(parsed.error));
  }

  try {
    return jsonSuccess(await updateActivity(idResult.id, parsed.data));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return jsonError("NOT_FOUND", "Activity was not found.", 404);
    }

    console.error("Failed to update activity", error);
    return jsonError("DATABASE_ERROR", "Activity could not be updated.", 500);
  }
}

export async function DELETE(_request: Request, context: ActivityRouteContext) {
  const idResult = await getId(context);
  if (idResult.error) return idResult.error;

  try {
    await deleteActivity(idResult.id);
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return jsonError("NOT_FOUND", "Activity was not found.", 404);
    }

    console.error("Failed to delete activity", error);
    return jsonError("DATABASE_ERROR", "Activity could not be deleted.", 500);
  }
}

async function getId(context: ActivityRouteContext) {
  const params = await context.params;
  const result = activityIdSchema.safeParse(params);
  if (!result.success) {
    return {
      id: "",
      error: jsonError("INVALID_ID", "Activity ID is invalid.", 400, formatValidationErrors(result.error)),
    };
  }

  return { id: result.data.id, error: null };
}

function formatValidationErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path,
    message: issue.message,
  }));
}
