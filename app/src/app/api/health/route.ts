import { jsonSuccess } from "@/lib/api/responses";

export const runtime = "nodejs";

export function GET() {
  return jsonSuccess({ status: "ok" });
}
