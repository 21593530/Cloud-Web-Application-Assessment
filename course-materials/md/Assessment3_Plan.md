# Assessment 3 Implementation Plan: Data-Driven Application and Reporting

## Goal

Extend the completed PhonoTrail Studio Assessment 1 and Assessment 2 application into the Assessment 3 data, reporting, observability, and testing stage without redesigning or unnecessarily altering the existing frontend, CRUD workflow, database-backed builders, standalone HTML exports, or Docker implementation.

Assessment 1 and Assessment 2 are treated as a stable baseline. Assessment 3 work should be additive and should focus on:

- A data-driven dashboard.
- Database-backed usage and operational statistics.
- Meaningful reporting views and warning states.
- Application instrumentation and health visibility.
- Playwright end-to-end testing.
- JMeter load testing.
- Lighthouse accessibility evaluation.
- Clear evidence for a 3-8 minute video walkthrough.

---

## Baseline preservation rule

The existing Assessment 1 and Assessment 2 functionality should be left alone unless a genuinely fatal flaw is discovered.

A **fatal flaw** means an issue that meets at least one of these conditions:

- Prevents the application from starting or building in the required environment.
- Prevents Assessment 3 features from being implemented safely.
- Causes existing activity or phoneme data to be lost or corrupted.
- Breaks an existing Wordle, Word Search, CRUD, export, database, or Docker workflow needed for the final demonstration.
- Creates a serious security, accessibility, or reliability failure that would undermine the Assessment 3 submission.
- Makes a mandatory Assessment 3 requirement impossible to demonstrate.

Minor refactoring opportunities, style preferences, naming improvements, documentation inconsistencies, and non-blocking legacy imperfections are **not** fatal flaws.

If a proposed change would modify established Assessment 1 or Assessment 2 behaviour, data contracts, pages, exports, database relationships, or Docker workflow:

1. Stop before making the change.
2. Explain the exact problem and provide evidence.
3. Explain the smallest safe fix and its likely impact.
4. Ask for approval before proceeding.

Additive Assessment 3 work may reuse existing modules and components, but it should avoid broad rewrites of the two builders.

---

## Course-material alignment

This plan is based on:

- `course-materials/assessment3/2026-CSE3CWA-(OL-2)_ Assessment 3_ Details and instructions _ My LMS subjects.pdf`
- `course-materials/assessment3/Assessment 3 Marking criteria and rubric CSE3CWA 1.docx`
- The Assessment 1 and Assessment 2 briefs, rubrics, implementation notes, and existing project source.

### Administrative requirements

- Title: Assessment 3 Data-driven application and reporting.
- Due: 11:59 pm, Sunday 4 October 2026.
- Weighting: 25%.
- Individual assessment.
- Video length: 3-8 minutes maximum.
- The video must include student ID, face, and voice.
- Full generative AI use is permitted, subject to critical evaluation and the required AI acknowledgement.
- Submit the project code as a zip file and include the GitHub repository link.
- Remove `node_modules` before uploading.
- Include at least five academic or industry references in APA 7th edition style.

### Mandatory Assessment 3 capabilities

- Continue from the existing `create-next-app` project.
- Preserve the Wordle and Word Search builder use case.
- Add a data-driven dashboard.
- Store and retrieve the data used for reporting and observability.
- Show Wordle and Word Search activity counts.
- Show average time on page.
- Show the most-used activity type.
- Show successful generation count.
- Show failed generation count.
- Include other meaningful usage or operational statistics where useful.
- Include visible health and status information.
- Include error or warning indicators for unusual states.
- Ensure `/health` returns HTTP `200 OK`.
- Work with simulated input records and database persistence.
- Create Playwright tests for a builder/CRUD workflow and a generated activity/user workflow.
- Run JMeter at multiple traffic levels such as 1, 10, 100, 1,000, and 10,000 users, or an equivalent staged profile.
- Run Lighthouse accessibility checks, respond to the findings, and show the results.
- Show the dashboard, data flow, alerts, reports, metrics, tests, accessibility results, GitHub homepage, and commits in the video.

### Rubric weighting and A-grade targets

| Area | Weight | A-grade evidence |
|---|---:|---|
| Data-driven dashboard, reporting views, and activity generation | 6% | A polished, highly usable dashboard that clearly links stored activity data, generated Wordle/Word Search outputs, and reporting views. |
| Database persistence and stored activity data | 6% | Clean persistence and retrieval of word lists, phonemes, types, settings, metadata, and reporting records. |
| Observability and operational statistics | 5% | Clear health information and meaningful database-backed statistics including activity counts, time on page, most-used type, and generation outcomes. |
| Testing and accessibility evidence | 4% | Playwright, JMeter, and Lighthouse evidence is clearly demonstrated and used to explain reliability, load behaviour, and accessibility decisions. |
| Code quality and GitHub | 4% | Readable, modular, maintainable code and a professional GitHub history with focused Assessment 3 commits. |

---

## Recommended Assessment 3 architecture

The exact implementation should be confirmed during the relevant phase, but the safest direction is:

- Keep the existing `Activity`, `Word`, and `Phoneme` models intact.
- Add a separate event or metric model rather than overloading the existing activity tables.
- Record small, validated server-side events for page visits, time-on-page samples, and generation outcomes.
- Derive current saved-activity counts directly from `Activity` records.
- Derive usage and generation statistics from the new event records.
- Expose a read-only dashboard summary API.
- Add a dedicated dashboard page using the current application visual system.
- Keep the existing builder and export logic working as it does now, adding only small instrumentation calls around relevant actions.
- Seed deterministic simulated metric records so the dashboard has meaningful evidence even before a long period of real use.

### Candidate event model

A single append-only model is likely sufficient for this assessment:

`UsageEvent`

- `id`
- `eventType`
- `activityType` nullable (`WORDLE` or `WORD_SEARCH`)
- `activityId` nullable
- `pagePath` nullable
- `status` nullable (`SUCCESS`, `FAILURE`, or another validated status)
- `durationMs` nullable
- `metadataJson` with tightly controlled non-sensitive metadata
- `createdAt`

Candidate event types:

- `PAGE_VIEW`
- `PAGE_DURATION`
- `ACTIVITY_CREATED`
- `GENERATION_SUCCESS`
- `GENERATION_FAILURE`

The final schema should avoid collecting personal information, raw free-text activity content, IP addresses, browser fingerprints, or other unnecessary tracking data.

### Candidate dashboard API shape

- `GET /api/dashboard/summary`
  - Health/database status.
  - Current Wordle count.
  - Current Word Search count.
  - Total current activities.
  - Average recorded page duration.
  - Most-used activity type.
  - Successful generation count.
  - Failed generation count.
  - Generation success rate.
  - Recent activity or recent event summary.
- `POST /api/metrics/events`
  - Accept a strictly validated event payload.
  - Return an appropriate success response.
  - Reject malformed or unsupported events without partial writes.
- Existing health endpoint: `GET /api/health`.
  - The working project interpretation is that this satisfies the brief's healthcheck requirement.
  - Keep this established endpoint and its `200 OK` response unless later marking guidance explicitly requires the literal root path `/health`.
  - If a literal `/health` route is later proven necessary, prefer a small additive alias rather than replacing or changing `/api/health`.

Endpoint names are implementation choices, not wording mandated by the brief. They may be adjusted during the implementation phase if a simpler design better fits the current code.

### Metric definitions

Metric definitions must be documented before implementation so the dashboard does not display ambiguous numbers.

- **Current Wordle activities:** Current `Activity` rows where `type = WORDLE`.
- **Current Word Search activities:** Current `Activity` rows where `type = WORD_SEARCH`.
- **Total current activities:** Current Wordle count plus current Word Search count.
- **Most-used activity type:** Activity type with the most recorded generation attempts, with a clear empty/tied state.
- **Successful generations:** Count of validated `GENERATION_SUCCESS` events.
- **Failed generations:** Count of validated `GENERATION_FAILURE` events.
- **Generation success rate:** Successful generations divided by all recorded generation attempts; show an empty state when there are no attempts.
- **Average time on page:** Average of valid `PAGE_DURATION.durationMs` samples, with unreasonable values excluded by validation.
- **Health:** Application availability plus a lightweight database connectivity check.

Current activity counts and historical creation counts are different concepts. If the dashboard includes both, it must label them clearly so deleted activities do not make the report misleading.

---

# Execution Phases

Each phase is intentionally separable. A request such as **"Fire off Phase 2"** should be treated as authorisation for that phase only. At the end of every phase, record what changed, run the stated checks, and stop at the checkpoint unless the next phase has also been authorised.

## Pre-Phase: Baseline, safety, and fatal-flaw gate

### Purpose

Establish a reproducible Assessment 2 baseline and identify only issues that could fatally block Assessment 3. This phase is primarily read-only and must not become a general cleanup or refactor.

### Work

- Record the current Git branch, working-tree state, and local/remote divergence.
- Protect existing untracked assessment materials and submission artifacts.
- Install dependencies only if authorised and required for verification.
- Configure a local `.env` from `.env.example` without committing secrets or environment files.
- Verify the current database location and back up the existing SQLite file before migrations are introduced.
- Run the existing validation scripts.
- Run lint and the production build.
- Start the application against a disposable or backed-up database.
- Smoke-test:
  - Home, About, Wordle, Word Search, and Settings pages.
  - Existing activity list/create/read/update/delete behaviour.
  - Existing Wordle and Word Search previews.
  - Existing standalone HTML exports.
  - Existing `/api/health` response.
  - Existing Docker build/run path if needed for confidence.
- Confirm multi-character phonemes survive database, API, UI, and export flows.
- Document any failures without immediately changing established A1/A2 code.

### Fatal-flaw decision

- If no fatal flaw is found, make no A1/A2 changes and proceed to Phase 1.
- If a fatal flaw is found, stop and request approval for the smallest evidence-backed fix.
- Non-fatal findings go into a deferred list and do not block Assessment 3.

### Checkpoint

- A written baseline verification result exists.
- The existing database is backed up before any schema migration.
- No legacy behaviour has been changed without approval.
- Assessment 3 work has a clean and understood starting point.

### Pre-Phase completion log - 16 September 2026

Status: **Complete. No fatal Assessment 1 or Assessment 2 flaw was found.**

Baseline evidence:

- The documented Docker workflow in `dockerinstructions.txt` remains the Assessment 2 run procedure.
- The student completed a fresh Docker test immediately before this phase and confirmed that the application starts and retrieves database data correctly.
- The execution environment used for this review could not inspect WSL directly because WSL access was denied by the surrounding sandbox. The student's fresh Docker verification is therefore recorded as the container evidence for this gate rather than falsely claiming a second Docker run.
- Local runtime versions observed: Node.js `v24.12.0` and npm `11.6.2`.
- Installed package versions match the application's declared major dependencies, including Next.js `16.3.0`, React `19.2.8`, Prisma `6.16.3`, and Zod `4.5.4`.
- `npm run validate:contract` passed.
- `npm run validate:phonemes` passed.
- A production `npm run build` compiled successfully, completed TypeScript checks, generated all application routes, and confirmed `/api/health` as the existing health route.
- The first build attempt could not download the configured Google fonts because network access was restricted. The same build passed when network access was allowed, confirming that this was an environment restriction rather than an application defect.
- All five existing pages returned HTTP 200 from the production server: Home, About, Wordle, Word Search, and Settings.
- `GET /api/health` returned HTTP 200 with `{"data":{"status":"ok"}}`.
- Full API CRUD was exercised against a temporary copy of the SQLite database:
  - Create returned `201`.
  - Read returned `200`.
  - Update returned `200`.
  - Delete returned `204`.
  - Invalid activity input returned `400`.
  - Invalid ID returned `400`.
  - A valid but missing ID returned `404`.
