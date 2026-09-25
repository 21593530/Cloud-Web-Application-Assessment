# Assessment 3 Metrics and Dashboard Contract

Status: Approved implementation contract for Assessment 3 Phase 1  
Date: 23 September 2026  
Project: PhonoTrail Studio

## Purpose

This document defines the data, metric, alert, API, privacy, and interface contracts for the Assessment 3 reporting layer before any database or application implementation begins.

The contract is based on the Assessment 3 brief and rubric. It preserves the completed Assessment 1 and Assessment 2 application and adds only the data required for dashboard reporting, observability, and test evidence.

## Scope decisions

### In scope

- Current saved Wordle and Word Search activity counts.
- Database-backed page-duration samples.
- Database-backed successful and failed generation events.
- Most-used activity type based on generation attempts.
- Generation success rate.
- Seven-day generation trend.
- Per-page average duration report.
- Recent operational events.
- Application and database status indicators.
- Deterministic simulated input records.
- Meaningful dashboard empty, warning, and error states.

### Out of scope

- Rewriting the existing `Activity`, `Word`, or `Phoneme` models.
- Replacing the existing activity CRUD routes.
- Rewriting Wordle or Word Search gameplay.
- Changing the standalone HTML output format.
- Tracking individual users.
- Authentication, user profiles, IP addresses, browser fingerprinting, or third-party analytics.
- Storing raw word lists, phoneme sequences, clues, titles, or exported HTML in telemetry records.
- Treating local JMeter results as production capacity claims.

## Primary design decisions

### 1. Preserve existing activity data

The existing `Activity`, `Word`, and `Phoneme` models remain unchanged. Current activity counts and recent saved-activity summaries are calculated directly from these records.

This preserves Assessment 2 behaviour and avoids duplicating authoritative activity data in a reporting table.

### 2. Store operational usage separately

A new append-only `UsageEvent` model will store page usage and generation outcomes. It will not have a Prisma relation or foreign-key constraint to `Activity`.

An optional activity ID may be recorded as a plain string for correlation, but deleting an activity will not delete its historical usage events.

### 3. Use controlled fields instead of arbitrary metadata

The event model will use explicit validated fields. It will not accept an unrestricted client-supplied metadata object.

This makes aggregation predictable, reduces privacy risk, and prevents raw classroom content from being stored accidentally.

### 4. Keep telemetry non-blocking

Failure to write a usage event must not prevent an existing page, save action, game, or HTML export from working.

The UI may log a development warning when telemetry fails, but the original user action remains the priority.

### 5. Retain the existing health endpoint

`GET /api/health` remains the established health endpoint and continues returning HTTP 200 when the application is available.

The dashboard summary provides database status because a successful summary query proves database access. A literal `/health` alias is not part of the current implementation contract unless authoritative marking guidance later requires that exact root path.

## Proposed persistent model

The Phase 2 Prisma model should follow this shape:

```prisma
model UsageEvent {
  id           String   @id @default(cuid())
  eventType    String
  activityType String?
  activityId   String?
  pagePath     String?
  durationMs   Int?
  failureCode  String?
  source       String   @default("LIVE")
  createdAt    DateTime @default(now())

  @@index([eventType, createdAt])
  @@index([activityType, createdAt])
  @@index([pagePath, createdAt])
  @@index([source, createdAt])
}
```

Implemented in Phase 2 by `20260925024416_add_usage_events`. The existing models and initial migration were not rewritten.

## Controlled values

### Event types

| Value | Meaning | Required fields |
|---|---|---|
| `PAGE_VIEW` | An instrumented application route was opened. | `pagePath` |
| `PAGE_DURATION` | A best-effort duration sample for one route visit. | `pagePath`, `durationMs` |
| `GENERATION_SUCCESS` | A Wordle or Word Search HTML generation completed. | `activityType`, `pagePath` |
| `GENERATION_FAILURE` | A generation attempt failed or was rejected by generation validation. | `activityType`, `pagePath`, `failureCode` |

Activity creation counts will not require an `ACTIVITY_CREATED` event. Current saved counts come directly from `Activity`, which remains the authoritative source.

### Activity types

- `WORDLE`
- `WORD_SEARCH`

