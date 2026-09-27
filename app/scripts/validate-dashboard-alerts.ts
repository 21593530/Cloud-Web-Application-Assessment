import {
  buildDashboardAlerts,
  type DashboardAlertInput,
} from "../src/lib/server/dashboard-alerts";

const healthyInput: DashboardAlertInput = {
  totalActivities: 2,
  wordleActivities: 1,
  wordSearchActivities: 1,
  durationSamples: 3,
  recentGenerationFailures: 0,
  generationAttempts: 5,
  successRate: 80,
};

function alertCodes(overrides: Partial<DashboardAlertInput>) {
  return buildDashboardAlerts({ ...healthyInput, ...overrides }).map((alert) => alert.code);
}

const cases = [
  {
    name: "healthy state",
    actual: alertCodes({}),
    expected: [],
  },
  {
    name: "no activities and no duration data",
    actual: alertCodes({ totalActivities: 0, wordleActivities: 0, wordSearchActivities: 0, durationSamples: 0 }),
    expected: ["NO_ACTIVITIES", "NO_DURATION_DATA"],
  },
  {
    name: "missing Wordle activities",
    actual: alertCodes({ wordleActivities: 0 }),
    expected: ["NO_WORDLE_ACTIVITIES"],
  },
  {
    name: "missing Word Search activities",
    actual: alertCodes({ wordSearchActivities: 0 }),
    expected: ["NO_WORD_SEARCH_ACTIVITIES"],
  },
  {
    name: "recent generation failures",
    actual: alertCodes({ recentGenerationFailures: 2 }),
    expected: ["GENERATION_FAILURES"],
  },
  {
    name: "low success rate with sufficient attempts",
    actual: alertCodes({ generationAttempts: 5, successRate: 79.9 }),
    expected: ["LOW_GENERATION_SUCCESS_RATE"],
  },
  {
    name: "low rate suppressed below minimum sample size",
    actual: alertCodes({ generationAttempts: 4, successRate: 0 }),
    expected: [],
  },
  {
    name: "80 percent threshold remains healthy",
    actual: alertCodes({ generationAttempts: 5, successRate: 80 }),
    expected: [],
  },
];

for (const testCase of cases) {
  if (JSON.stringify(testCase.actual) !== JSON.stringify(testCase.expected)) {
    throw new Error(
      `${testCase.name}: expected ${JSON.stringify(testCase.expected)}, received ${JSON.stringify(testCase.actual)}.`,
    );
  }
}

console.log(`Dashboard alert policy passed: ${cases.length} alert and threshold cases behaved as defined.`);
