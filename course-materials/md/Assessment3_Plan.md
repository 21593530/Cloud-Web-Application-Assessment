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

- [ ] Assessment 1 and Assessment 2 workflows have been regression-tested.
- [ ] No established behaviour was changed without approval.
- [ ] Existing activity and phoneme records survive the Assessment 3 migration.

### Dashboard and reporting

- [ ] A dedicated data-driven dashboard is implemented.
- [ ] Wordle and Word Search counts come from stored activity records.
- [ ] Average time on page is displayed and correctly defined.
- [ ] Most-used activity type is displayed and correctly defined.
- [ ] Successful and failed generation counts are displayed.
- [ ] Health status is visible.
- [ ] Recent usage or reporting detail is visible.
- [ ] Useful empty, loading, warning, and error states are implemented.
- [ ] Dashboard links stored data and activity generation clearly.

### Persistence and observability

- [ ] Assessment 3 metric records are stored in the database.
- [ ] Simulated records are deterministic and documented.
- [ ] Metric ingestion is validated.
- [ ] `/health` returns HTTP 200 in the verified environment.
- [ ] Dashboard aggregation handles empty and populated data.
- [ ] Instrumentation failure cannot break the original builders.

### Testing and accessibility

- [ ] Playwright builder/CRUD test passes.
- [ ] Playwright generated activity/user test passes.
- [ ] Playwright uses an isolated test database.
- [ ] JMeter results exist for all required staged traffic levels or justified equivalents.
- [ ] JMeter results are interpreted and limitations are documented.
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
| Phase 1: Contract and metric design | Not started | - | - | Explain what each dashboard metric means and why the event model was chosen. |
| Phase 2: Database model and simulated records | Not started | - | - | Show the added Prisma model, migration, and representative stored metric records. |
| Phase 3: Instrumentation and observability APIs | Not started | - | - | Show event ingestion, dashboard aggregation, and health behaviour. |
| Phase 4: Minimal builder instrumentation | Not started | - | - | Generate an activity and show the corresponding database-backed metric update. |
| Phase 5: Dashboard and reporting views | Not started | - | - | Main dashboard demonstration and highest-value visual evidence. |
| Phase 6: Alerts and resilience | Not started | - | - | Demonstrate one clear warning or unusual operational state. |
| Phase 7: Playwright | Not started | - | - | Show both required end-to-end workflows passing. |
| Phase 8: JMeter | Not started | - | - | Show staged traffic results and explain the performance limit. |
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
| Dashboard screenshots | Show reporting interface and operational statistics | Pending | - |
| Stored metric records | Prove persistence and retrieval | Pending | - |
| Generation instrumentation | Prove successful and failed generation counts | Pending | - |
| Alert demonstration | Show an unusual state clearly | Pending | - |
| Playwright builder/CRUD test | Required builder use case | Pending | - |
| Playwright generated activity test | Required user use case | Pending | - |
| JMeter staged-load plan | Required multiple traffic levels | Pending | - |
| JMeter result summary | Explain latency, throughput, and errors | Pending | - |
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

Status: **Working draft 0.1 - baseline confirmed; Assessment 3 implementation results pending.**

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

> I kept the completed Assessment 2 Activity, Word, and Phoneme models intact and added [FINAL MODEL NAME] as a separate append-only reporting model. A user action is validated by the server, stored as a small event record, aggregated by the dashboard service, and then returned through [FINAL SUMMARY ENDPOINT]. The existing health endpoint returns HTTP 200 and now reports [FINAL HEALTH BEHAVIOUR]. No raw word lists, phonemes, personal information, or browser fingerprints are stored in the usage records.

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

> Playwright covers both required perspectives. The builder test creates, retrieves, updates, and deletes a disposable activity using an isolated test database. The user test generates or interacts with a classroom activity and confirms that the reporting data updates. The final run completed [FINAL PLAYWRIGHT RESULT], without changing the demonstration database.

### 4:35-5:35 - JMeter staged load testing

**Visuals**

- Show the `.jmx` plan and thread or stage configuration.
- Show the concise results table or report.
- Highlight the practical limit or first degraded stage.

**Draft narration**

> I used JMeter to exercise health, dashboard, and activity endpoints at staged loads equivalent to [FINAL LOAD LEVELS]. At the lower stages the application produced [FINAL LOW-LOAD RESULT]. At [FINAL LIMIT STAGE], response time or errors changed to [FINAL OBSERVATION]. These results reflect this local machine and SQLite configuration, so they demonstrate comparative behaviour rather than production-scale capacity.

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