- The temporary test activity was deleted and the temporary database was removed after verification.
- The real checked-in SQLite database was not used for write testing. Its SHA-256 remained `D16E3F5DB3A34A58A92EA32FC4E5B819100FF8D73CF12AD3A7B56A07427FAB7C`.
- SQLite `integrity_check` returned `ok` and `foreign_key_check` returned no violations.
- The real database still contains 3 activities, 7 words, 22 phoneme records, and the single expected Assessment 2 migration.
- The database is unchanged from Git. A separate working backup should still be created immediately before the first Assessment 3 schema migration in Phase 2.
- The user's recent browser/Docker test confirmed the working builder-to-database retrieval flow. Existing export behaviour was not rewritten or altered during this phase.
- No application source, database schema, database record, Docker file, or established A1/A2 behaviour was changed.

Non-fatal deferred findings:

- `npm run lint` reports two React `set-state-in-effect` errors in the existing Settings and Word Search pages. Both affected workflows run and the production build passes, so these are documented rather than changed under the baseline preservation rule.
- The local and remote `main` branches each contain one unique README-only commit. This divergence should be reconciled deliberately before the final Assessment 3 GitHub evidence phase.
- `app/package-lock.json` currently has a user-side one-line modification adding `hasInstallScript: true`, consistent with the recent npm installation. It was preserved.
- The installed dependency tree reports three extraneous platform-related packages. They did not prevent validation or the production build and are not treated as a fatal flaw.
- No local `.env` exists. This does not affect the documented Docker command because it supplies `DATABASE_URL` explicitly. Local checks used a process-scoped URL and a temporary database rather than creating an environment file.
- The Assessment 3 brief uses the wording `/health`, while the proven application endpoint is `/api/health`. The working decision is to retain `/api/health`; this should only be revisited if authoritative marking guidance requires the literal root path.

---

## Phase 1: Assessment 3 contract and metric design

### Purpose

Define exactly what will be recorded, calculated, displayed, and demonstrated before changing the database.

### Work

- Finalise the metric definitions listed above.
- Decide which statistics are calculated live and which are derived from stored events.
- Define event names, allowed fields, retention expectations, and validation limits.
- Define the dashboard summary response shape.
- Define empty, loading, healthy, warning, and error states.
- Define warning rules, for example:
  - Database health check failed.
  - No saved activities exist.
  - One activity type has no saved configurations.
  - Generation failures have been recorded.
  - Generation success rate falls below a documented threshold.
  - No time-on-page samples exist yet.
- Decide how simulated input records will be seeded and labelled.
- Produce a simple data-flow description:
  - User action.
  - Validated event request.
  - Database event record.
  - Server-side aggregation.
  - Dashboard presentation.
- Identify the exact existing builder functions that require small instrumentation hooks.

### Deliverables

- Agreed event contract.
- Agreed dashboard summary contract.
- Agreed metric and alert definitions.
- A list of files expected to be added or minimally touched in later phases.

### Checkpoint

- Every rubric statistic has a precise definition.
- No personal or unnecessary data will be collected.
- No database or application code has been changed yet.

### Phase 1 completion log - 23 September 2026

Status: **Complete. The Assessment 3 metrics and dashboard contract is defined.**

Primary deliverable:

- `course-materials/md/Assessment3_Metrics_Contract.md`

Decisions completed in this phase:

- Existing `Activity`, `Word`, and `Phoneme` models remain the authoritative source for current saved activity data and will not be redesigned.
- Current Wordle, Word Search, and total saved-activity counts will be calculated directly from `Activity`.
- A separate append-only `UsageEvent` model will store page usage and generation outcomes without a foreign-key relationship that could remove reporting history when an activity is deleted.
- Final event types are `PAGE_VIEW`, `PAGE_DURATION`, `GENERATION_SUCCESS`, and `GENERATION_FAILURE`.
- Activity creation does not require a duplicate event. The live activity table provides the required creation summary.
- Event records use controlled fields only. Raw word lists, phonemes, clues, titles, exported HTML, personal information, IP addresses, and browser fingerprints will not be collected.
- Client event requests cannot supply their own timestamp or source label.
- Event sources are `LIVE`, `SIMULATED`, and `TEST`; the public endpoint always assigns `LIVE` server-side.
- Average time on page is the arithmetic mean of valid 1-second to 30-minute `PAGE_DURATION` samples and is always accompanied by its sample count.
- Most-used activity type is based on generation attempts rather than the number of saved configurations. Empty and tied results are explicitly represented.
- Generation success rate is successful attempts divided by all attempts, with `null` used when no attempts exist.
- A seven-day generation trend, per-page duration summary, recent saved activities, recent events, and source disclosure will support the reporting requirement.
- Alert rules now have precise conditions for no activities, missing activity types, no duration samples, recent generation failures, and a success rate below 80% after at least five attempts.
- Database unavailability is a dashboard request error rather than a misleading normal alert.
- Simulated records will use stable IDs and deterministic, idempotent seed behaviour. They will be disclosed in dashboard source counts and will never contain personal or raw classroom content.
- `POST /api/metrics/events` is the planned validated ingestion endpoint.
- `GET /api/dashboard/summary` is the planned aggregation endpoint.
- The existing `GET /api/health` route is preserved. Dashboard database status will come from the successful database-backed summary operation.
- Page-duration delivery is documented as best-effort browser telemetry rather than a guaranteed complete measure.
- Metric recording is non-blocking and cannot become a prerequisite for an existing builder or export action.

Expected future touchpoints were identified before implementation. The later phases may add focused domain, validation, repository, API, dashboard, telemetry, migration, seed, and contract-validation files. Existing changes should be limited to adding the new Prisma model, mounting the page tracker, adding Dashboard navigation, instrumenting the two existing `exportHtml` functions, adding dashboard styles, and adding non-destructive package scripts.

Phase 1 verification:

- Assessment 3 brief and rubric were re-read and cross-checked against the contract.
- Every explicitly required operational statistic now has a documented formula and empty state.
- Request validation and cross-field rules are documented.
- Dashboard loading, ready, empty, warning, request-error, and partial-instrumentation-failure states are documented.
- Data retention, privacy boundaries, simulated data, and accessibility expectations are documented.
- No file under `app/` was modified.
- No Prisma migration was created or applied.
- No application record or database file was changed.

Video evidence/narration value:

- The final video can explain that current activity totals remain sourced from Assessment 2 records while operational usage comes from a separate `UsageEvent` model.
- The most-used activity type is intentionally based on generation attempts, making it a usage statistic rather than a duplicate configuration count.
- Simulated records are deliberately labelled and disclosed, meeting the brief without pretending they are live user behaviour.

---

## Phase 2: Database model, migration, and simulated records

### Purpose

Add the minimum persistent data structure required for Assessment 3 reporting while preserving the Assessment 2 activity schema and existing records.

### Work

- Add the approved event/metric model to Prisma.
- Add indexes that support event type, activity type, page path, and date-based aggregation where justified.
- Create a forward-only Prisma migration.
- Do not rewrite or remove the existing Assessment 2 migration.
- Apply the migration first to a disposable copy of the database.
- Confirm all existing Activity, Word, and Phoneme rows remain intact.
- Extend the seed workflow with deterministic simulated Assessment 3 usage records.
- Make simulated records idempotent or clearly resettable so repeated setup does not create misleading totals.
- Label simulated data in metadata if that improves reporting clarity.
- Add contract checks for valid and invalid metric records.

### Verification

- Prisma schema validation succeeds.
- Migration succeeds on an existing Assessment 2 database.
- Migration succeeds on a clean database.
- Existing activity counts and phoneme ordering are unchanged.
- Simulated records can be queried predictably.
- Invalid event data cannot be written.

### Checkpoint

- Database persistence supports all required dashboard statistics.
- Existing builder data remains unchanged and usable.
- Migration and rollback/recovery instructions are documented.

### Phase 2 completion log - 25 September 2026

Status: **Complete. Usage-event persistence, migration, simulated records, and validation are implemented.**

Files added:

- `app/prisma/migrations/20260925024416_add_usage_events/migration.sql`
- `app/prisma/seed-observability.mjs`
- `app/scripts/validate-metrics-contract.ts`
- `app/src/lib/domain/metrics.ts`
- `app/src/lib/validation/metrics.ts`

Files changed:

- `app/prisma/schema.prisma`
- `app/package.json`
- `app/.gitignore`
- `app/prisma/prisma/dev.db`

Implementation outcome:

- Added the separate append-only `UsageEvent` model without changing `Activity`, `Word`, or `Phoneme`.
- Added indexes for event type, activity type, page path, source, and creation time.
- Added controlled constants for event types, event sources, tracked page paths, failure codes, and accepted duration limits.
- Added a strict Zod input contract with cross-field validation for page views, page duration, successful generation, and failed generation events.
- Client inputs cannot provide arbitrary metadata, event source, or timestamps.
- Added `npm run validate:metrics`.
- Added `npm run db:seed:metrics`.
- Added `npm run db:reset:simulated-metrics`.
- Kept the original Assessment 2 `seed.mjs` unchanged.
- Added an ignored `app/prisma/backups/` location so local recovery databases cannot be committed or submitted accidentally.

Migration safety and recovery evidence:

- Created `app/prisma/backups/dev-pre-assessment3-phase2-20260925.db` before migration.
- The backup is ignored by Git and is a local recovery artifact, not a submission file.
- Pre-migration backup SHA-256: `D16E3F5DB3A34A58A92EA32FC4E5B819100FF8D73CF12AD3A7B56A07427FAB7C`.
- Applied the new migration first to a disposable copy of the existing Assessment 2 database.
- The disposable upgrade retained 3 activities, 7 words, and 22 phonemes and added an empty `UsageEvent` table.
- Applied both migrations successfully to a clean disposable SQLite database.
- An empty SQLite file had to exist before Prisma could deploy to the clean absolute Windows path; after creation, both migrations applied without a schema change.
- Applied the already-proven migration to the real development database.
- `npx prisma migrate status` reports two migrations and an up-to-date schema.
- Post-migration database SHA-256: `5F9FF05E44D7BCE38259F32144EA841D189924D77E1BF398E6B6B2994222F208`.
- SQLite integrity check returns `ok` and the foreign-key check returns no violations.
- Direct row comparison between the backup and migrated database confirms `Activity`, `Word`, and `Phoneme` are unchanged.
- Ordered phonemes, including `tʃ`, `dʒ`, `iː`, `ɐ`, `ə`, and `ɪ`, remain intact and in their original positions.

Recovery procedure:

1. Stop the application before replacing a SQLite file.
2. To recover while retaining Assessment 3 code, copy the ignored pre-migration backup over `app/prisma/prisma/dev.db`, then run `npx prisma migrate deploy` to recreate the `UsageEvent` table safely.
3. To return fully to the pre-Phase 2 state, revert the Phase 2 source/migration commit and restore the same backup database.
4. Re-run `prisma integrity_check`, the foreign-key check, migration status, and the existing application validation scripts after recovery.
5. Never restore or replace the database while the application or Prisma Studio has the SQLite file open.

Simulated record outcome:

- The seed uses stable IDs and upsert operations.
- Running the seed twice leaves the record total at 31 rather than duplicating data.
- All 31 records have `source = SIMULATED`.
- Event totals are:
  - 6 `PAGE_VIEW` events.
  - 12 `PAGE_DURATION` events.
  - 11 `GENERATION_SUCCESS` events.
  - 2 `GENERATION_FAILURE` events.
- Wordle has 6 successful and 1 failed generation attempt.
- Word Search has 5 successful and 1 failed generation attempt.
- The 12 page-duration samples average 74,916.67 ms, with a minimum of 26,000 ms and maximum of 136,000 ms.
- Simulated timestamps cover the previous seven days and no event is dated in the future.
- The reset command was verified against a disposable database. It removed exactly 31 simulated records while preserving separate LIVE and TEST control records and all legacy activity data.
- The real demonstration database retains the 31 simulated records for later dashboard work.