### Event sources

| Value | Use |
|---|---|
| `LIVE` | Real application events accepted by the metrics API. |
| `SIMULATED` | Deterministic Assessment 3 seed records. |
| `TEST` | Automated-test records in an isolated test database. |

The public event endpoint must not accept `source`. It sets `LIVE` server-side. Seed and test setup code may write `SIMULATED` or `TEST` directly.

### Allowed page paths

- `/`
- `/about`
- `/wordle`
- `/word-search`
- `/settings`
- `/dashboard`

The API accepts only this allowlist. Query strings, fragments, full URLs, and arbitrary paths are rejected.

### Failure codes

- `EMPTY_ACTIVITY`
- `INVALID_DATA`
- `GENERATION_ERROR`
- `UNKNOWN`

These are intentionally general. Free-text error messages and stack traces must not be stored as usage data.

## Event ingestion contract

### Endpoint

`POST /api/metrics/events`

### Request body

```ts
type MetricEventInput = {
  eventType:
    | "PAGE_VIEW"
    | "PAGE_DURATION"
    | "GENERATION_SUCCESS"
    | "GENERATION_FAILURE";
  activityType?: "WORDLE" | "WORD_SEARCH";
  activityId?: string;
  pagePath?: "/" | "/about" | "/wordle" | "/word-search" | "/settings" | "/dashboard";
  durationMs?: number;
  failureCode?: "EMPTY_ACTIVITY" | "INVALID_DATA" | "GENERATION_ERROR" | "UNKNOWN";
};
```

The Zod object must be strict so unsupported keys are rejected.

### Cross-field validation

#### `PAGE_VIEW`

- `pagePath` is required.
- `durationMs` is not accepted.
- `failureCode` is not accepted.
- `activityType` is optional and may be inferred for builder paths.
- `activityId` is optional.

#### `PAGE_DURATION`

- `pagePath` is required.
- `durationMs` is required.
- `durationMs` must be an integer from 1,000 to 1,800,000 milliseconds inclusive.
- `failureCode` is not accepted.
- `activityType` and `activityId` are optional.

#### `GENERATION_SUCCESS`

- `activityType` is required.
- `pagePath` is required and must match the activity type:
  - `WORDLE` uses `/wordle`.
  - `WORD_SEARCH` uses `/word-search`.
- `activityId` is optional because an unsaved draft can still be exported.
- `durationMs` is not accepted.
- `failureCode` is not accepted.

#### `GENERATION_FAILURE`

- `activityType` is required.
- `pagePath` is required and must match the activity type.
- `failureCode` is required.
- `activityId` is optional.
- `durationMs` is not accepted.

### General validation limits

- `activityId`, when provided, must be a valid CUID.
- No client-supplied event timestamp is accepted.
- No client-supplied event source is accepted.
- No raw activity data or arbitrary metadata is accepted.
- JSON must be valid and the request must use the existing safe error-response convention.

### Success response

HTTP `201 Created`

```json
{
  "data": {
    "id": "event-cuid",
    "recorded": true
  }
}
```

### Error responses

| Condition | Status | Code |
|---|---:|---|
| Invalid JSON | 400 | `INVALID_JSON` |
| Invalid or inconsistent fields | 400 | `VALIDATION_ERROR` |
| Unexpected database failure | 500 | `DATABASE_ERROR` |

The response must not expose Prisma details, SQL, stack traces, or internal paths.

## Dashboard summary contract

### Endpoint

`GET /api/dashboard/summary`

### Response shape

