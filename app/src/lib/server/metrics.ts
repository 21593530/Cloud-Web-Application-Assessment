import type { ActivityType, Difficulty } from "@/lib/domain/activity";
import type {
  DashboardSummary,
  MetricEventType,
} from "@/lib/domain/metrics";
import {
  GENERATION_FAILURE_CODES,
  MAX_PAGE_DURATION_MS,
  MIN_PAGE_DURATION_MS,
  TRACKED_PAGE_PATHS,
} from "@/lib/domain/metrics";
import type { MetricEventInput } from "@/lib/validation/metrics";
import type { Prisma } from "@prisma/client";
import { buildDashboardAlerts } from "@/lib/server/dashboard-alerts";
import { prisma } from "@/lib/server/prisma";

const INCLUDED_EVENT_SOURCES = ["LIVE", "SIMULATED"];
export async function createMetricEvent(input: MetricEventInput) {
  return prisma.usageEvent.create({
    data: {
      eventType: input.eventType,
      activityType: input.activityType ?? null,
      activityId: input.activityId ?? null,
      pagePath: input.pagePath ?? null,
      durationMs: input.durationMs ?? null,
      failureCode: input.failureCode ?? null,
      source: "LIVE",
    },
    select: { id: true },
  });
}

function startOfSevenDayWindow() {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - 6);
  return start;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildGenerationTrend(
  startDate: Date,
  events: Array<{ eventType: string; createdAt: Date }>,
) {
  const trend = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startDate);
    date.setUTCDate(startDate.getUTCDate() + index);
    return { date: isoDate(date), successful: 0, failed: 0 };
  });
  const byDate = new Map(trend.map((entry) => [entry.date, entry]));

  events.forEach((event) => {
    const entry = byDate.get(isoDate(event.createdAt));
    if (!entry) return;
    if (event.eventType === "GENERATION_SUCCESS") entry.successful += 1;
    if (event.eventType === "GENERATION_FAILURE") entry.failed += 1;
  });

  return trend;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const sevenDayStart = startOfSevenDayWindow();
  const includedSourceFilter = { in: INCLUDED_EVENT_SOURCES };
  const validGenerationFilter: Prisma.UsageEventWhereInput = {
    source: includedSourceFilter,
    OR: [
      { eventType: "GENERATION_SUCCESS", activityType: "WORDLE", pagePath: "/wordle", durationMs: null, failureCode: null },
      { eventType: "GENERATION_SUCCESS", activityType: "WORD_SEARCH", pagePath: "/word-search", durationMs: null, failureCode: null },
      { eventType: "GENERATION_FAILURE", activityType: "WORDLE", pagePath: "/wordle", durationMs: null, failureCode: { in: [...GENERATION_FAILURE_CODES] } },
      { eventType: "GENERATION_FAILURE", activityType: "WORD_SEARCH", pagePath: "/word-search", durationMs: null, failureCode: { in: [...GENERATION_FAILURE_CODES] } },
    ],
  };
  const validDurationFilter: Prisma.UsageEventWhereInput = {
    source: includedSourceFilter,
    eventType: "PAGE_DURATION",
    pagePath: { in: [...TRACKED_PAGE_PATHS] },
    durationMs: { gte: MIN_PAGE_DURATION_MS, lte: MAX_PAGE_DURATION_MS },
    failureCode: null,
  };
  const validEventFilter: Prisma.UsageEventWhereInput = {
    source: includedSourceFilter,
    OR: [
      { eventType: "PAGE_VIEW", pagePath: { in: [...TRACKED_PAGE_PATHS] }, durationMs: null, failureCode: null },
      validDurationFilter,
      validGenerationFilter,
    ],
  };

  const [
    activityCounts,
    recentActivities,
    generationGroups,
    durationAggregate,
    durationGroups,
    trendEvents,
    recentEvents,
    sourceGroups,
  ] = await Promise.all([
    prisma.activity.groupBy({ by: ["type"], _count: { _all: true } }),
    prisma.activity.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        type: true,
        title: true,
        difficulty: true,
        updatedAt: true,
        _count: { select: { words: true } },
      },
    }),
    prisma.usageEvent.groupBy({
      by: ["eventType", "activityType"],
      where: validGenerationFilter,
      _count: { _all: true },
    }),
    prisma.usageEvent.aggregate({
      where: validDurationFilter,
      _avg: { durationMs: true },
      _count: { durationMs: true },
    }),
    prisma.usageEvent.groupBy({
      by: ["pagePath"],
      where: validDurationFilter,
      _avg: { durationMs: true },
      _count: { durationMs: true },
    }),
    prisma.usageEvent.findMany({
      where: {
        ...validGenerationFilter,
        createdAt: { gte: sevenDayStart },
      },
      select: { eventType: true, createdAt: true },
    }),
    prisma.usageEvent.findMany({
      where: validEventFilter,
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        eventType: true,
        activityType: true,
        pagePath: true,
        source: true,
        createdAt: true,
      },
    }),
    prisma.usageEvent.groupBy({
      by: ["source"],
      where: validEventFilter,
      _count: { _all: true },
    }),
  ]);

  const activityCount = (type: ActivityType) =>
    activityCounts.find((group) => group.type === type)?._count._all ?? 0;
  const wordleActivities = activityCount("WORDLE");
  const wordSearchActivities = activityCount("WORD_SEARCH");
  const totalActivities = wordleActivities + wordSearchActivities;

  const generationCount = (eventType: string, activityType?: ActivityType) =>
    generationGroups
      .filter((group) => group.eventType === eventType && (!activityType || group.activityType === activityType))
      .reduce((total, group) => total + group._count._all, 0);

  const successfulGenerations = generationCount("GENERATION_SUCCESS");
  const failedGenerations = generationCount("GENERATION_FAILURE");
  const totalGenerations = successfulGenerations + failedGenerations;
  const successRate = totalGenerations === 0
    ? null
    : Math.round((successfulGenerations / totalGenerations) * 1_000) / 10;
  const wordleUsage = generationCount("GENERATION_SUCCESS", "WORDLE") + generationCount("GENERATION_FAILURE", "WORDLE");
  const wordSearchUsage = generationCount("GENERATION_SUCCESS", "WORD_SEARCH") + generationCount("GENERATION_FAILURE", "WORD_SEARCH");
  const usageIsTied = wordleUsage > 0 && wordleUsage === wordSearchUsage;
  const mostUsedActivityType = wordleUsage === 0 && wordSearchUsage === 0
    ? null
    : usageIsTied
      ? null
      : wordleUsage > wordSearchUsage
        ? "WORDLE" as const
        : "WORD_SEARCH" as const;

  const generationTrend = buildGenerationTrend(sevenDayStart, trendEvents);
  const recentGenerationFailures = generationTrend.reduce((total, entry) => total + entry.failed, 0);
  const pageDurationSamples = durationAggregate._count.durationMs;
  const averageTimeOnPageMs = durationAggregate._avg.durationMs === null
    ? null
    : Math.round(durationAggregate._avg.durationMs);

  return {
    generatedAt: new Date().toISOString(),
    health: { application: "HEALTHY", database: "CONNECTED" },
    activities: {
      total: totalActivities,
      wordle: wordleActivities,
      wordSearch: wordSearchActivities,
      recent: recentActivities.map((activity) => ({
        id: activity.id,
        type: activity.type as ActivityType,
        title: activity.title,
        difficulty: activity.difficulty as Difficulty | null,
        wordCount: activity._count.words,
        updatedAt: activity.updatedAt.toISOString(),
      })),
    },
    usage: {
      averageTimeOnPageMs,
      pageDurationSamples,
      mostUsedActivityType,
      mostUsedActivityTypeIsTied: usageIsTied,
      activityTypeUsage: { wordle: wordleUsage, wordSearch: wordSearchUsage },
      generations: {
        total: totalGenerations,
        successful: successfulGenerations,
        failed: failedGenerations,
        successRate,
      },
    },
    pageDurations: durationGroups
      .filter((group) => group.pagePath && group._avg.durationMs !== null)
      .map((group) => ({
        pagePath: group.pagePath as string,
        averageDurationMs: Math.round(group._avg.durationMs as number),
        samples: group._count.durationMs,
      }))
      .sort((first, second) => first.pagePath.localeCompare(second.pagePath)),
    generationTrend,
    recentEvents: recentEvents.map((event) => ({
      id: event.id,
      eventType: event.eventType as MetricEventType,
      activityType: event.activityType as ActivityType | null,
      pagePath: event.pagePath,
      source: event.source as "LIVE" | "SIMULATED",
      createdAt: event.createdAt.toISOString(),
    })),
    sources: {
      live: sourceGroups.find((group) => group.source === "LIVE")?._count._all ?? 0,
      simulated: sourceGroups.find((group) => group.source === "SIMULATED")?._count._all ?? 0,
    },
    alerts: buildDashboardAlerts({
      totalActivities,
      wordleActivities,
      wordSearchActivities,
      durationSamples: pageDurationSamples,
      recentGenerationFailures,
      generationAttempts: totalGenerations,
      successRate,
    }),
  };
}
