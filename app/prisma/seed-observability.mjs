import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DAY_MS = 24 * 60 * 60 * 1_000;

function seededDate(baseDate, daysAgo, minuteOffset) {
  return new Date(baseDate.getTime() - daysAgo * DAY_MS - minuteOffset * 60 * 1_000);
}

function buildSimulatedEvents() {
  const baseDate = new Date();

  const pageViews = [
    ["home", "/", 6, 5],
    ["about", "/about", 5, 10],
    ["wordle", "/wordle", 4, 15],
    ["word-search", "/word-search", 3, 20],
    ["settings", "/settings", 2, 25],
    ["dashboard", "/dashboard", 1, 30],
  ].map(([key, pagePath, daysAgo, minuteOffset]) => ({
    id: `a3-sim-page-view-${key}`,
    eventType: "PAGE_VIEW",
    activityType: pagePath === "/wordle" ? "WORDLE" : pagePath === "/word-search" ? "WORD_SEARCH" : null,
    activityId: null,
    pagePath,
    durationMs: null,
    failureCode: null,
    source: "SIMULATED",
    createdAt: seededDate(baseDate, daysAgo, minuteOffset),
  }));

  const pageDurations = [
    ["home-1", "/", null, 28_000, 6, 35],
    ["home-2", "/", null, 35_000, 2, 40],
    ["about-1", "/about", null, 42_000, 5, 45],
    ["wordle-1", "/wordle", "WORDLE", 92_000, 6, 50],
    ["wordle-2", "/wordle", "WORDLE", 118_000, 3, 55],
    ["wordle-3", "/wordle", "WORDLE", 84_000, 0, 60],
    ["word-search-1", "/word-search", "WORD_SEARCH", 110_000, 5, 65],
    ["word-search-2", "/word-search", "WORD_SEARCH", 136_000, 2, 70],
    ["word-search-3", "/word-search", "WORD_SEARCH", 99_000, 0, 75],
    ["settings-1", "/settings", null, 26_000, 2, 80],
    ["dashboard-1", "/dashboard", null, 58_000, 1, 85],
    ["dashboard-2", "/dashboard", null, 71_000, 0, 90],
  ].map(([key, pagePath, activityType, durationMs, daysAgo, minuteOffset]) => ({
    id: `a3-sim-page-duration-${key}`,
    eventType: "PAGE_DURATION",
    activityType,
    activityId: null,
    pagePath,
    durationMs,
    failureCode: null,
    source: "SIMULATED",
    createdAt: seededDate(baseDate, daysAgo, minuteOffset),
  }));

  const generationEvents = [
    ["wordle-success-1", "GENERATION_SUCCESS", "WORDLE", "/wordle", null, 6, 100],
    ["wordle-success-2", "GENERATION_SUCCESS", "WORDLE", "/wordle", null, 5, 105],
    ["wordle-success-3", "GENERATION_SUCCESS", "WORDLE", "/wordle", null, 4, 110],
    ["wordle-success-4", "GENERATION_SUCCESS", "WORDLE", "/wordle", null, 3, 115],
    ["wordle-success-5", "GENERATION_SUCCESS", "WORDLE", "/wordle", null, 2, 120],
    ["wordle-failure-1", "GENERATION_FAILURE", "WORDLE", "/wordle", "INVALID_DATA", 1, 125],
    ["wordle-success-6", "GENERATION_SUCCESS", "WORDLE", "/wordle", null, 0, 130],
    ["word-search-success-1", "GENERATION_SUCCESS", "WORD_SEARCH", "/word-search", null, 5, 135],
    ["word-search-success-2", "GENERATION_SUCCESS", "WORD_SEARCH", "/word-search", null, 4, 140],
    ["word-search-success-3", "GENERATION_SUCCESS", "WORD_SEARCH", "/word-search", null, 3, 145],
    ["word-search-failure-1", "GENERATION_FAILURE", "WORD_SEARCH", "/word-search", "GENERATION_ERROR", 2, 150],
    ["word-search-success-4", "GENERATION_SUCCESS", "WORD_SEARCH", "/word-search", null, 1, 155],
    ["word-search-success-5", "GENERATION_SUCCESS", "WORD_SEARCH", "/word-search", null, 0, 160],
  ].map(([key, eventType, activityType, pagePath, failureCode, daysAgo, minuteOffset]) => ({
    id: `a3-sim-generation-${key}`,
    eventType,
    activityType,
    activityId: null,
    pagePath,
    durationMs: null,
    failureCode,
    source: "SIMULATED",
    createdAt: seededDate(baseDate, daysAgo, minuteOffset),
  }));

  return [...pageViews, ...pageDurations, ...generationEvents];
}

async function main() {
  if (process.argv.includes("--reset")) {
    const result = await prisma.usageEvent.deleteMany({ where: { source: "SIMULATED" } });
    console.log(`Removed ${result.count} simulated metric records. Live and test records were not changed.`);
    return;
  }

  const events = buildSimulatedEvents();

  await prisma.$transaction(
    events.map((event) => prisma.usageEvent.upsert({
      where: { id: event.id },
      update: event,
      create: event,
    })),
  );

  const grouped = await prisma.usageEvent.groupBy({
    by: ["eventType"],
    where: { source: "SIMULATED" },
    _count: { _all: true },
    orderBy: { eventType: "asc" },
  });

  console.log(`Seeded ${events.length} deterministic simulated metric records.`);
  grouped.forEach((group) => console.log(`${group.eventType}: ${group._count._all}`));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