```ts
type DashboardSummary = {
  generatedAt: string;
  health: {
    application: "HEALTHY";
    database: "CONNECTED";
  };
  activities: {
    total: number;
    wordle: number;
    wordSearch: number;
    recent: Array<{
      id: string;
      type: "WORDLE" | "WORD_SEARCH";
      title: string;
      difficulty: "EASY" | "NORMAL" | "HARD" | null;
      wordCount: number;
      updatedAt: string;
    }>;
  };
  usage: {
    averageTimeOnPageMs: number | null;
    pageDurationSamples: number;
    mostUsedActivityType: "WORDLE" | "WORD_SEARCH" | null;
    mostUsedActivityTypeIsTied: boolean;
    activityTypeUsage: {
      wordle: number;
      wordSearch: number;
    };
    generations: {
      total: number;
      successful: number;
      failed: number;
      successRate: number | null;
    };
  };
  pageDurations: Array<{
    pagePath: string;
    averageDurationMs: number;
    samples: number;
  }>;
  generationTrend: Array<{
    date: string;
    successful: number;
    failed: number;
  }>;
  recentEvents: Array<{
    id: string;
    eventType: string;
    activityType: "WORDLE" | "WORD_SEARCH" | null;
    pagePath: string | null;
    source: "LIVE" | "SIMULATED";
    createdAt: string;
  }>;
  sources: {
    live: number;
    simulated: number;
  };
  alerts: Array<{
    code: string;
    severity: "INFO" | "WARNING" | "ERROR";
    title: string;
    message: string;
  }>;
};
```

The route uses the existing success wrapper:

```json
{
  "data": {
    "generatedAt": "2026-09-23T00:00:00.000Z"
  }
}
```

The abbreviated example above illustrates the wrapper only. The real response contains the complete contract.

## Metric definitions

### Current Wordle activities

Count of current `Activity` rows where `type = WORDLE`.

Source: live aggregate query against `Activity`.

### Current Word Search activities

Count of current `Activity` rows where `type = WORD_SEARCH`.

Source: live aggregate query against `Activity`.

### Total current activities

Current Wordle count plus current Word Search count.

This is labelled as a current saved total, not a lifetime creation count. Deleted activities are not included.

### Average time on page

Arithmetic mean of all included `PAGE_DURATION.durationMs` values, rounded to the nearest whole millisecond by the server and displayed as a human-readable duration by the UI.

- Only validated values from 1 second to 30 minutes are stored.
- Production summaries include `LIVE` and `SIMULATED` events.
- `TEST` events are excluded and should exist only in an isolated test database.
- The sample count is always shown so a small sample is not presented as conclusive.
- When there are no samples, the value is `null`, not zero.

### Per-page average duration

The same arithmetic mean grouped by allowed `pagePath`.

Only pages with at least one valid duration sample appear in the report.

### Generation attempt

One `GENERATION_SUCCESS` or `GENERATION_FAILURE` event.

Repeated exports are repeated attempts and are counted individually.

### Successful generations

Count of `GENERATION_SUCCESS` events.

### Failed generations

Count of `GENERATION_FAILURE` events.

### Total generations

Successful generation count plus failed generation count.

### Generation success rate

`successful / total * 100`, rounded to one decimal place.

When total generation attempts are zero, the value is `null`, not 0%.

### Activity-type usage

Generation attempts grouped by `activityType`.

This measures which activity output is used most frequently rather than which type merely has more saved configurations.

### Most-used activity type

The activity type with the higher generation-attempt count.

- If both counts are zero, the value is `null` and `mostUsedActivityTypeIsTied` is `false`.
- If both non-zero counts are equal, the value is `null` and `mostUsedActivityTypeIsTied` is `true`.
- The raw Wordle and Word Search attempt counts are always returned so the UI can explain the result.

### Seven-day generation trend

Generation success and failure counts grouped by calendar date for the most recent seven dates, including dates with zero events.

The server returns ISO `YYYY-MM-DD` date labels. The UI displays a readable label without changing the aggregate meaning.

### Recent saved activities

The five most recently updated `Activity` records, including type, title, difficulty, word count, and updated timestamp.

This report connects the dashboard to stored builder data and provides a link to the appropriate existing builder.

### Recent operational events

The ten most recent non-test `UsageEvent` records. Responses exclude failure details beyond the controlled failure category and exclude any private or raw classroom content.

### Source counts

Counts of included `LIVE` and `SIMULATED` event records. The dashboard uses this to disclose when simulated evidence contributes to the displayed report.

## Alert rules

Alert evaluation occurs server-side so the API and UI use the same definitions.