Validation and regression evidence:

- Prisma schema validation passed.
- Prisma Client generation passed.
- Metrics contract validation accepted 4 representative valid payloads and rejected 8 invalid payloads.
- Invalid cases cover short duration, missing duration, mismatched builder path, forbidden failure code, missing failure code, unsupported path, client-supplied source, and arbitrary metadata.
- The future public write endpoint will use this schema in Phase 3. Direct Prisma access remains trusted internal code rather than an unvalidated public write path.
- Focused ESLint checks passed for every new JavaScript and TypeScript file.
- Existing activity contract validation passed.
- Existing multi-character phoneme regression validation passed.
- The Next.js production build and TypeScript checks passed.
- No builder, export, existing API route, health route, activity repository, or visual component was changed.

Non-blocking note:

- Prisma reports that `package.json#prisma` configuration will be deprecated in Prisma 7. The project remains on Prisma 6.16.3, so this warning does not affect Assessment 3 and no unrelated configuration migration was introduced.

Video evidence/narration value:

- The schema can be shown with the original three models intact and `UsageEvent` visibly separated underneath them.
- The migration history proves the reporting model was added forward-only instead of rebuilding the Assessment 2 database.
- The deterministic seed provides honest, labelled simulated evidence: 31 records, 13 generation attempts, and 12 page-duration samples.
- A concise narration point is: "I preserved the Assessment 2 activity schema and added a separate usage-event table, so reporting history cannot interfere with phoneme or activity persistence."

---

## Phase 3: Instrumentation and observability APIs

### Purpose

Create the server-side data collection and aggregation layer used by the dashboard.

### Work

- Add shared TypeScript types and Zod schemas for metric events and dashboard responses.
- Add a focused server repository for event writes and summary queries.
- Add the validated event ingestion endpoint.
- Add the read-only dashboard summary endpoint.
- Preserve the existing `GET /api/health` contract.
- Make the Assessment 3 health response perform a lightweight database check if this can be added without destabilising its current behaviour.
- Only add a separate `GET /health` alias if authoritative marking guidance confirms that the literal root path is required.
- Return safe errors without leaking database or stack details.
- Log unexpected server errors with enough context for diagnosis.
- Add small client helpers for metric writes and dashboard reads.
- Prevent metric-recording failures from breaking the original builder action.
- Avoid creating recursive instrumentation, such as recording events for the dashboard loading its own metrics.

### Verification

- Valid events are stored and returned in aggregates.
- Invalid JSON and invalid fields return `400`.
- Unsupported event types return `400`.
- Health returns `200` when application and database access are healthy.
- Dashboard summary handles an empty metrics table.
- Database errors return a safe `500` response.
- Current Activity records drive the saved-activity counts.

### Checkpoint

- Every mandatory statistic can be obtained from a real server response.
- Health and error states are explicit and demonstrable.
- Original CRUD endpoints still behave as before.

### Phase 3 completion log - 25 September 2026

Status: **Complete. Validated metric ingestion and database-backed dashboard aggregation APIs are implemented.**

Files added:

- `app/src/app/api/metrics/events/route.ts`
- `app/src/app/api/dashboard/summary/route.ts`
- `app/src/lib/api/metrics.ts`
- `app/src/lib/server/metrics.ts`

File changed:

- `app/src/lib/domain/metrics.ts`

Implementation outcome:

- Added `POST /api/metrics/events` with strict JSON and Zod validation. Accepted records are assigned `source = LIVE` by the server and return HTTP `201` with the stored event ID.
- Added `GET /api/dashboard/summary` as a dynamic, read-only aggregation endpoint.
- Current activity totals and the five most recently updated activities come directly from the existing `Activity` records rather than duplicated metric data.
- Generation totals, success rate, most-used activity type, overall and per-page duration averages, a seven-day generation trend, recent events, source totals, and alert conditions are derived server-side from `UsageEvent`.
- `TEST` records are excluded from reporting. `LIVE` and `SIMULATED` records are counted separately and disclosed in the response.
- Added shared TypeScript response types and small client helpers for metric writes and dashboard reads.
- The metric-write helper catches request failures and returns `recorded: false`, providing the non-blocking behaviour required before it is connected to the builders in Phase 4.
- Unexpected database failures are logged server-side, while clients receive short error codes and messages without Prisma details or stack information.
- The established `GET /api/health` route and its response were left unchanged. A successful dashboard summary provides the separate database-connectivity proof agreed in Phase 1.
- No Assessment 1 or Assessment 2 builder, export, CRUD, navigation, visual component, schema, migration, or stored legacy record was changed.

Populated-data verification:

- All HTTP write testing used a disposable copy of the migrated database, never the real demonstration database.
- Before live test events, the summary returned 3 current activities: 2 Wordle and 1 Word Search.
- The 31 simulated records produced 13 generation attempts: 11 successful, 2 failed, and an 84.6% success rate.
- The 12 simulated duration samples produced a rounded overall average of 74,917 ms.
- Four valid requests were stored successfully: page view, page duration, successful generation, and failed generation; each returned HTTP `201`.
- After those disposable writes, the summary returned 15 generation attempts, 12 successful, 3 failed, an 80% success rate, 13 duration samples averaging 76,077 ms, and source disclosure of 4 live plus 31 simulated records.
- The most-used activity type resolved to Wordle, the seven-day trend contained seven dates, and the recent-event list was capped at ten records.
- The existing `/api/health` endpoint returned HTTP `200` with `{"data":{"status":"ok"}}` during the same run.

Validation, empty-state, and resilience evidence:

- Invalid JSON, an unsupported event type, a client-supplied source, a builder/path mismatch, and an out-of-range duration each returned HTTP `400` with a safe error response.
- Against a migrated database with no metric records, the summary still returned the 3 authoritative activity records, zero generation attempts, `null` success rate and most-used type, zero duration samples, a seven-date empty trend, and the `NO_DURATION_DATA` informational alert.
- Against an unmigrated disposable database, both the dashboard and write endpoints returned safe HTTP `500` `DATABASE_ERROR` responses. Prisma diagnostic detail appeared only in server logs.
- The unchanged `/api/health` endpoint continued returning HTTP `200` while the unmigrated database made the Assessment 3 endpoints fail safely.
- Disposable create, read, update, and delete requests against the original activity API returned `201`, `200`, `200`, and `204`; activity count returned to 3 after cleanup.
- `npm run validate:metrics`, `npm run validate:contract`, and `npm run validate:phonemes` passed.
- Focused ESLint checks passed for every Phase 3 file.
- The production build and TypeScript checks passed and listed both new API routes alongside the unchanged `/api/health` route.
- All three disposable databases were removed after testing.
- The real database SHA-256 remains `5F9FF05E44D7BCE38259F32144EA841D189924D77E1BF398E6B6B2994222F208`, matching the Phase 2 post-migration hash.
- The real database still contains 3 activities, 7 words, 22 phonemes, and exactly 31 `SIMULATED` events; no `LIVE` test record was introduced.

Accepted boundary for the next phase:

- The client write helper is intentionally not called by either builder yet. Phase 4 will add the two small export hooks and page-duration tracking, then prove that a metrics outage cannot interrupt an original export.
- The dashboard response is complete, but no user-facing dashboard page is claimed until Phase 5.

Video evidence/narration value:

- The summary response can demonstrate that Assessment 2 activity data and Assessment 3 operational events are aggregated without duplicating ownership of saved activities.
- The safe error response and unchanged `/api/health` response provide concise resilience evidence.
- A concise narration point is: "The public metrics route validates and stores small live events, while the dashboard service aggregates both labelled simulated and live records and keeps test data out of the report."

---

## Phase 4: Minimal builder instrumentation

### Purpose

Connect the established application actions to Assessment 3 reporting without redesigning the Wordle or Word Search builders.

### Work

- Add page-duration tracking to approved application pages.
- Record generation attempts around the existing Wordle export action.
- Record generation attempts around the existing Word Search export action.
- Record `GENERATION_SUCCESS` only after the export path completes as defined in Phase 1.
- Record `GENERATION_FAILURE` when generation throws or validation prevents an attempted export, according to the agreed definition.
- Associate events with activity type and saved activity ID where available.
- Do not store raw word lists, clues, phonemes, or other unnecessary content in usage events.
- Keep instrumentation failures non-blocking and observable through development logging.
- Preserve existing button labels, output content, gameplay, and saved-activity behaviour unless separately approved.

### Verification

- A Wordle export creates the expected success event.
- A Word Search export creates the expected success event.
- A controlled failure creates a failure event.
- Time-on-page samples are validated and stored.
- Existing exports still open and download as standalone HTML.
- The builders remain usable when the metrics endpoint is unavailable.

### Checkpoint

- Real use of both builders updates the reporting data.
- Existing Assessment 1 and Assessment 2 workflows remain intact.

### Phase 4 completion log - 25 September 2026

Status: **Complete. Both builders and approved application routes now emit non-blocking, validated usage events.**

Files added:

- `app/src/components/telemetry/PageUsageTracker.tsx`

Files changed:

- `app/src/app/layout.tsx`
- `app/src/app/wordle/page.tsx`
- `app/src/app/word-search/page.tsx`

Implementation outcome:

- Mounted one client-side page-usage tracker in the existing root layout without changing the theme bootstrap, header, main content, or footer structure.
- The tracker accepts only the approved route allowlist and records one `PAGE_VIEW` when an approved page opens.
- It records one best-effort `PAGE_DURATION` sample when the route changes, the document becomes hidden, or the page is unloaded.
- Durations shorter than 1 second are ignored and longer visits are capped at the documented 30-minute maximum before submission.
- Builder page events are labelled with `WORDLE` or `WORD_SEARCH`; no user identity, classroom content, query string, or arbitrary path is collected.
- A deferred page-view request avoids duplicate development-only events caused by React Strict Mode immediately cleaning up and re-running effects.
- Wrapped the existing Wordle and Word Search HTML export sequences with generation outcome recording without changing the generated HTML functions, filenames, button labels, window opening, download clicks, gameplay, or saved-activity workflow.
- A completed HTML build/open/download sequence records `GENERATION_SUCCESS`.
- An empty export attempt records `GENERATION_FAILURE` with `EMPTY_ACTIVITY`; an unexpected caught export exception records `GENERATION_FAILURE` with `GENERATION_ERROR`.
- A selected saved activity ID is attached to its export event. Unsaved drafts remain valid and omit the optional ID.
- Metric requests remain fire-and-forget through the Phase 3 helper. A rejected request logs a concise warning but cannot prevent a valid export from completing.

Clean browser verification using an isolated database:

- A fresh disposable copy began with the 31 simulated records only: 11 generation successes, 2 failures, and 12 duration samples.
- Headless Edge loaded the real production Wordle and Word Search pages and selected an existing saved activity in each builder.
- Wordle export retained the original success feedback and downloaded `phonotrail-wordle.html` at 17,277 bytes with the expected `PhonoTrail Studio — Wordle` title.
- Word Search export retained the original success feedback and downloaded `phonotrail-word-search.html` at 28,638 bytes with the expected `PhonoTrail Studio Word Search` title.
- Each valid export stored one `GENERATION_SUCCESS` record with the correct activity type, route, and selected saved-activity ID.
- A controlled `URL.createObjectURL` exception exercised the real Wordle catch path, showed safe failure feedback, and stored one `GENERATION_FAILURE` with `GENERATION_ERROR`.
- Navigating Wordle to Word Search and back stored two valid duration samples: 4,098 ms for `/wordle` and 1,474 ms for `/word-search`.
- The clean browser session produced exactly 8 live records: 3 page views, 2 page durations, 2 generation successes, and 1 generation failure.
- The dashboard aggregate changed from 11 to 13 successful generations, 2 to 3 failures, and 12 to 14 duration samples.
- The browser's metrics requests were then deliberately rejected while the original Wordle export APIs remained available. The HTML export still completed and displayed the original success message, while the database correctly received no additional success event.
- The downloaded standalone files were inspected independently and retained their expected document titles.

