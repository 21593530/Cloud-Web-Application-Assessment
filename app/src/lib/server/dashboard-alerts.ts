import type { DashboardAlert } from "@/lib/domain/metrics";

export type DashboardAlertInput = {
  totalActivities: number;
  wordleActivities: number;
  wordSearchActivities: number;
  durationSamples: number;
  recentGenerationFailures: number;
  generationAttempts: number;
  successRate: number | null;
};

export function buildDashboardAlerts(input: DashboardAlertInput): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];

  if (input.totalActivities === 0) {
    alerts.push({
      code: "NO_ACTIVITIES",
      severity: "WARNING",
      title: "No saved activities",
      message: "No saved activities are currently available for generation.",
    });
  } else {
    if (input.wordleActivities === 0) {
      alerts.push({
        code: "NO_WORDLE_ACTIVITIES",
        severity: "INFO",
        title: "No saved Wordle activities",
        message: "Create a Wordle configuration to include it in activity reporting.",
      });
    }
    if (input.wordSearchActivities === 0) {
      alerts.push({
        code: "NO_WORD_SEARCH_ACTIVITIES",
        severity: "INFO",
        title: "No saved Word Search activities",
        message: "Create a Word Search configuration to include it in activity reporting.",
      });
    }
  }

  if (input.durationSamples === 0) {
    alerts.push({
      code: "NO_DURATION_DATA",
      severity: "INFO",
      title: "No page-duration samples",
      message: "Average time on page will appear after usage samples are recorded.",
    });
  }

  if (input.recentGenerationFailures > 0) {
    alerts.push({
      code: "GENERATION_FAILURES",
      severity: "WARNING",
      title: "Recent generation failures",
      message: `${input.recentGenerationFailures} failed generation attempt${input.recentGenerationFailures === 1 ? "" : "s"} occurred in the last seven days.`,
    });
  }

  if (input.generationAttempts >= 5 && input.successRate !== null && input.successRate < 80) {
    alerts.push({
      code: "LOW_GENERATION_SUCCESS_RATE",
      severity: "WARNING",
      title: "Generation success rate is below target",
      message: `The current generation success rate is ${input.successRate.toFixed(1)}%, below the documented 80% threshold.`,
    });
  }

  return alerts;
}
