import { NextResponse } from "next/server";
import type { ActivityErrorResponse, ActivitySuccessResponse } from "@/lib/domain/activity";

export function jsonSuccess<T>(data: T, status = 200) {
  const response: ActivitySuccessResponse<T> = { data };
  return NextResponse.json(response, { status });
}

export function jsonError(code: string, message: string, status: number, details?: unknown) {
  const response: ActivityErrorResponse = {
    error: {
      code,
      message,
      ...(details === undefined ? {} : { details }),
    },
  };

  return NextResponse.json(response, { status });
}