Regression and safety evidence:

- `npm run validate:metrics` passed with 4 valid payloads accepted and 8 invalid payloads rejected.
- `npm run validate:contract` passed.
- `npm run validate:phonemes` passed for forward, reverse, and split-token cases.
- Focused ESLint passed for all Phase 4 changes when the one pre-existing Word Search `set-state-in-effect` baseline rule was excluded. Running without that exclusion reports only the already-documented line 453 baseline finding.
- The production build and TypeScript checks passed with all existing and Assessment 3 routes present.
- Browser testing used a copied database, a dedicated browser profile, and a temporary download directory. All were removed after verification.
- The real database SHA-256 remains `5F9FF05E44D7BCE38259F32144EA841D189924D77E1BF398E6B6B2994222F208`.
- The real database remains at 3 activities, 7 words, 22 phonemes, and 31 simulated events with zero live test events.
- No activity CRUD route, Prisma schema, migration, saved record, gameplay rule, or standalone output template was changed.

Accepted limitations:

- Page-duration delivery is intentionally best-effort because browsers may cancel network work during shutdown. The tracker uses `keepalive`, and the dashboard always exposes the sample count rather than implying complete session coverage.
- Generation telemetry describes use of the existing export action. It does not track in-preview game moves or store any word/phoneme content.

Video evidence/narration value:

- The final video can export one activity, refresh the dashboard, and show that the corresponding database-backed generation count changes.
- The non-blocking outage test supports the claim that reporting is additive and cannot become a dependency of the classroom export workflow.
- A concise narration point is: "After the original standalone export completes, the builder sends a small non-blocking outcome event; if metrics are unavailable, the file still opens and downloads normally."

---

## Phase 5: Dashboard interface and reporting views

### Purpose

Build the main Assessment 3 user-facing feature and align it directly with the highest-weight dashboard rubric criterion.

### Work

- Add a dedicated Dashboard route and navigation entry.
- Use the existing site layout, colour variables, typography, panels, and responsive conventions.
- Present the required headline statistics:
  - Total current activities.
  - Wordle activity count.
  - Word Search activity count.
  - Average time on page.
  - Most-used activity type.
  - Successful generations.
  - Failed generations.
  - Generation success rate.
- Add a clear application/database health indicator.
- Add a recent activity or recent event report.
- Add a simple comparison view for Wordle and Word Search usage.
- Add useful links from dashboard activity summaries to the existing builders.
- Show generated-output support clearly without embedding or duplicating the full builder.
- Include accessible loading, empty, warning, success, and failure states.
- Ensure statistics do not rely on colour alone.
- Use semantic headings, tables/lists where appropriate, labelled visual summaries, visible focus, and readable responsive layouts.
- Prefer simple CSS-based bars or summaries over a heavy chart dependency unless a chart library provides clear value.

### Reporting views

At minimum, the dashboard should make these relationships understandable:

- Stored activity configurations by type.
- Generation attempts and outcomes.
- Usage by activity type.
- Average page duration.
- Recent events or recent activity changes.
- Current operational health.

Optional additions should only be included if the mandatory views are already strong:

- Date-range filter.
- Daily generation trend.
- Most recently updated activities.
- Activity configuration summaries by difficulty.

### Verification

- Dashboard data comes from the database-backed summary API.
- Simulated and real records produce understandable output.
- Empty database and empty metric states remain useful.
- Warning states are visible and accurately explained.
- Dashboard works at desktop and mobile widths.
- Dashboard is keyboard navigable and screen-reader understandable.

### Checkpoint

- Every dashboard and observability rubric item has visible evidence.
- Wordle and Word Search generation support is clearly connected to stored data.
- No original builder has been redesigned.

### Phase 5 completion log - 25 September 2026

Status: **Complete. The responsive, data-driven Assessment 3 dashboard and reporting views are implemented.**

Files added:

- `app/src/app/dashboard/page.tsx`
- `app/src/components/dashboard/MetricCard.tsx`
- `app/src/components/dashboard/StatusAlert.tsx`

Files changed:

- `app/src/components/layout/SiteHeader.tsx`
- `app/src/app/globals.css`

Implementation outcome:

- Added the dedicated `/dashboard` route and a Dashboard entry to the existing desktop and mobile navigation.
- Added all eight required headline statistics: total current activities, saved Wordle count, saved Word Search count, average time on page with sample count, most-used activity type, successful generations, failed generations, and generation success rate.
- Added explicit application and database health text plus the summary generation time and a refresh control.
- Rendered the server-defined alerts with visible Information, Warning, or Error labels so meaning never depends on colour alone.
- Added a Wordle-versus-Word Search generation comparison with text counts and lightweight CSS bars.
- Added generation outcome totals and an accessible combined success/failure bar.
- Added semantic tables for average duration by page, the seven-day generation trend, and the ten most recent operational events.
- Added a recent saved-activity report with type, title, word count, difficulty, updated time, and a link to the correct existing builder.
- Added explicit disclosure of `LIVE` and `SIMULATED` record totals and stated that `TEST` records are excluded.
- Added useful loading, healthy, all-clear, informational, warning, empty-data, empty-activity, and request-error presentations.
- The error screen provides a retry button and direct links to both builders, reinforcing that reporting failure does not block the original classroom workflow.
- Added a one-column mobile, two-column tablet, and four-column desktop metric layout. Larger reports use responsive grids and horizontally scrollable semantic tables where needed.
- Used the existing palette, typography, panels, buttons, shadows, dark-theme variables, and responsive conventions without redesigning either builder.

Populated dashboard evidence:

- The dashboard loaded from the real `GET /api/dashboard/summary` response against a disposable copy of the demonstration database.
- Current activity cards showed 3 saved configurations: 2 Wordle and 1 Word Search, sourced from `Activity`.
- Operational cards initially showed 11 successful generations, 2 failed generations, 13 total attempts, and an 84.6% success rate.
- Wordle was identified as the most-used activity type from 7 attempts compared with 6 Word Search attempts.
- The initial 12 duration samples displayed as an average of approximately 1 minute 15 seconds.
- The seeded `GENERATION_FAILURES` rule appeared as an explicit Warning with the message that 2 failed attempts occurred during the seven-day window.
- The page-duration report, seven-day trend, recent saved activities, and recent operational events all rendered from the database-backed response.
- Live and simulated source totals were presented separately. Opening and leaving disposable dashboard sessions also demonstrated that Phase 4 page tracking contributes new live page records and duration samples.

Empty and error-state evidence:

- Against a migrated database with activities but no metric records, the API and UI retained the 3 current saved activities while showing no generation data, no most-used type, no duration average, zero samples, a zero-valued seven-day trend, and the `NO_DURATION_DATA` information state.
- Against a fully empty migrated database, the UI displayed zero saved activities, `No data yet` for undefined metrics, builder guidance, `NO_ACTIVITIES`, and `NO_DURATION_DATA` without presenting unknown values as measured zero percentages or durations.
- Against an unmigrated disposable database, the summary returned safe HTTP `500` `DATABASE_ERROR`; the dashboard displayed `Reporting data is unavailable`, `Try again`, `Open Wordle`, and `Open Word Search` without exposing Prisma details.
- Server logs retained the useful Prisma `P2021` diagnosis while the browser received only the safe message.

Responsive and accessibility verification:

- Desktop renders were inspected at 1,440 × 1,600 and showed a balanced 4 × 2 headline metric grid plus two-column reporting panels.
- A narrow 500-pixel render showed the mobile menu and a readable single-column metric/report flow.
- Real device emulation at 390 × 844 reported `innerWidth = 390`, document and body scroll widths of 390, one metric column, eight metric cards, visible mobile navigation, and hidden desktop navigation.
- The mobile navigation toggle was focused and opened from the keyboard; the next Tab target was the Home link.
- The browser accessibility tree exposed the operational dashboard heading, saved-metric heading, labelled system health, Refresh button, both builder links, and accessible names from all three table captions.
- The checked accessibility tree contained 19 headings, 3 tables, 11 links, and 2 buttons in the populated mobile state.
- Dashboard-specific buttons and links have visible focus outlines, and the loading animation respects reduced-motion preferences.

Regression and safety evidence:

- Focused ESLint passed for all dashboard, navigation, and telemetry files changed or consumed in this phase.
- `npm run validate:metrics`, `npm run validate:contract`, and `npm run validate:phonemes` passed.
- The final production build and TypeScript checks passed and included `/dashboard` with every existing route.
- All populated, empty, error, desktop, and mobile checks used disposable databases and temporary browser profiles. Temporary databases, screenshots, profiles, and test scripts were removed after review.
- Final submission screenshots should be captured again from the fully integrated Phase 10 or Phase 12 build so they reflect the submitted state.
- The real database SHA-256 remains `5F9FF05E44D7BCE38259F32144EA841D189924D77E1BF398E6B6B2994222F208`.
- The real database remains at 3 activities, 7 words, 22 phonemes, and 31 simulated events with zero live test events.
- No builder page, HTML export template, activity CRUD route, schema, migration, or stored legacy record was changed during Phase 5.

Video evidence/narration value:

- The populated dashboard is now the main visual anchor for the Assessment 3 walkthrough and exposes every required statistic in the opening reporting segment.
- The source disclosure allows the narration to distinguish honest simulated evidence from live use.
- The recent activities and builder links make the relationship between stored Assessment 2 configurations and new Assessment 3 operational reporting visible on one page.
- A concise narration point is: "The dashboard combines authoritative saved-activity counts with validated usage events, clearly discloses simulated data, and turns those records into health, reliability, duration, trend, and recent-activity reports."

---

## Phase 6: Alerts, resilience, and reporting hardening

### Purpose

Make unusual states visible and ensure the new reporting layer fails safely.

### Work

- Implement the approved warning rules from Phase 1.
- Distinguish informational empty states from operational warnings and errors.
- Add a safe retry path when dashboard loading fails.
- Confirm malformed metric events do not affect existing activity data.
- Confirm dashboard queries handle missing, partial, and simulated data.
- Confirm unusually large duration or metadata values are rejected.
- Add server-side limits to metric inputs.
- Confirm no dashboard response leaks raw database errors or unnecessary event metadata.
- Verify that deleting an activity does not corrupt historical usage reporting.

### Checkpoint

- Alerts are meaningful, reproducible, and easy to explain in the video.
- Dashboard failures cannot break the builders.
- Historical reporting remains understandable after activity deletion.

### Phase 6 completion log - 27 September 2026

Status: **Complete. Alert policy, input limits, aggregation resilience, retry recovery, and historical reporting are hardened and verified.**

File added:

- `app/src/lib/server/dashboard-alerts.ts`
- `app/scripts/validate-dashboard-alerts.ts`

Files changed:

- `app/src/app/api/metrics/events/route.ts`
- `app/src/lib/domain/metrics.ts`
- `app/src/lib/server/metrics.ts`
- `app/scripts/validate-metrics-contract.ts`
- `app/package.json`
- `course-materials/md/Assessment3_Metrics_Contract.md`

Implementation outcome:

- Extracted the server alert policy into a focused pure module without changing any alert code, severity, title, message, or threshold defined in Phase 1.
- Added `npm run validate:alerts` with eight reproducible policy and boundary cases.
- Added a 4,096-byte UTF-8 limit for the complete public metric-event request body.
- Requests declared above the limit and streamed requests that cross the limit both return HTTP `413` with `PAYLOAD_TOO_LARGE`.
- The limiter stops reading a streamed body once the limit is exceeded, before JSON parsing or database validation.
- Retained strict Zod field and cross-field validation after the body-size gate.
- Hardened server aggregation so calculated metrics accept only recognised event shapes, matching generation type/path pairs, controlled failure codes, tracked page paths, and durations from 1,000 to 1,800,000 ms.
- Invalid or partial rows inserted outside the public endpoint are excluded consistently from generation totals, duration reports, recent events, and live/simulated source disclosure.
- Current saved-activity queries remain independent from historical usage events.
- Updated the approved metrics contract with the payload limit, safe `413` response, and valid-record source-count definition.