| Code | Severity | Condition | Intended message |
|---|---|---|---|
| `NO_ACTIVITIES` | `WARNING` | Total current activities is 0. | No saved activities are available for generation. |
| `NO_WORDLE_ACTIVITIES` | `INFO` | Wordle count is 0 but total activities is greater than 0. | No saved Wordle activity is currently available. |
| `NO_WORD_SEARCH_ACTIVITIES` | `INFO` | Word Search count is 0 but total activities is greater than 0. | No saved Word Search activity is currently available. |
| `NO_DURATION_DATA` | `INFO` | Page-duration sample count is 0. | Average time will appear after usage samples are recorded. |
| `GENERATION_FAILURES` | `WARNING` | At least one failed generation occurred in the last seven days. | Recent generation failures require review. |
| `LOW_GENERATION_SUCCESS_RATE` | `WARNING` | At least five total generation attempts exist and success rate is below 80%. | Generation reliability is below the documented threshold. |

Database unavailability is handled as a dashboard request error rather than a normal alert record because the summary cannot be reliably calculated without the database.

The dashboard must not display a warning purely to create video evidence. Simulated records may legitimately include a controlled failed generation because the brief explicitly requires simulated input and failed-generation reporting, but the record must be disclosed as simulated.

## Dashboard UI state contract

### Loading

- Show a labelled loading state or skeleton.
- Do not display temporary zeros while data is unknown.
- Preserve page heading and context so users know what is loading.

### Ready and healthy

- Show health status in text, not colour alone.
- Show required metric cards with labels and values.
- Show sample counts and simulated-data disclosure.
- Show recent activity and reporting views.

### Empty metrics

- Saved activity cards may still display real activity counts.
- Time and generation metrics display `No data yet`, not `0` when the distinction matters.
- Display the `NO_DURATION_DATA` information state.
- Provide links to the existing builders.

### Empty activities

- Display zero current activities accurately.
- Show the `NO_ACTIVITIES` warning.
- Provide clear links to create Wordle or Word Search activities.

### Warning

- Use an icon or label plus text; never colour alone.
- Explain the rule that triggered the warning.
- Do not prevent dashboard use.

### Request error

- Display a safe message stating that reporting data could not be loaded.
- Provide a retry control.
- Do not show stale values as current unless they are explicitly labelled as stale.
- Existing builders remain independently accessible.

### Partial instrumentation failure

- Do not interrupt HTML export.
- Log a concise development warning.
- Do not claim the event was recorded.

## Simulated input record contract

Assessment 3 requires simulated input records. Phase 2 will add a dedicated idempotent seed workflow for `UsageEvent` rather than changing the existing Assessment 2 activity seed behaviour.

### Seed characteristics

- Stable explicit IDs allow safe upsert and repeatable execution.
- `source` is `SIMULATED`.
- Timestamps cover the previous seven days relative to a documented fixed demonstration date or a deterministic seed base.
- Both activity types have successful generation records.
- At least one controlled failed generation exists for alert evidence.
- Every permitted major page has representative duration data where useful.
- Durations remain inside the accepted validation range.
- The data creates an understandable but not unrealistically perfect report.
- No simulated record contains personal or raw classroom content.

### Reset behaviour

A dedicated script may delete only records where `source = SIMULATED` before re-seeding. It must not delete `LIVE` records or existing Activity, Word, or Phoneme data.

### Implemented commands

Phase 2 added these commands:

```text
npm run db:seed:metrics
npm run db:reset:simulated-metrics
```

The seed uses stable upserts and the reset command deletes only `SIMULATED` records. Phase 2 verified the reset against a disposable database containing separate LIVE and TEST control records.

## Data flow

### Page usage flow

```text
Route opens
  -> client tracker records start time
  -> PAGE_VIEW request is validated
  -> LIVE UsageEvent is stored
  -> route changes or page becomes hidden
  -> duration is calculated and bounded
  -> PAGE_DURATION request is sent with keepalive where supported
  -> dashboard aggregates duration samples
```

Page-duration delivery is best-effort because browsers do not guarantee that every exit request completes. The dashboard discloses its sample count, and deterministic simulated records ensure the required report remains demonstrable.

### Generation flow

```text
Existing builder export action
  -> existing HTML construction and download/open workflow
  -> on completion, send GENERATION_SUCCESS
  -> on caught generation or validation failure, send GENERATION_FAILURE
  -> event request is validated and stored
  -> dashboard summary aggregates the outcome
```

