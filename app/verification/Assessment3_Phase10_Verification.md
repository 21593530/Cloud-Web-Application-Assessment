# Assessment 3 Phase 10 verification

Date: 28 September 2026

## Outcome

The same committed application build passed local validation, production compilation, isolated Playwright testing, Docker build/runtime checks, persisted-volume restart, and a final Lighthouse audit. The real demonstration database and the established Assessment 2 Docker volume were not used for destructive testing.

Two previously documented Assessment 1/2 matters remain approval-gated: the Settings and Word Search `react-hooks/set-state-in-effect` lint findings, and the proposed Next.js security patch. Neither was suppressed or changed during Phase 10.

## Local verification

| Check | Result |
|---|---|
| `npm run validate:contract` | Passed; valid payload accepted and invalid payloads rejected |
| `npm run validate:metrics` | Passed; 4 valid events accepted and 9 invalid events rejected |
| `npm run validate:alerts` | Passed; 8 alert and threshold cases |
| `npm run validate:phonemes` | Passed; forward, reverse, and split-token cases |
| `npx tsc --noEmit` | Passed |
| `npm run build` | Passed; all 12 routes generated |
| `npm run test:e2e` | Passed; 2/2 Edge workflows in 5.4 seconds |
| `npm run lint` | Two pre-existing A1/2 errors remain; no generated-report or A3 errors remain |

ESLint now ignores generated JMeter, Lighthouse, and Playwright report directories. This reduced the initial report from thousands of third-party generated-file findings to the two known source findings:

- `src/app/settings/page.tsx:47` — synchronous `setTheme` in an effect.
- `src/app/word-search/page.tsx:453` — synchronous initial puzzle state in an effect.

These pages build and pass their runtime checks. They were not modified or rule-suppressed because the project preservation rule requires approval before changing established Assessment 1/2 behavior.

## Docker verification

- Docker Engine: `29.8.0` through Ubuntu WSL.
- Image: `phonotrail:phase10`.
- Image build passed its internal `npm install`, Prisma generation, and production Next.js build.
- Disposable volume: `phonotrail-phase10-20260928`.
- Container startup created a new SQLite database and applied both migrations:
  - `20260910120546_init`
  - `20260925024416_add_usage_events`
- Application seed created one Wordle and one Word Search activity.
- Observability seed created 31 deterministic records: 6 page views, 12 durations, 11 successes, and 2 failures.

The reproducible `npm run verify:docker` check passed against `http://127.0.0.1:3200`:

- Six application routes returned HTTP 200.
- `/api/health` returned HTTP 200 with `{"data":{"status":"ok"}}`.
- Dashboard database health was `CONNECTED`.
- Activity create, read, update, and delete passed.
- The seeded Wordle and Word Search both produced their standalone HTML downloads.
- Successful generation reporting changed from 11 to 13.
- Temporary CRUD records were removed, leaving the two seeded activities.

After stopping and restarting the image on the same named volume, the dashboard still reported one Wordle, one Word Search, 13 successful generations, 2 failures, and `CONNECTED`. The entrypoint reported both migrations with no pending work. This verifies volume persistence as well as first-run migration behavior.

The disposable container and volume were removed after verification. The existing `phonotrail-data` Assessment 2 volume was not touched.

## Final accessibility and load evidence

The repeated Lighthouse `13.5.0` desktop accessibility audit ran against the Docker dashboard and scored `100`: all 25 weighted audits passed, with zero scored failures and zero run warnings. Reports are retained locally at:

- `lighthouse/raw-results/2026-09-28/dashboard-phase10-final.report.html`
- `lighthouse/raw-results/2026-09-28/dashboard-phase10-final.report.json`

As in Phase 9, Lighthouse wrote valid reports before Windows returned an `EPERM` message while cleaning its temporary Edge profile. The generated report is complete.

The Phase 8 JMeter plan and results remain preserved at `load-tests/assessment3-read-load.jmx` and `load-tests/results/Assessment3_JMeter_Results.md`. No load test was rerun against the demonstration database.

## Data preservation and open decisions

- Real demonstration database SHA-256 before and after verification: `5F9FF05E44D7BCE38259F32144EA841D189924D77E1BF398E6B6B2994222F208`.
- No real demonstration record was changed.
- No established builder, export, database model, migration, API contract, or Docker runtime behavior was changed.
- The direct `next@16.3.0` dependency remains under the security advisory documented in Phase 7. The proposed smallest update remains `next@16.3.6`, subject to explicit approval and a repeat of this verification sequence.