Alert-policy evidence:

- The healthy policy case returned no alerts.
- No activities plus no duration samples returned `NO_ACTIVITIES` and `NO_DURATION_DATA`.
- A database retaining only Word Search activities returned `NO_WORDLE_ACTIVITIES`.
- A database retaining only Wordle activities returned `NO_WORD_SEARCH_ACTIVITIES`.
- Recent failures returned `GENERATION_FAILURES`.
- Five attempts at a 79.9% rate triggered `LOW_GENERATION_SUCCESS_RATE`.
- A low rate with only four attempts did not trigger the low-rate warning because the documented minimum sample size is five.
- Exactly 80% did not trigger the low-rate warning because the threshold is strictly below 80%.
- A database-level low-rate scenario with 1 success and 4 failures produced a 20% rate and both `GENERATION_FAILURES` and `LOW_GENERATION_SUCCESS_RATE`.
- A database-level healthy scenario with 5 successes, both activity types, and one valid duration sample returned no alerts.
- The normal 31-record simulated dataset retained its expected single `GENERATION_FAILURES` warning.

Input and legacy-data protection evidence:

- Invalid JSON returned HTTP `400` `INVALID_JSON`.
- A duration of 1,800,001 ms returned HTTP `400` `VALIDATION_ERROR`.
- Arbitrary metadata and an unsupported event type returned HTTP `400` `VALIDATION_ERROR`.
- A 5,000-character metadata payload returned HTTP `413` `PAYLOAD_TOO_LARGE` when sent normally and when streamed without a `Content-Length` header.
- Before and after all rejected requests, the disposable database remained at 3 activities, 7 words, 22 phonemes, and 31 events with the same most-recent activity timestamp.
- A valid request through the hardened route still returned HTTP `201` with `recorded: true`.
- The metrics contract now accepts 4 representative valid events and rejects 9 invalid events, including values above both duration boundaries.

Partial and malformed data evidence:

- Five deliberately invalid direct database records covered an unknown event type, oversized duration, partial generation, mismatched generation type/path, and a page view carrying a forbidden duration.
- The raw copied database contained those five rows, but the hardened summary remained at 11 successes, 2 failures, 12 duration samples, and a 74,917 ms average.
- None of the five invalid IDs appeared in recent events.
- Source disclosure remained 0 valid live and 31 valid simulated events rather than misleadingly counting excluded rows.
- The populated summary continued returning HTTP `200` and the expected `GENERATION_FAILURES` warning.

Historical reporting after deletion:

- A disposable Wordle activity received a live `GENERATION_SUCCESS` linked by its activity ID.
- Before deletion, the copied database reported 3 current activities, 2 Wordle activities, 12 successes, 2 failures, and 14 attempts.
- Deleting that activity returned HTTP `204` and correctly cascaded only its saved words and phonemes.
- After deletion, current totals changed to 2 activities and 1 Wordle, while historical generation totals remained at 12 successes, 2 failures, and 14 attempts.
- The historical event remained stored with the deleted activity ID and remained understandable in the API as a Wordle generation success without exposing the raw activity ID to the dashboard.

Retry and safe-failure evidence:

- Headless Edge forced the first `/api/dashboard/summary` request to fail at the network layer.
- The dashboard displayed `Reporting data is unavailable`, a safe `Failed to fetch` message, `Try again`, `Open Wordle`, and `Open Word Search`.
- The retry button was activated from the keyboard after the interception was removed.
- The same page recovered to `Operational dashboard`, `Application healthy`, `Database connected`, all eight metric cards, and the expected labelled warning.
- Against an unmigrated disposable database, summary and metric writes returned safe HTTP `500` `DATABASE_ERROR` messages containing no Prisma code, table name, stack, or filesystem path.
- Detailed Prisma `P2021` context remained available only in server logs.
- The unchanged `/api/health` route returned HTTP `200`, and both builder documents still returned HTTP `200` while Assessment 3 database operations failed safely.
- Phase 4 already proved that a metrics-request outage cannot prevent either original HTML export; Phase 6 confirms the reporting UI also fails and recovers independently.

Regression and safety evidence:

- `npm run validate:alerts` passed 8 alert and threshold cases.
- `npm run validate:metrics` passed with 4 valid and 9 invalid event cases.
- `npm run validate:contract` passed.
- `npm run validate:phonemes` passed for forward, reverse, and split-token cases.
- Focused ESLint passed for every Phase 6 TypeScript file.
- The production build and TypeScript checks passed with all existing and Assessment 3 routes.
- Every mutation, deletion, malformed row, unavailable-database check, and browser retry used isolated database copies and temporary profiles. All temporary artifacts were removed afterward.
- The real database SHA-256 remains `5F9FF05E44D7BCE38259F32144EA841D189924D77E1BF398E6B6B2994222F208`.
- The real database remains at 3 activities, 7 words, 22 phonemes, and 31 simulated events with zero live test events.
- No builder, standalone export, activity API contract, Prisma schema, migration, or legacy stored record was changed.

Video evidence/narration value:

- The existing seeded generation-failure warning is the clearest repeatable unusual state to show in the final video.
- The warning is defensible because it comes from disclosed simulated input and a documented seven-day server rule, not a manually styled demonstration message.
- A concise narration point is: "Alert rules are evaluated consistently on the server, malformed or oversized events are rejected without touching activity data, and the dashboard provides a safe retry while the original builders remain independent."

---

## Phase 7: Playwright end-to-end testing

### Purpose

Create reproducible browser-level evidence for both the teacher builder workflow and the generated activity/user workflow.

### Test isolation

- Use a dedicated test database, never the checked-in demonstration database.
- Provide deterministic setup and cleanup.
- Avoid tests that depend on random existing records.
- Give generated test activities unique, recognisable names.
- Keep screenshots, traces, or videos only when they provide useful evidence.

### Required Playwright scenarios

1. **Builder/CRUD use case**
   - Open a builder.
   - Create and save an activity.
   - Confirm it appears in saved activities.
   - Reload or revisit and retrieve it.
   - Update a setting or word.
   - Confirm the updated value persists.
   - Delete the test activity.
   - Confirm it no longer appears.

2. **Generated activity/user use case**
   - Load or create a known activity.
   - Generate or open the Wordle or Word Search output.
   - Exercise a meaningful interaction in the preview or standalone output.
   - Confirm generation success appears in the dashboard/reporting data.

### Additional high-value checks

- Dashboard loads required metric cards.
- `/health` returns 200.
- Invalid activity input produces a clear error.
- Word Search keyboard interaction works.
- Multi-character phonemes remain intact.
- Dashboard empty/error states are accessible.

### Deliverables

- Playwright configuration.
- Test database setup instructions.
- Named test files grouped by builder and reporting behaviour.
- A concise command that runs the Assessment 3 test suite.
- Evidence suitable for the video, such as the passing terminal summary and one trace/report view.

### Checkpoint

- The two explicitly required Playwright use cases pass consistently.
- Tests do not alter the demonstration database.
- Failures provide enough output to diagnose the problem.

### Phase 7 completion log - 27 September 2026

Status: **Complete. Both required Playwright workflows pass consistently against a freshly migrated disposable database. Progression is paused at the fatal-flaw gate described below.**

Files added:

- `app/playwright.config.ts`
- `app/scripts/prepare-playwright-db.mjs`
- `app/e2e/builder-crud.spec.ts`
- `app/e2e/generated-activity-reporting.spec.ts`
- `app/e2e/README.md`
- `app/AGENTS.md` and `app/CLAUDE.md`, generated by Next.js 16.3 when the test server first ran and retained as recommended by its version-matched guidance.

Files changed:

- `app/package.json`
- `app/package-lock.json`
- `app/.gitignore`

Test harness and isolation outcome:

- Added `@playwright/test` as a development dependency without downloading another browser; the suite uses the locally installed Microsoft Edge channel.
- Added `npm run test:e2e` as the single repeatable command. It prepares the database, starts Next.js on `127.0.0.1:3100`, runs the suite, and stops the server.
- The preparer removes and recreates only `app/prisma/playwright/test.db`, then applies both committed Prisma migrations. It never copies, opens, seeds, or writes to `app/prisma/prisma/dev.db`.
- Tests run with one worker to make database state deterministic.
- Failure-only screenshots and retained failure traces are written to ignored `test-results/`; every run also produces an ignored HTML report in `playwright-report/`.
- `app/e2e/README.md` documents setup, isolation, test purposes, commands, and report locations.

Builder/CRUD evidence:

- Opened the Word Search builder and waited for its initial saved-activity request to complete.
- Created the recognisable `A3 E2E Builder Activity` with a 7-by-9 grid and multi-character phonemes including `tʃ`, `ʃ`, and `iː`.
- Confirmed the saved option appeared, reloaded the route, selected the record again, and verified the title, word list, rows, and columns were restored.
- Updated the title, changed the grid to 10 rows, and changed the first word to include `dʒ` and `æ`.
- Reloaded again and verified the update through both the builder controls and the activity API, including ordered phoneme persistence.
- Deleted the disposable activity, confirmed its option disappeared, and confirmed its API resource returned HTTP `404`.

Generated activity/user and reporting evidence:

- Confirmed `GET /api/health` returned HTTP `200` with `{"data":{"status":"ok"}}`.
- Confirmed invalid empty Wordle input returned HTTP `400` with the public `VALIDATION_ERROR` response.
- Created and loaded a known disposable Wordle activity through the real API and builder.
- Used the live preview's accessible phoneme keyboard to enter the exact `p t` answer and received the visible correct result.
- Triggered the existing standalone HTML export, captured the browser download, and confirmed the filename `phonotrail-wordle.html`.
- Waited for the non-blocking generation event, confirmed one successful generation through `/api/dashboard/summary`, then opened `/dashboard` and confirmed the required metric section, success value, and live-source disclosure were rendered.
- Deleted the disposable saved activity in test cleanup. Its reporting event remained only inside the disposable Playwright database.

Verification and repeatability evidence:

- The full suite passed twice from a newly recreated database each time: `2 passed (5.3s)` in both verified runs.
- Focused ESLint passed for the Playwright configuration, both test files, and the database preparer.
- `npx tsc --noEmit` passed.
- The production build passed and generated all 12 existing routes, including the dashboard, metrics, activities, and health routes.
- The first test-development run retained a screenshot, DOM context, and trace that made a timing problem immediately diagnosable: the test saved before the builder's initial list request completed. Waiting for the builder's loading status resolved the test without changing Assessment 1 or 2 behavior.
- Prisma on Windows required the alternate SQLite file to exist before `migrate deploy`; the preparer now creates only that empty disposable file before applying the real migration chain.
- The real database SHA-256 remains `5F9FF05E44D7BCE38259F32144EA841D189924D77E1BF398E6B6B2994222F208`.
- No builder implementation, activity API contract, Prisma schema, migration, demonstration record, or standalone export was changed in this phase.

Fatal-flaw gate requiring student approval:

- Installing the test dependency caused npm to print its current audit result. A follow-up read-only `npm audit` found that the existing direct dependency `next@16.3.0` is inside critical unauthenticated remote-code-execution advisory ranges.
- The Windows-hosted server advisory `GHSA-p293-qw3h-jr36` affects Next.js 16.0.0 through 16.3.2, has no known workaround for affected Windows hosts, and identifies 16.3.3 as patched.
- The AVIF image-optimisation advisory `GHSA-2xp9-vwfh-vxw4` affects the same 16.x range and identifies 16.3.3 as patched.
- A newer `next/og` advisory also affects versions before 16.3.6. This application does not currently import `next/og`, but npm recommends `next@16.3.6`, which resolves the direct Next.js audit finding in one patch-level update.
- No dependency upgrade has been applied because Next.js is part of the established Assessment 1/2 baseline. The smallest proposed fix is to update only `next` from 16.3.0 to 16.3.6, regenerate the lockfile, and rerun the complete validation, build, Playwright, and later Docker regression sequence after explicit approval.

