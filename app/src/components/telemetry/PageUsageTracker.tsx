"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordMetricEvent } from "@/lib/api/metrics";
import {
  MAX_PAGE_DURATION_MS,
  MIN_PAGE_DURATION_MS,
  TRACKED_PAGE_PATHS,
  type TrackedPagePath,
} from "@/lib/domain/metrics";

function isTrackedPagePath(pathname: string): pathname is TrackedPagePath {
  return (TRACKED_PAGE_PATHS as readonly string[]).includes(pathname);
}

function activityTypeForPath(pathname: TrackedPagePath) {
  if (pathname === "/wordle") return "WORDLE" as const;
  if (pathname === "/word-search") return "WORD_SEARCH" as const;
  return undefined;
}

export default function PageUsageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isTrackedPagePath(pathname)) return;

    const pagePath = pathname;
    const activityType = activityTypeForPath(pagePath);
    const startedAt = performance.now();
    let durationRecorded = false;

    // Deferring the view avoids duplicate development-only events when React
    // Strict Mode immediately cleans up and re-runs an effect.
    const pageViewTimer = window.setTimeout(() => {
      void recordMetricEvent({
        eventType: "PAGE_VIEW",
        pagePath,
        ...(activityType ? { activityType } : {}),
      });
    }, 0);

    const recordDuration = () => {
      if (durationRecorded) return;

      const durationMs = Math.round(performance.now() - startedAt);
      if (durationMs < MIN_PAGE_DURATION_MS) return;

      durationRecorded = true;
      void recordMetricEvent({
        eventType: "PAGE_DURATION",
        pagePath,
        durationMs: Math.min(durationMs, MAX_PAGE_DURATION_MS),
        ...(activityType ? { activityType } : {}),
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") recordDuration();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", recordDuration);

    return () => {
      window.clearTimeout(pageViewTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", recordDuration);
      recordDuration();
    };
  }, [pathname]);

  return null;
}
