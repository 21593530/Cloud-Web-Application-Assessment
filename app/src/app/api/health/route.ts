import { jsonError, jsonSuccess } from "@/lib/api/responses";
import { prisma } from "@/lib/server/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    await Promise.all([
      prisma.activity.findFirst({ select: { id: true } }),
      prisma.usageEvent.findFirst({ select: { id: true } }),
    ]);

    return jsonSuccess({ status: "ok", database: "connected" });
  } catch {
    return jsonError(
      "DATABASE_UNAVAILABLE",
      "Application is available, but the database health check failed.",
      503,
      { status: "degraded", database: "disconnected" },
    );
  }
}