Video evidence/narration value:

- Show the two named tests beside the concise `2 passed` terminal output or open the generated HTML report.
- A concise narration point is: "Playwright recreates an isolated migrated database, proves the complete teacher CRUD workflow, then solves and exports a known Wordle activity and verifies that its success reaches the dashboard. Both tests pass without touching the demonstration database."

---

## Phase 8: JMeter load testing

### Purpose

Measure and explain how the application behaves under increasing traffic rather than merely showing that a JMeter file exists.

### Test design

- Use a controlled local or Docker production build.
- Record the exact hardware/runtime context used for results.
- Prefer safe read-heavy endpoints for the highest traffic levels.
- Use a separate disposable database for write tests.
- Do not run 10,000 concurrent destructive writes against the demonstration database.
- Define staged levels equivalent to 1, 10, 100, 1,000, and 10,000 users or requests, with documented ramp-up and duration.

### Candidate request flow

- `GET /health`
- `GET /api/dashboard/summary`
- `GET /api/activities`
- Optional controlled event write to `POST /api/metrics/events`
- Optional smaller-scale activity create/read/delete sequence against a disposable database

### Metrics to capture

- Request count.
- Throughput.
- Average response time.
- Median and percentile response times where available.
- Minimum and maximum response time.
- Error count and error percentage.
- Behaviour at each load stage.

### Deliverables

- Version-controlled `.jmx` test plan.
- A small documented results summary rather than an unnecessarily large raw-results commit.
- Tables or screenshots appropriate for the video.
- Explanation of the first point at which latency or errors become unacceptable.
- Clear limitations, particularly SQLite write concurrency and local-machine resource limits.

### Checkpoint

- Every required traffic level has a recorded result or a clearly justified equivalent stage.
- Results are interpreted honestly rather than presented as pass/fail only.
- The demonstration database remains safe.

### Phase 8 completion log - 28 September 2026

Status: **Complete. The version-controlled JMeter plan ran all five request-volume stages successfully, with honest local-environment interpretation and no demonstration-database writes.**

Files added:

- `app/load-tests/assessment3-read-load.jmx`
- `app/load-tests/README.md`
- `app/load-tests/results/Assessment3_JMeter_Results.md`

File changed:

- `app/.gitignore`

Load-plan design:

- The JMX plan sends only safe `GET` traffic to `/api/health`, `/api/dashboard/summary`, and `/api/activities`.
- Each sampler includes an HTTP 200 response assertion, so a non-200 response or assertion failure contributes to the reported error rate.
- Host, port, thread count, loop count, and ramp time are command-line properties rather than hard-coded environment assumptions.
- The five stages represent 1, 10, 100, 1,000, and 10,000 requests per endpoint. Because each iteration calls three endpoints, this produced 3, 30, 300, 3,000, and 30,000 total samples.
- Configured thread counts were 1, 10, 25, 50, and 100, with loops of 1, 1, 4, 20, and 100 and ramp-up periods of 1, 2, 5, 10, and 20 seconds.
- The largest stage is explicitly documented as a 10,000-request-per-endpoint equivalent, not 10,000 simultaneous desktop threads.
- Before results were collected, unacceptable performance was defined as more than 1% errors or aggregate p95 above 2,000 ms; aggregate p95 above 500 ms was defined as degraded.
- Raw `.jtl`, log, and HTML dashboard output is retained locally under ignored `app/load-tests/raw-results/`. Only the small plan, instructions, and interpreted results are version controlled.

Tooling and runtime context:

- The machine did not have Java or JMeter on its Windows PATH, and WSL access remained denied by the managed execution environment.
- Portable Eclipse Temurin Java `21.0.12.1+1` and Apache JMeter `5.6.3` were downloaded to a task-specific temporary directory rather than installed system-wide.
- The Temurin archive matched SHA-256 `d35f31e712f0fcf6ac5a093edc90204fbff22f720ba3950bd09d331d5e621636` from the Adoptium API.
- The JMeter archive matched Apache's published SHA-512 `387fadca903ee0aa30e3f2115fdfedb3898b102e6b9fe7cc3942703094bd2e65b235df2b0c6d0d3248e74c9a7950a36e42625fd74425368342c12e40b0163076`.
- The application used the existing Next.js `16.3.0` production build and Node.js `24.12.0` on loopback port 3200.
- Hardware recorded for interpretation: Windows x64 release `10.0.26200`, AMD Ryzen 7 9800X3D, 16 logical processors, and approximately 31.7 GiB memory.
- The server used a freshly migrated and seeded disposable SQLite database containing 2 activities, 5 words, 15 phonemes, and 31 deterministic simulated events.

Measured stage results:

| Requests per endpoint | Total samples | Mean | Median | p95 | p99 | Maximum | Throughput | Errors |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 3 | 35.00 ms | 37 ms | 46.00 ms | 46.00 ms | 46 ms | 27.52 req/s | 0 |
| 10 | 30 | 3.13 ms | 2 ms | 12.70 ms | 16.00 ms | 16 ms | 17.07 req/s | 0 |
| 100 | 300 | 2.94 ms | 2 ms | 13.95 ms | 17.99 ms | 29 ms | 62.50 req/s | 0 |
| 1,000 | 3,000 | 2.48 ms | 1 ms | 13.00 ms | 16.00 ms | 31 ms | 304.41 req/s | 0 |
| 10,000 | 30,000 | 2.19 ms | 1 ms | 3.00 ms | 17.00 ms | 122 ms | 1,492.76 req/s | 0 |

Highest-stage endpoint detail:

- Health: 10,000 samples, 0.85 ms mean, 2 ms p95, 19 ms maximum, and 497.66 requests/second.
- Dashboard summary: 10,000 samples, 3.75 ms mean, 13 ms p95, 64 ms maximum, and 498.13 requests/second.
- Activities: 10,000 samples, 1.96 ms mean, 4 ms p95, 122 ms maximum, and 498.21 requests/second.
- Across all stages, JMeter recorded 33,333 samples, zero assertion failures, zero non-200 responses, and a 0.00% error rate.

Interpretation and limitations:

- No stage reached either the degraded or unacceptable threshold. The first unacceptable point was not reached within this read-only profile and must not be invented.
- The three-sample first stage includes cold application, database, and runtime work. Later stages use a warmed process and larger samples, so their lower percentile values do not prove that additional load improves performance.
- The dashboard aggregation remained predictably slower than health, but its 13 ms p95 at the largest stage was still well below the 500 ms degraded threshold.
- These are local loopback results for one small SQLite dataset and one machine. They demonstrate comparative behaviour, not cloud capacity or internet-facing performance.
- High-volume writes were deliberately excluded. SQLite write serialisation is a different constraint, and exercising 10,000 destructive or telemetry writes would add risk without improving the required read-heavy evidence.
- The highest tested read-only stage remained healthy. A true limit would require a harsher condition such as a larger dataset, slower hardware, network latency, sustained simultaneous concurrency, or controlled writes against another disposable database.

Problems encountered and resolved:

- The managed sandbox initially blocked Prisma's schema-engine child process with `EPERM`. Rerunning the established preparer with the required permission successfully created and migrated only the disposable database.
- The first JMeter smoke invocation split the dotted host property in PowerShell. Passing every JMeter property as an explicit argument fixed the command before any load stage ran.
- JMeter printed package-scanning deprecation warnings during startup; the plan still parsed successfully and every run exited cleanly with the expected sample count.

Safety and regression evidence:

- The test database retained exactly 2 activities, 5 words, 15 phonemes, and 31 events after all 33,333 read requests.
- The demonstration database SHA-256 remains `5F9FF05E44D7BCE38259F32144EA841D189924D77E1BF398E6B6B2994222F208`.
- No application source, builder, API contract, Prisma model, migration, demonstration record, or Docker file changed in this phase.
- The unresolved Next.js security update approval from Phase 7 remains open; Phase 8 did not alter that Assessment 1/2 dependency.

Video evidence/narration value:

- Show the five stage definitions in the JMX/README, the concise results table, and the highest-stage JMeter HTML dashboard.
- A concise narration point is: "The read-only JMeter profile increased from one to ten thousand requests per endpoint. All 33,333 samples returned HTTP 200 with zero errors; the final stage reached about 1,493 requests per second with a 3 millisecond aggregate p95. The local read-only limit was not reached, so I report that honestly rather than treating this as production capacity."

---

## Phase 9: Lighthouse accessibility evaluation

### Purpose

Use Lighthouse findings to verify and improve the new Assessment 3 interface while avoiding unnecessary changes to successful A1/A2 pages.

### Work

- Run Lighthouse against the dashboard first.
- Also check the key builder route used in the video if time allows.
- Record the initial accessibility score and findings.
- Fix Assessment 3 issues such as:
  - Missing accessible names.
  - Incorrect heading order.
  - Low colour contrast.
  - Status conveyed only through colour.
  - Missing table captions or chart descriptions.
  - Keyboard focus problems.
  - Unclear live status regions.
- Re-run Lighthouse and record the final score.
- If Lighthouse identifies an issue in established A1/A2 functionality, apply the baseline preservation rule and request approval before changing it unless it is demonstrably fatal.

### Deliverables

- Baseline Lighthouse evidence.
- List of Assessment 3 accessibility changes made in response.
- Final Lighthouse evidence.
- Short explanation connecting the report to design decisions.

### Checkpoint

- The dashboard has strong accessibility evidence.
- Before-and-after results can be demonstrated succinctly.
- No unrelated legacy redesign has occurred.

---

## Phase 10: Full verification and Docker regression

### Purpose

Verify the integrated Assessment 3 application in the environment that will be shown and submitted.

### Verification sequence

1. Start from documented environment variables.
2. Apply Prisma migrations to a backed-up or disposable database.
3. Load deterministic simulated reporting records.
4. Run validation and focused unit/regression scripts.
5. Run lint.
6. Run the production build.
7. Run Playwright.
8. Build and start the Docker image with a named SQLite volume.
9. Confirm `/health` returns 200 from the containerised application.
10. Confirm existing CRUD and both builders still work.
11. Generate one Wordle and one Word Search output.
12. Confirm dashboard counts and generation outcomes update.
13. Confirm dashboard warning and empty states can be demonstrated safely.
14. Repeat the chosen Lighthouse run against the final build.
15. Preserve the final JMeter results and test conditions.

### Regression boundary

Any failure in an existing Assessment 1 or Assessment 2 workflow should be diagnosed first. If correction requires changing established behaviour, stop and request approval under the baseline preservation rule.

### Checkpoint

- The same build supports the dashboard, metrics, tests, exports, database, and Docker evidence.
- Mandatory verification commands and expected results are documented.

---

## Phase 11: Documentation, references, and GitHub evidence

### Purpose

Make the Assessment 3 implementation understandable and professionally reproducible.

### Work

- Update the root and app READMEs for Assessment 3 without deleting useful Assessment 1 or Assessment 2 history.
- Document:
  - Dashboard purpose and route.
  - Metric definitions.
  - Simulated data setup.
  - Prisma migration commands.
  - Health endpoint.
  - Playwright setup and command.
  - JMeter test plan and result location.
  - Lighthouse procedure and final result.
  - Docker verification.
  - Known limitations.
