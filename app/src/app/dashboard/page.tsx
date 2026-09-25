"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MetricCard from "@/components/dashboard/MetricCard";
import StatusAlert from "@/components/dashboard/StatusAlert";
import { fetchDashboardSummary } from "@/lib/api/metrics";
import type { ActivityType } from "@/lib/domain/activity";
import type { DashboardSummary, MetricEventType } from "@/lib/domain/metrics";

type DashboardState =
  | { status: "loading" }
  | { status: "ready"; summary: DashboardSummary }
  | { status: "error"; message: string };

const activityLabels: Record<ActivityType, string> = {
  WORDLE: "Wordle",
  WORD_SEARCH: "Word Search",
};

const eventLabels: Record<MetricEventType, string> = {
  PAGE_VIEW: "Page view",
  PAGE_DURATION: "Page duration",
  GENERATION_SUCCESS: "Generation succeeded",
  GENERATION_FAILURE: "Generation failed",
};

const pageLabels: Record<string, string> = {
  "/": "Home",
  "/about": "About",
  "/wordle": "Wordle builder",
  "/word-search": "Word Search builder",
  "/settings": "Settings",
  "/dashboard": "Dashboard",
};

function formatDuration(milliseconds: number | null) {
  if (milliseconds === null) return "No data yet";
  const totalSeconds = Math.max(1, Math.round(milliseconds / 1_000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function formatActivityType(type: ActivityType | null) {
  return type ? activityLabels[type] : "No data yet";
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatTrendDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function builderPath(type: ActivityType) {
  return type === "WORDLE" ? "/wordle" : "/word-search";
}

export default function DashboardPage() {
  const [state, setState] = useState<DashboardState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetchDashboardSummary()
      .then((summary) => {
        if (!cancelled) setState({ status: "ready", summary });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "Dashboard data could not be loaded.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshDashboard = async () => {
    setState({ status: "loading" });
    try {
      setState({ status: "ready", summary: await fetchDashboardSummary() });
    } catch (error: unknown) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Dashboard data could not be loaded.",
      });
    }
  };

  if (state.status === "loading") {
    return (
      <section className="dashboard-page" aria-labelledby="dashboard-heading">
        <article className="panel dashboard-state" role="status" aria-live="polite">
          <p className="eyebrow">Assessment 3 reporting</p>
          <h2 id="dashboard-heading">Operational dashboard</h2>
          <div className="dashboard-loading-mark" aria-hidden="true" />
          <p>Loading stored activity and usage data…</p>
        </article>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="dashboard-page" aria-labelledby="dashboard-heading">
        <article className="panel dashboard-state dashboard-state--error" role="alert">
          <p className="eyebrow">Assessment 3 reporting</p>
          <h2 id="dashboard-heading">Reporting data is unavailable</h2>
          <p>{state.message}</p>
          <p>The Wordle and Word Search builders remain available while reporting recovers.</p>
          <div className="dashboard-actions">
            <button type="button" className="generate-button" onClick={refreshDashboard}>Try again</button>
            <Link href="/wordle" className="dashboard-link-button">Open Wordle</Link>
            <Link href="/word-search" className="dashboard-link-button">Open Word Search</Link>
          </div>
        </article>
      </section>
    );
  }

  const { summary } = state;
  const { activities, usage } = summary;
  const mostUsedLabel = usage.mostUsedActivityTypeIsTied
    ? "Tied"
    : formatActivityType(usage.mostUsedActivityType);
  const usageMaximum = Math.max(usage.activityTypeUsage.wordle, usage.activityTypeUsage.wordSearch, 1);
  const successWidth = usage.generations.total === 0
    ? 0
    : (usage.generations.successful / usage.generations.total) * 100;
  const failureWidth = usage.generations.total === 0 ? 0 : 100 - successWidth;

  return (
    <section className="dashboard-page" aria-labelledby="dashboard-heading">
      <article className="panel dashboard-hero">
        <div>
          <p className="eyebrow">Assessment 3 reporting</p>
          <h2 id="dashboard-heading">Operational dashboard</h2>
          <p className="dashboard-intro">
            Current saved activities come from the original builder database. Usage and generation
            results come from validated, append-only reporting events.
          </p>
        </div>

        <div className="dashboard-hero-side">
          <div className="dashboard-health" aria-label="System health">
            <span className="dashboard-health-mark" aria-hidden="true">✓</span>
            <div>
              <strong>Application healthy</strong>
              <span>Database {summary.health.database.toLowerCase()}</span>
            </div>
          </div>
          <button type="button" className="secondary-button" onClick={refreshDashboard}>Refresh dashboard</button>
          <p className="dashboard-updated">Updated {formatDateTime(summary.generatedAt)}</p>
        </div>
      </article>

      {summary.alerts.length > 0 ? (
        <section className="dashboard-section" aria-labelledby="dashboard-alerts-heading">
          <div className="dashboard-section-heading">
            <div>
              <p className="eyebrow">Status checks</p>
              <h3 id="dashboard-alerts-heading">Alerts and information</h3>
            </div>
            <span className="dashboard-count-label">{summary.alerts.length} active</span>
          </div>
          <ul className="dashboard-alert-list">
            {summary.alerts.map((alert) => <StatusAlert key={alert.code} alert={alert} />)}
          </ul>
        </section>
      ) : (
        <div className="dashboard-all-clear" role="status">
          <strong>All reporting checks are clear.</strong>
          <span>No dashboard warning rule is currently active.</span>
        </div>
      )}

      <section className="dashboard-section" aria-labelledby="dashboard-metrics-heading">
        <div className="dashboard-section-heading">
          <div>
            <p className="eyebrow">At a glance</p>
            <h3 id="dashboard-metrics-heading">Saved activity and usage metrics</h3>
          </div>
          <p>{summary.sources.live} live · {summary.sources.simulated} simulated events</p>
        </div>

        <div className="dashboard-metric-grid">
          <MetricCard label="Current activities" value={String(activities.total)} supportingText="Saved configurations available now" tone="accent" />
          <MetricCard label="Saved Wordle" value={String(activities.wordle)} supportingText="From current Activity records" />
          <MetricCard label="Saved Word Search" value={String(activities.wordSearch)} supportingText="From current Activity records" />
          <MetricCard
            label="Average time on page"
            value={formatDuration(usage.averageTimeOnPageMs)}
            supportingText={`${usage.pageDurationSamples} validated sample${usage.pageDurationSamples === 1 ? "" : "s"}`}
          />
          <MetricCard
            label="Most-used output"
            value={mostUsedLabel}
            supportingText={usage.mostUsedActivityTypeIsTied ? "Generation attempts are equal" : "Based on generation attempts"}
            tone="accent"
          />
          <MetricCard label="Successful generations" value={String(usage.generations.successful)} supportingText="Completed standalone exports" tone="success" />
          <MetricCard label="Failed generations" value={String(usage.generations.failed)} supportingText="Rejected or interrupted exports" tone={usage.generations.failed > 0 ? "warning" : "default"} />
          <MetricCard
            label="Generation success rate"
            value={usage.generations.successRate === null ? "No data yet" : `${usage.generations.successRate.toFixed(1)}%`}
            supportingText={`${usage.generations.total} recorded attempt${usage.generations.total === 1 ? "" : "s"}`}
            tone="success"
          />
        </div>
      </section>

      <div className="dashboard-report-grid">
        <section className="panel dashboard-report" aria-labelledby="activity-usage-heading">
          <p className="eyebrow">Builder comparison</p>
          <h3 id="activity-usage-heading">Generation attempts by activity type</h3>
          {usage.generations.total === 0 ? (
            <div className="dashboard-empty-state">
              <strong>No generation data yet</strong>
              <p>Export a Wordle or Word Search activity to begin recording live usage.</p>
            </div>
          ) : (
            <div className="dashboard-bar-list">
              <div className="dashboard-bar-row">
                <div><strong>Wordle</strong><span>{usage.activityTypeUsage.wordle} attempts</span></div>
                <div className="dashboard-bar-track" aria-hidden="true">
                  <span style={{ width: `${(usage.activityTypeUsage.wordle / usageMaximum) * 100}%` }} />
                </div>
              </div>
              <div className="dashboard-bar-row">
                <div><strong>Word Search</strong><span>{usage.activityTypeUsage.wordSearch} attempts</span></div>
                <div className="dashboard-bar-track" aria-hidden="true">
                  <span style={{ width: `${(usage.activityTypeUsage.wordSearch / usageMaximum) * 100}%` }} />
                </div>
              </div>
            </div>
          )}
          <div className="dashboard-builder-links">
            <Link href="/wordle">Open Wordle builder</Link>
            <Link href="/word-search">Open Word Search builder</Link>
          </div>
        </section>

        <section className="panel dashboard-report" aria-labelledby="generation-outcomes-heading">
          <p className="eyebrow">Export reliability</p>
          <h3 id="generation-outcomes-heading">Generation outcomes</h3>
          {usage.generations.total === 0 ? (
            <div className="dashboard-empty-state">
              <strong>No generation attempts recorded</strong>
              <p>Success rate will appear after the first recorded export attempt.</p>
            </div>
          ) : (
            <>
              <div
                className="dashboard-outcome-bar"
                role="img"
                aria-label={`${usage.generations.successful} successful and ${usage.generations.failed} failed generation attempts`}
              >
                <span className="dashboard-outcome-success" style={{ width: `${successWidth}%` }} />
                <span className="dashboard-outcome-failure" style={{ width: `${failureWidth}%` }} />
              </div>
              <dl className="dashboard-outcome-legend">
                <div><dt>Successful</dt><dd>{usage.generations.successful}</dd></div>
                <div><dt>Failed</dt><dd>{usage.generations.failed}</dd></div>
                <div><dt>Total</dt><dd>{usage.generations.total}</dd></div>
              </dl>
            </>
          )}
        </section>
      </div>

      <div className="dashboard-report-grid dashboard-report-grid--wide">
        <section className="panel dashboard-report" aria-labelledby="page-duration-heading">
          <p className="eyebrow">Engagement</p>
          <h3 id="page-duration-heading">Average time by page</h3>
          {summary.pageDurations.length === 0 ? (
            <div className="dashboard-empty-state">
              <strong>No page-duration samples</strong>
              <p>Validated samples will appear after a tracked page visit lasts at least one second.</p>
            </div>
          ) : (
            <div className="dashboard-table-wrap">
              <table className="dashboard-table">
                <caption>Average recorded duration and sample count for each tracked page</caption>
                <thead><tr><th scope="col">Page</th><th scope="col">Average</th><th scope="col">Samples</th></tr></thead>
                <tbody>
                  {summary.pageDurations.map((page) => (
                    <tr key={page.pagePath}>
                      <th scope="row">{pageLabels[page.pagePath] ?? page.pagePath}</th>
                      <td>{formatDuration(page.averageDurationMs)}</td>
                      <td>{page.samples}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel dashboard-report" aria-labelledby="generation-trend-heading">
          <p className="eyebrow">Seven-day report</p>
          <h3 id="generation-trend-heading">Generation trend</h3>
          <div className="dashboard-table-wrap">
            <table className="dashboard-table dashboard-table--compact">
              <caption>Successful and failed generation events during the most recent seven dates</caption>
              <thead><tr><th scope="col">Date</th><th scope="col">Success</th><th scope="col">Failed</th></tr></thead>
              <tbody>
                {summary.generationTrend.map((day) => (
                  <tr key={day.date}>
                    <th scope="row">{formatTrendDate(day.date)}</th>
                    <td>{day.successful}</td>
                    <td>{day.failed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="dashboard-report-grid dashboard-report-grid--wide">
        <section className="panel dashboard-report" aria-labelledby="recent-activities-heading">
          <div className="dashboard-report-heading-row">
            <div>
              <p className="eyebrow">Stored builder data</p>
              <h3 id="recent-activities-heading">Recently updated activities</h3>
            </div>
            <span>{activities.recent.length} shown</span>
          </div>
          {activities.recent.length === 0 ? (
            <div className="dashboard-empty-state">
              <strong>No saved activities</strong>
              <p>Create a builder configuration to connect stored content with this report.</p>
              <div className="dashboard-builder-links">
                <Link href="/wordle">Create Wordle activity</Link>
                <Link href="/word-search">Create Word Search activity</Link>
              </div>
            </div>
          ) : (
            <ul className="dashboard-activity-list">
              {activities.recent.map((activity) => (
                <li key={activity.id}>
                  <div>
                    <span className="dashboard-type-label">{activityLabels[activity.type]}</span>
                    <strong>{activity.title}</strong>
                    <span>{activity.wordCount} word{activity.wordCount === 1 ? "" : "s"} · {activity.difficulty ? activity.difficulty.toLowerCase() : "No difficulty"}</span>
                    <span>Updated {formatDateTime(activity.updatedAt)}</span>
                  </div>
                  <Link href={builderPath(activity.type)}>Open builder</Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel dashboard-report" aria-labelledby="recent-events-heading">
          <div className="dashboard-report-heading-row">
            <div>
              <p className="eyebrow">Reporting records</p>
              <h3 id="recent-events-heading">Recent operational events</h3>
            </div>
            <span>{summary.recentEvents.length} shown</span>
          </div>
          {summary.recentEvents.length === 0 ? (
            <div className="dashboard-empty-state">
              <strong>No usage events yet</strong>
              <p>Page visits and export outcomes will appear here as they are recorded.</p>
            </div>
          ) : (
            <div className="dashboard-table-wrap">
              <table className="dashboard-table dashboard-event-table">
                <caption>The ten most recent live or simulated operational records</caption>
                <thead><tr><th scope="col">Event</th><th scope="col">Context</th><th scope="col">Source</th><th scope="col">Recorded</th></tr></thead>
                <tbody>
                  {summary.recentEvents.map((event) => (
                    <tr key={event.id}>
                      <th scope="row">{eventLabels[event.eventType]}</th>
                      <td>{event.activityType ? activityLabels[event.activityType] : pageLabels[event.pagePath ?? ""] ?? "Application"}</td>
                      <td><span className={`dashboard-source dashboard-source--${event.source.toLowerCase()}`}>{event.source.toLowerCase()}</span></td>
                      <td>{formatDateTime(event.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <aside className="dashboard-source-note" aria-label="Reporting source disclosure">
        <strong>Data source disclosure</strong>
        <p>
          This view includes {summary.sources.simulated} labelled simulated event{summary.sources.simulated === 1 ? "" : "s"}
          {" "}and {summary.sources.live} live event{summary.sources.live === 1 ? "" : "s"}. Automated <code>TEST</code> records are excluded.
          Current saved-activity totals always come directly from the Activity table.
        </p>
      </aside>
    </section>
  );
}
