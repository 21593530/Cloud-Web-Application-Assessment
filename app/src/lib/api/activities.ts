import type { ActivityCreateInput, ActivityUpdateInput } from "@/lib/validation/activity";
import type { ActivityRecord, ActivitySuccessResponse } from "@/lib/domain/activity";

type ActivityListResponse = ActivitySuccessResponse<ActivityRecord[]>;
type ActivityResponse = ActivitySuccessResponse<ActivityRecord>;

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => null) as T & { error?: { message?: string } } | null;

  if (!response.ok) {
    throw new Error(body?.error?.message ?? `Request failed with status ${response.status}.`);
  }

  return body as T;
}

export async function fetchActivities(type?: ActivityRecord["type"]) {
  const query = type ? `?type=${encodeURIComponent(type)}` : "";
  const response = await request<ActivityListResponse>(`/api/activities${query}`);
  return response.data;
}

export async function createActivity(input: ActivityCreateInput) {
  const response = await request<ActivityResponse>("/api/activities", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function updateActivity(id: string, input: ActivityUpdateInput) {
  const response = await request<ActivityResponse>(`/api/activities/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function removeActivity(id: string) {
  await request(`/api/activities/${id}`, { method: "DELETE" });
}