- Update the AI acknowledgement to accurately include Assessment 3 assistance.
- Add or update at least five suitable academic or industry references in APA 7th style.
- Prefer primary sources such as official Next.js, React, Prisma, Playwright, Apache JMeter, Lighthouse, Docker, and WCAG documentation.
- Keep commits focused and descriptive.
- Confirm the GitHub homepage and commit history tell a clear Assessment 3 development story.
- Resolve the current local/remote branch divergence deliberately before final submission; do not overwrite either unique commit accidentally.

### Suggested commit sequence

- `docs: add Assessment 3 implementation plan`
- `feat: add usage-event persistence for reporting`
- `feat: add metrics and dashboard APIs`
- `feat: instrument activity generation and page duration`
- `feat: add Assessment 3 dashboard and alerts`
- `test: add Playwright builder and generation coverage`
- `test: add JMeter load plan and results summary`
- `docs: add Lighthouse evidence and Assessment 3 guidance`

### Checkpoint

- A new developer or marker can reproduce the final application and tests.
- References and AI acknowledgement are accurate.
- Git history provides visible evidence of staged work.

---

## Phase 12: Video, evidence package, and final submission

### Purpose

Produce a concise, rubric-driven demonstration that stays safely inside the mandatory 3-8 minute limit.

### Recommended video structure

- **0:00-0:25 - Identification and scope**
  - Show face and student ID.
  - State the project name and Assessment 3 focus.
- **0:25-1:40 - Dashboard and stored data**
  - Show health status, activity counts, average time, most-used type, and generation outcomes.
  - Explain which values come from current activities and which come from stored usage events.
- **1:40-2:35 - Data flow and observability**
  - Briefly show the Prisma event model and dashboard API.
  - Trigger a generation and show the dashboard/report update.
- **2:35-3:15 - Alerts and reporting**
  - Show one meaningful warning or unusual state.
  - Show recent events or the activity-type comparison.
- **3:15-4:30 - Playwright**
  - Show the builder CRUD test and generated activity/user test passing.
  - Briefly explain what each test proves.
- **4:30-5:40 - JMeter**
  - Show the staged load plan and concise results.
  - Explain throughput, response time, errors, and the system's practical limit.
- **5:40-6:35 - Lighthouse**
  - Show the final accessibility result.
  - Explain at least one design change made because of the report.
- **6:35-7:15 - GitHub and close**
  - Show the repository homepage and focused Assessment 3 commits.
  - Summarise reliability, observability, and known limitations.

Aim for approximately 7 minutes 15 seconds so normal pauses do not exceed the 8-minute maximum.

### Recording checklist

- Student ID shown clearly.
- Face visible.
- Voice narration throughout.
- Dashboard shown with meaningful data.
- Stored data and reporting flow explained.
- Health status shown.
- Alerts shown.
- Wordle or Word Search generation shown affecting statistics.
- Both required Playwright use cases shown.
- JMeter traffic levels and results shown.
- Lighthouse result and resulting design change shown.
- GitHub homepage and commits shown.
- Final duration is between 3 and 8 minutes.

### Packaging checklist

- Create the final zip from the verified source state.
- Exclude `node_modules`, `.next`, environment files, logs, raw test databases, and unnecessary test artifacts.
- Include Prisma schema and migrations.
- Include Playwright tests and configuration.
- Include the JMeter `.jmx` plan and concise results summary.
- Include relevant Lighthouse evidence or documented result location.
- Include the GitHub repository link.
- Include the required AI acknowledgement.
- Include at least five APA 7 references.
- Confirm the uploaded format generates any required similarity score.

### Checkpoint

- The video explicitly covers every rubric category.
- The source archive is reproducible and contains no secrets or unnecessary dependencies.
- The final GitHub state matches the submitted code.

---

## Definition of Done

### Baseline protection

- [x] Assessment 1 and Assessment 2 workflows have been regression-tested.
- [x] No established behaviour was changed without approval.
- [x] Existing activity and phoneme records survive the Assessment 3 migration.

### Dashboard and reporting

- [x] A dedicated data-driven dashboard is implemented.
- [x] Wordle and Word Search counts come from stored activity records.
- [x] Average time on page is displayed and correctly defined.
- [x] Most-used activity type is displayed and correctly defined.
- [x] Successful and failed generation counts are displayed.
- [x] Health status is visible.
- [x] Recent usage or reporting detail is visible.
- [x] Useful empty, loading, warning, and error states are implemented.
- [x] Dashboard links stored data and activity generation clearly.

### Persistence and observability

- [x] Assessment 3 metric records are stored in the database.
- [x] Simulated records are deterministic and documented.
- [x] Metric ingestion is validated.
- [ ] `/api/health` returns HTTP 200 in the final verified environment.
- [x] Dashboard aggregation handles empty and populated data.
- [x] Instrumentation failure cannot break the original builders.

### Testing and accessibility

- [x] Playwright builder/CRUD test passes.
- [x] Playwright generated activity/user test passes.
- [x] Playwright uses an isolated test database.
- [x] JMeter results exist for all required staged traffic levels or justified equivalents.
- [x] JMeter results are interpreted and limitations are documented.
- [ ] Lighthouse accessibility evidence is recorded.
- [ ] Accessibility findings influenced at least one documented design decision where needed.

### Quality, documentation, and submission

- [ ] Lint passes.
- [ ] Production build passes.
- [ ] Docker build and runtime verification pass.
- [ ] Existing CRUD and both standalone exports still work.
- [ ] README documents Assessment 3 setup, metrics, tests, and evidence.
- [ ] AI acknowledgement is current.
- [ ] At least five APA 7 references are included.
- [ ] GitHub history shows focused Assessment 3 progress.
- [ ] Video is between 3 and 8 minutes and covers all required evidence.
- [ ] Final zip excludes `node_modules`, `.next`, secrets, and unnecessary artifacts.

---

## Risk register

### 1. Assessment 3 work accidentally destabilises completed builders

Mitigation: keep changes additive, isolate instrumentation helpers, use regression tests, and require approval for legacy behaviour changes.

### 2. Dashboard numbers are technically present but ambiguous

Mitigation: define each metric before implementation and distinguish current totals from historical event counts.

### 3. Client-side exports are not observable

Mitigation: add small validated success/failure event calls around the established export functions without moving or rewriting the export system.

### 4. Time-on-page data is unreliable

Mitigation: define start/end behaviour, validate duration ranges, accept that browser exit delivery is best-effort, and seed deterministic simulated records for demonstration.

### 5. Random or sparse data produces a weak dashboard

Mitigation: use deterministic simulated input records and clearly distinguish them from live events when appropriate.

### 6. SQLite becomes a bottleneck during JMeter writes

Mitigation: use read-heavy high-load stages, isolate write testing, document SQLite's concurrency limitations, and avoid presenting local load results as production-scale capacity.

### 7. Load testing damages the demonstration database

Mitigation: use a disposable load-test database and make cleanup deterministic.

### 8. Automated tests become flaky because Word Search generation is random

Mitigation: test stable user-visible outcomes, introduce deterministic test data where possible, and avoid assertions tied to a specific random board unless a test-only seed is deliberately approved.

### 9. The video exceeds eight minutes

Mitigation: use a rehearsed evidence sequence, pre-open all required tabs, show results rather than setup delays, and target approximately 7:15.

### 10. Git divergence or untracked artifacts complicate submission

Mitigation: reconcile the local/remote README commits deliberately, preserve course materials, and audit tracked/untracked files before packaging.

---

## Recommended phase order

1. Pre-Phase: Baseline, safety, and fatal-flaw gate.
2. Phase 1: Assessment 3 contract and metric design.
3. Phase 2: Database model, migration, and simulated records.
4. Phase 3: Instrumentation and observability APIs.
5. Phase 4: Minimal builder instrumentation.
6. Phase 5: Dashboard interface and reporting views.
7. Phase 6: Alerts, resilience, and reporting hardening.
8. Phase 7: Playwright end-to-end testing.
9. Phase 8: JMeter load testing.
10. Phase 9: Lighthouse accessibility evaluation.
11. Phase 10: Full verification and Docker regression.
12. Phase 11: Documentation, references, and GitHub evidence.
13. Phase 12: Video, evidence package, and final submission.

The core implementation path is Phases 1-6. Testing should be designed early but finalised after the dashboard and instrumentation stabilise. Documentation and evidence should be updated throughout rather than postponed entirely until the final phase.

---

# Assessment 3 Progress and Video Evidence Log

This section is the ongoing record of Assessment 3 implementation. It should be updated at the end of every authorised phase so the final video script is based on real evidence rather than reconstructed from memory.

Each phase update should record:

- Date completed.
- Files added or changed.
- Important design decisions and their justification.
- Commands and checks run.
- Exact results, including relevant counts or scores.
- Problems encountered and how they were resolved.
- Any deferred or accepted limitations.
- Screens, terminal output, reports, or Git commits worth showing in the video.
- One or two concise narration points for the evolving script.

## Phase progress tracker

| Phase | Status | Completion date | Outcome summary | Video/evidence value |
|---|---|---|---|---|
| Pre-Phase: Baseline and fatal-flaw gate | Complete | 16 September 2026 | No fatal A1/A2 flaw found. Build, routes, validation, database integrity, health, and disposable CRUD checks completed without changing established behaviour. | Establishes that Assessment 3 extends a stable full-stack baseline. Detailed evidence is in the Pre-Phase completion log above. |
| Phase 1: Contract and metric design | Complete | 23 September 2026 | Defined the `UsageEvent` contract, metric formulas, validation rules, dashboard response, alerts, simulated data strategy, privacy limits, and minimal implementation touchpoints. No application or database code changed. | Explain why current activity counts remain authoritative in `Activity`, while operational usage is stored separately and safely. |
| Phase 2: Database model and simulated records | Complete | 25 September 2026 | Added `UsageEvent`, a forward-only migration, strict metric validation, an idempotent 31-record simulated dataset, reset tooling, and verified recovery. Legacy activity rows and ordered phonemes are unchanged. | Show the original models preserved beside `UsageEvent`, then show migration history and labelled simulated records. |
| Phase 3: Instrumentation and observability APIs | Complete | 25 September 2026 | Added validated live-event ingestion, database-backed dashboard aggregation, safe failures, non-blocking client helpers, and source disclosure. Populated, empty, invalid, and unavailable-database cases passed without changing the real data. | Show `201` ingestion, the summary response, safe `400`/`500` behaviour, and unchanged `/api/health`. |
| Phase 4: Minimal builder instrumentation | Complete | 25 September 2026 | Added allowlisted page views/durations and non-blocking success/failure events around both unchanged standalone export flows. Clean browser testing proved valid exports, controlled failure, saved-activity correlation, and metrics-outage resilience. | Export either activity and show its live event and dashboard count update; explain that an instrumentation outage cannot block the download. |
| Phase 5: Dashboard and reporting views | Complete | 25 September 2026 | Added the responsive `/dashboard` interface with all required metrics, health, alerts, comparisons, trends, recent records, source disclosure, builder links, and accessible loading/empty/error states. | Main visual anchor: show the populated cards, warning, source disclosure, reports, and live refresh after an export. |
| Phase 6: Alerts and resilience | Complete | 27 September 2026 | Added repeatable alert-policy checks, a 4 KiB request ceiling, valid-record aggregation filters, safe retry recovery, and historical-event retention after activity deletion. All destructive checks used disposable data. | Show the labelled generation-failure warning and explain that malformed data is rejected or excluded while builders and historical reporting remain safe. |
| Phase 7: Playwright | Complete | 27 September 2026 | Added an isolated migrated SQLite test harness and two Edge workflows covering persisted builder CRUD, multi-character phonemes, learner interaction, standalone export, health, validation, and dashboard reporting. Both clean runs passed 2/2 tests. | Show both named workflows and the concise `2 passed` report; explain that every run recreates a disposable database and leaves the demonstration data untouched. |
| Phase 8: JMeter | Complete | 28 September 2026 | Added a read-only JMX plan and ran 1, 10, 100, 1,000, and 10,000 requests per endpoint against a disposable production database. All 33,333 samples returned 200 with zero errors; the final stage reached 1,492.76 req/s and 3 ms aggregate p95. | Show the staged plan, concise table, and final HTML dashboard; explain that the local read-only failure point was not reached and results are not a production-capacity claim. |
| Phase 9: Lighthouse | Not started | - | - | Show accessibility result and a design decision influenced by it. |
| Phase 10: Full verification and Docker regression | Not started | - | - | Prove the final integrated application runs in the required environment. |
| Phase 11: Documentation and GitHub | Not started | - | - | Show repository homepage, focused commits, references, and reproducible instructions. |
| Phase 12: Video and submission | Not started | - | - | Final recording, timing, packaging, and upload checks. |