The telemetry request does not move, replace, or become a prerequisite for the existing export logic.

### Dashboard flow

```text
Dashboard opens
  -> request GET /api/dashboard/summary
  -> server queries current Activity records
  -> server aggregates non-test UsageEvent records
  -> server applies metric and alert definitions
  -> validated response is rendered as cards, reports, trends, and status messages
```

## Existing-code touchpoints

Only the following existing areas are expected to need small, controlled changes in later phases:

| Existing file | Planned reason | Preservation boundary |
|---|---|---|
| `app/prisma/schema.prisma` | Add `UsageEvent` only. | Do not change existing models or relations. |
| `app/prisma/seed.mjs` or package scripts | Connect a separate metrics seed if necessary. | Do not change the existing Activity seed semantics unless separately justified. |
| `app/src/app/layout.tsx` | Mount a client page-usage tracker. | Preserve theme bootstrap, header, main layout, and footer. |
| `app/src/components/layout/SiteHeader.tsx` | Add Dashboard navigation. | Preserve existing links and responsive behaviour. |
| `app/src/app/wordle/page.tsx` | Record export success/failure around `exportHtml`. | Do not change gameplay or generated HTML content. |
| `app/src/app/word-search/page.tsx` | Record export success/failure around `exportHtml`. | Do not change puzzle generation, gameplay, or generated HTML content. |
| `app/src/app/globals.css` | Style new dashboard components and states. | Avoid broad visual redesign of existing pages. |
| `app/package.json` | Add metrics validation/seed scripts if needed. | Do not remove or rename existing scripts. |

No change to the existing activity CRUD routes is required by this contract.

## Expected new files

Exact component grouping may be adjusted to keep the implementation proportionate.

### Domain, validation, and server

- `app/src/lib/domain/metrics.ts`
- `app/src/lib/validation/metrics.ts`
- `app/src/lib/server/metrics.ts`
- `app/src/lib/api/metrics.ts`

### API routes

- `app/src/app/api/metrics/events/route.ts`
- `app/src/app/api/dashboard/summary/route.ts`

### Dashboard and telemetry UI

- `app/src/app/dashboard/page.tsx`
- `app/src/components/dashboard/MetricCard.tsx`
- `app/src/components/dashboard/StatusAlert.tsx`
- `app/src/components/telemetry/PageUsageTracker.tsx`

Additional small dashboard components may be introduced only when they improve readability or accessibility.

### Database and validation support

- One new Prisma migration for `UsageEvent`.
- `app/prisma/seed-observability.mjs`
- `app/scripts/validate-metrics-contract.ts`

## Retention and privacy

- Usage events contain no identity or personal information.
- Records are retained for the assessment demonstration until manually cleared.
- No automatic deletion is needed for this small local assessment dataset.
- Test records use an isolated database and are not included in the demonstration database.
- Simulated records are explicitly labelled and can be safely upserted or selectively reset.
- The dashboard discloses the presence and count of simulated records.
- Logs and API responses must not expose full unexpected error objects to users.

## Accessibility requirements for the later dashboard

- Use one clear page heading and logical heading order.
- Metric cards must have explicit text labels.
- Trends and comparisons need a text or tabular equivalent.
- Health and warnings must not rely on colour alone.
- Loading and request results should use appropriate status semantics without excessive announcements.
- Retry and builder links must be keyboard accessible.
- Recent activity and recent event data should use semantic lists or tables as appropriate.
- Durations and percentages should be presented in readable formats while retaining precise accessible labels.

## Phase 1 acceptance checklist

- [x] Every required rubric statistic has a precise definition.
- [x] Live Activity data and stored UsageEvent data have separate responsibilities.
- [x] Event names and allowed fields are defined.
- [x] Cross-field validation rules are defined.
- [x] Dashboard summary response is defined.
- [x] Empty, loading, healthy, warning, and error states are defined.
- [x] Alert thresholds are defined.
- [x] Simulated record strategy is defined.
- [x] Data flow is documented.
- [x] Existing builder touchpoints are identified.
- [x] Expected new files are identified.
- [x] Privacy and retention limits are defined.
- [x] No application or database implementation was changed during Phase 1.
