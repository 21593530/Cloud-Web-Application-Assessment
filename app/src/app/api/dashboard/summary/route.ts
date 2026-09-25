import { jsonError, jsonSuccess } from "@/lib/api/responses";
import { getDashboardSummary } from "@/lib/server/metrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return jsonSuccess(await getDashboardSummary());
  } catch (error) {
    console.error("Failed to load dashboard summary", error);
    return jsonError("DATABASE_ERROR", "Dashboard data could not be loaded.", 500);
  }
}