## Evidence ledger

Record the final location of each artifact as it is created. Do not invent results before the relevant tool has been run.

| Evidence | Required result or purpose | Current status | Final location/result |
|---|---|---|---|
| Assessment 2 baseline regression | Demonstrate that A3 extends a working application | Complete | Pre-Phase completion log in this document |
| Health response | HTTP 200 and healthy status | Baseline complete | `/api/health` returned `200` with `{"data":{"status":"ok"}}`; final A3 database-aware result pending |
| Database integrity | Preserve existing activities, words, and phonemes | Complete | 3 activities, 7 words, 22 phonemes; integrity check `ok` |
| Metrics and dashboard contract | Define statistics before implementation | Complete | `course-materials/md/Assessment3_Metrics_Contract.md` |
| Dashboard screenshots | Show reporting interface and operational statistics | Working verification complete | Desktop, narrow, populated, empty, and error renders reviewed in Phase 5; recapture persistent final evidence after Phase 10 integration |
| Stored metric records | Prove persistence and retrieval | Complete | 31 `SIMULATED` events: 6 page views, 12 durations, 11 generation successes, and 2 generation failures |
| UsageEvent migration | Prove safe forward-only persistence | Complete | `20260925024416_add_usage_events`; verified on existing, clean, and real databases |
| Metrics contract validation | Reject malformed operational records | Complete | 4 valid payloads accepted and 9 invalid payloads rejected, including both duration boundaries |
| Metric ingestion API | Validate and persist live operational events | Complete | `POST /api/metrics/events`; valid records return `201`, malformed/unsupported records return safe `400`, and bodies above 4,096 bytes return safe `413` |
| Dashboard summary API | Aggregate required reporting statistics | Complete | `GET /api/dashboard/summary`; populated, zero-metric, and database-failure states verified using disposable databases |
| Generation instrumentation | Prove successful and failed generation counts | Complete | Clean browser run stored 2 successes and 1 controlled failure; both successes included the selected saved-activity ID |
| Page usage instrumentation | Provide page views and valid duration samples | Complete | Clean browser run stored 3 allowlisted page views and 2 duration samples at 4,098 ms and 1,474 ms |
| Alert demonstration | Show an unusual state clearly | Complete | Populated dashboard visibly labels the seeded `GENERATION_FAILURES` warning and explains that 2 failures occurred in the seven-day window |
| Alert policy validation | Make warning thresholds reproducible | Complete | `npm run validate:alerts` passed 8 healthy, empty, missing-type, failure, minimum-sample, and 80% boundary cases |
| Reporting resilience | Exclude malformed rows and recover safely | Complete | Five partial/direct rows were excluded from metrics and source totals; keyboard retry recovered after one forced summary failure |
| Historical event retention | Preserve usage history after deletion | Complete | Deleting a disposable Wordle changed current activity totals but retained its linked generation event and aggregate counts |
| Playwright builder/CRUD test | Required builder use case | Complete | `app/e2e/builder-crud.spec.ts`; create, reload/retrieve, update, ordered multi-character phoneme persistence, delete, and `404` verified |
| Playwright generated activity test | Required user use case | Complete | `app/e2e/generated-activity-reporting.spec.ts`; health `200`, invalid input `400`, preview solved, HTML downloaded, and one successful generation shown by the API and dashboard |
| JMeter staged-load plan | Required multiple traffic levels | Complete | `app/load-tests/assessment3-read-load.jmx`; 1, 10, 100, 1,000, and 10,000 requests per endpoint with documented threads, loops, ramps, HTTP 200 assertions, and read-only routes |
| JMeter result summary | Explain latency, throughput, and errors | Complete | `app/load-tests/results/Assessment3_JMeter_Results.md`; 33,333 samples, zero errors, final 1,492.76 req/s, 2.19 ms mean, 1 ms median, 3 ms p95, and 17 ms p99 |
| Lighthouse baseline | Identify accessibility issues | Pending | - |
| Lighthouse final result | Show final score and response to findings | Pending | - |
| Docker final regression | Demonstrate final integrated runtime | Pending | - |
| GitHub homepage and commits | Demonstrate professional development history | Pending | - |
| Final source archive | Reproducible submission without dependencies/secrets | Pending | - |

## Confirmed Assessment 3 video requirements

The Assessment 3 brief and rubric require the final video to:

- Be between 3 and 8 minutes long.
- Show the student's face.
- Include voice narration.
- Show the student ID.
- Demonstrate the working application.
- Demonstrate the data-driven dashboard.
- Show stored or simulated data supporting the Wordle and Word Search builder.
- Show alerts and reporting views.
- Show observability and operational statistics.
- Show health status.
- Show Playwright test evidence.
- Show JMeter load-test evidence across multiple traffic levels.
- Show Lighthouse accessibility results.
- Explain at least one response to the Lighthouse findings.
- Show the GitHub homepage and commit history.
- Explain how data flows through the Wordle and Word Search builder and reporting system.

The video should show real results from the final verified build. Placeholder claims in the evolving script must be replaced with measured values before recording.

## Evolving video script

Status: **Working draft 0.9 - baseline and Phases 1-8 evidence confirmed.**

Target duration: approximately 7 minutes 15 seconds. This leaves a 45-second safety margin below the mandatory 8-minute maximum.

### 0:00-0:25 - Identification and Assessment 3 scope

**Visuals**

- Face visible.
- Student ID shown clearly.
- PhonoTrail Studio home page open.

**Draft narration**

> Hi, I am Isaac Riley Lambert, student number 21593530. This is PhonoTrail Studio for Assessment 3: data-driven application and reporting. The project continues my existing phoneme-based Wordle and Word Search builder by adding database-backed reporting, observability, operational statistics, and testing evidence.

### 0:25-1:35 - Dashboard and reporting overview

**Visuals**

- Open the completed Dashboard page.
- Point to health, activity counts, average time on page, most-used type, successful generations, failed generations, and success rate.
- Show one recent activity or event report.

**Draft narration**

> The Assessment 3 dashboard summarises both the stored teaching activities and the way the application is being used. These activity totals come from the existing Prisma activity records, while usage statistics come from the new Assessment 3 event data. The dashboard currently contains [FINAL WORDLE COUNT] Wordle activities and [FINAL WORD SEARCH COUNT] Word Search activities. The most-used type is [FINAL TYPE], the average recorded time on page is [FINAL DURATION], and generation has recorded [FINAL SUCCESS COUNT] successful and [FINAL FAILURE COUNT] failed attempts.

### 1:35-2:20 - Data model and observability flow

**Visuals**

- Briefly show the final Prisma event/metric model.
- Briefly show the dashboard summary API or a clean API response.
- Show the health response.

**Draft narration**

> I kept the completed Assessment 2 Activity, Word, and Phoneme models intact and added `UsageEvent` as a separate append-only reporting model. A user action is validated by the server, stored as a small event record, aggregated by the dashboard service, and then returned through `/api/dashboard/summary`. The existing health endpoint returns HTTP 200, while the database-backed summary confirms database connectivity. No raw word lists, phonemes, personal information, or browser fingerprints are stored in the usage records.

### 2:20-3:05 - Live generation and dashboard update

**Visuals**

- Open one builder and load a stored activity.
- Generate a Wordle or Word Search output.
- Return to or refresh the dashboard.
- Show the generation count changing.

**Draft narration**

> The original builder and standalone HTML export remain in place. When I generate this [WORDLE OR WORD SEARCH] activity, a small non-blocking instrumentation request records the outcome. The export still works independently, and the dashboard now shows the updated generation count. If reporting is unavailable, the original classroom workflow continues to operate.

### 3:05-3:35 - Alerts and unusual states

**Visuals**

- Trigger or show one safe, repeatable warning state.
- Point to the label and supporting text.

**Draft narration**

> The dashboard also makes unusual states visible. This warning indicates [FINAL WARNING CONDITION]. It uses text and status styling rather than colour alone, and it explains what the statistic means instead of presenting an unexplained error.

### 3:35-4:35 - Playwright end-to-end tests

**Visuals**

- Show the Playwright test files briefly.
- Run or show the final passing report.
- Identify the two required scenarios.

**Draft narration**

> Playwright covers both required perspectives. The builder test creates, reloads, updates, and deletes a Word Search activity while verifying ordered multi-character phonemes. The learner test solves a known Wordle preview, downloads its standalone HTML, and confirms the successful generation in the dashboard. Two consecutive clean runs completed with two tests passed in 5.3 seconds, without changing the demonstration database.

### 4:35-5:35 - JMeter staged load testing

**Visuals**

- Show the `.jmx` plan and thread or stage configuration.
- Show the concise results table or report.
- Highlight the practical limit or first degraded stage.

**Draft narration**

> I used JMeter 5.6.3 to exercise health, dashboard, and activity endpoints at one, ten, one hundred, one thousand, and ten thousand requests per endpoint. All 33,333 samples returned HTTP 200 with zero errors. The final stage reached about 1,493 requests per second with a 2.19 millisecond mean and 3 millisecond aggregate p95. The local read-only failure point was not reached, and these loopback SQLite results demonstrate comparative behaviour rather than production-scale capacity.

### 5:35-6:20 - Lighthouse accessibility evaluation

**Visuals**

- Show the initial finding if useful.
- Show the final Lighthouse accessibility result.
- Demonstrate the relevant changed interface element.

**Draft narration**

> Lighthouse gave the dashboard a final accessibility result of [FINAL LIGHTHOUSE SCORE]. The report identified [FINAL FINDING], so I changed [FINAL ACCESSIBILITY CHANGE]. This influenced the final design by improving [FINAL USER BENEFIT], while leaving the completed Assessment 1 and Assessment 2 builder behaviour intact.

### 6:20-6:50 - Docker and final reliability

**Visuals**

- Show the final Docker container running.
- Show the health request and one database-backed dashboard load.

**Draft narration**

> The final application still runs through the Docker workflow established in Assessment 2, using a persisted SQLite volume. The container applies the Prisma migration, the health endpoint returns 200, and the dashboard retrieves its stored reporting data successfully.

### 6:50-7:15 - GitHub and conclusion

**Visuals**

- Show GitHub repository homepage.
- Show focused Assessment 3 commits.
- Return briefly to the dashboard.

**Draft narration**

> The GitHub history shows the Assessment 3 work in focused stages covering persistence, instrumentation, dashboard reporting, tests, accessibility, and final verification. PhonoTrail Studio now preserves its original classroom builders while adding evidence that the system is healthy, observable, accessible, and understood under load.

## Final script validation checklist

Before recording:

- [ ] Replace every `[FINAL ...]` placeholder with a measured result.
- [ ] Verify the exact endpoint and model names spoken in the script.
- [ ] Rehearse with all tabs, reports, and terminal windows prepared.
- [ ] Remove setup delays and avoid waiting for long tests during the recording.
- [ ] Confirm face, voice, and student ID are clear.
- [ ] Confirm the video includes all three required testing tools.
- [ ] Confirm the GitHub homepage and commits are visible.
- [ ] Confirm final duration is under 8 minutes.
- [ ] Do not claim a score, count, test result, or performance limit that is not supported by saved evidence.
