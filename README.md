# PhonoTrail Studio

PhonoTrail Studio is a Next.js phoneme-activity builder for teachers. The project preserves the original Wordle and Word Search classroom workflows from Assessment 1, adds Prisma/SQLite persistence and Docker deployment from Assessment 2, and extends them for Assessment 3 with database-backed reporting, observability, alerts, and test evidence.

Repository: https://github.com/21593530/Cloud-Web-Application-Assessment

## Assessment 3 capabilities

- Responsive operational dashboard at `/dashboard`.
- Current Wordle and Word Search counts from stored `Activity` records.
- Append-only `UsageEvent` records for page views, valid time-on-page samples, and generation outcomes.
- Average page time, most-used activity type, success/failure counts, success rate, seven-day trends, and recent records.
- Database connectivity and application-health status.
- Clearly labelled warnings and simulated/live source disclosure.
- Non-blocking instrumentation: a reporting outage cannot prevent either builder from exporting HTML.
- Deterministic simulated records for a repeatable demonstration.
- Isolated Playwright end-to-end tests, staged JMeter load evidence, and Lighthouse accessibility evidence.

## Data flow

```text
Teacher action
  -> Wordle or Word Search builder
  -> standalone HTML export
  -> validated, non-blocking metric request
  -> UsageEvent in SQLite
  -> server-side dashboard aggregation
  -> accessible reports and alerts
```

The original `Activity`, `Word`, and ordered `Phoneme` records remain the source of truth for saved teaching activities. Assessment 3 operational history is stored separately in `UsageEvent`; it does not collect raw word lists, phonemes, personal information, IP addresses, or browser fingerprints.

## Repository structure

- `app/` — Next.js application, Prisma schema, migrations, seeds, tests, and evidence summaries.
- `course-materials/` — assessment briefs, rubrics, plans, and implementation notes.
- `prototypes/` — earlier prototype and design work.
- `dockerinstructions.txt` — established Windows/WSL Docker commands.

## Requirements

- Node.js 24 and npm 11 were used for final verification.
- Microsoft Edge is required by the configured Playwright project.
- Docker Engine is required for the container workflow.
- Apache JMeter 5.6.3 is required only to reproduce the saved load test.

## Local setup

From PowerShell:

```powershell
Set-Location app
npm ci
Copy-Item .env.example .env
npx prisma migrate deploy
npm run db:seed
npm run db:seed:metrics
npm run dev
```

Open http://localhost:3000. The two seed commands are idempotent: the activity seed skips an existing dataset, while the metric seed recreates only the deterministic `SIMULATED` records.

The local environment variable is:

```dotenv
DATABASE_URL="file:./prisma/dev.db"
```

Do not run destructive tests against the demonstration database. Playwright and the documented load/accessibility procedures use `app/prisma/playwright/test.db` instead.

## Routes and APIs

| Route | Purpose |
|---|---|
| `/wordle` | Saved phoneme Wordle builder, preview, play, and standalone export |
| `/word-search` | Saved phoneme Word Search builder, preview, keyboard interaction, and standalone export |
| `/dashboard` | Assessment 3 operational statistics, reports, alerts, and source disclosure |
| `/settings` | Persistent light/dark theme preference |
| `GET /api/health` | Lightweight application health response |
| `GET /api/dashboard/summary` | Database health and aggregated dashboard report |
| `POST /api/metrics/events` | Strictly validated operational-event ingestion |
| `/api/activities` and `/api/activities/[id]` | Saved-activity list/create/read/update/delete operations |

The established health endpoint is `/api/health`; final Docker verification returned HTTP 200 with `{"data":{"status":"ok"}}`.

## Metric definitions

| Metric | Definition |
|---|---|
| Current activity counts | Current `Activity` rows grouped by `WORDLE` and `WORD_SEARCH` |
| Average time on page | Mean of validated `PAGE_DURATION.durationMs` samples |
| Most-used activity type | Type with the greatest number of recorded generation attempts, with empty/tied states |
| Successful/failed generations | Validated `GENERATION_SUCCESS` and `GENERATION_FAILURE` events |
| Success rate | Successful generations divided by all recorded generation attempts |
| Health | Application response plus a lightweight database connectivity check |

The complete contract and alert thresholds are documented in [`course-materials/md/Assessment3_Metrics_Contract.md`](course-materials/md/Assessment3_Metrics_Contract.md).

## Development and verification commands

Run these from `app/`:

```powershell
npm run validate:contract
npm run validate:metrics
npm run validate:alerts
npm run validate:phonemes
npx tsc --noEmit
npm run build
npm run test:e2e
```

`npm run test:e2e` recreates and migrates an isolated SQLite database before running two Microsoft Edge workflows. See [`app/e2e/README.md`](app/e2e/README.md).

`npm run lint` currently reports two preserved Assessment 1/2 `react-hooks/set-state-in-effect` findings in Settings and Word Search. Generated test reports are excluded from linting, and no Assessment 3 lint finding remains. These legacy files have not been changed or rule-suppressed without approval.

## Docker

The image runs `prisma migrate deploy` before starting Next.js and stores SQLite data in a named volume:

```powershell
wsl -d Ubuntu -u root -- docker rm -f phonotrail-app
wsl -d Ubuntu -u root -- bash -c "cd /mnt/c/repos/cloud-web-app/app && docker build -t phonotrail ."
wsl -d Ubuntu -u root -- bash -c "docker run --rm -p 3000:3000 -v phonotrail-data:/data -e DATABASE_URL=file:/data/phonotrail.db --name phonotrail-app phonotrail"
```

For a new empty volume, seed it from another terminal after the container starts:

```powershell
wsl -d Ubuntu -u root -- docker exec phonotrail-app npm run db:seed
wsl -d Ubuntu -u root -- docker exec phonotrail-app npm run db:seed:metrics
```

Phase 10 verified clean migrations, six UI routes, health, database connectivity, CRUD, both exports, reporting updates, and persistence across a container restart. See [`app/verification/Assessment3_Phase10_Verification.md`](app/verification/Assessment3_Phase10_Verification.md).

## Test and accessibility evidence

| Tool | Final recorded result | Evidence |
|---|---|---|
| Playwright | 2/2 isolated Edge workflows passed | [`app/e2e/README.md`](app/e2e/README.md) |
| JMeter | 33,333 samples, 0 errors; final stage 1,492.76 req/s and 3 ms aggregate p95 | [`app/load-tests/results/Assessment3_JMeter_Results.md`](app/load-tests/results/Assessment3_JMeter_Results.md) |
| Lighthouse | Dashboard improved from 96 to 100; final Docker dashboard 100 | [`app/lighthouse/results/Assessment3_Lighthouse_Results.md`](app/lighthouse/results/Assessment3_Lighthouse_Results.md) |

Generated Playwright, JMeter, and Lighthouse reports are intentionally ignored by Git. Concise result interpretations and reproducible procedures are version controlled; final raw reports should be included separately in the submission evidence package where required.

## Known limitations and pre-submission decisions

- SQLite is appropriate for this single-instance assessment deployment, not a claim of horizontally scaled production capacity.
- Page-duration events are best-effort browser samples rather than analytics-grade session tracking.
- JMeter results describe one local, read-only loopback environment and are not a production capacity guarantee.
- A Lighthouse score of 100 covers scored automated audits; manual keyboard, focus, landmark, custom-control, and assistive-technology checks still matter.
- The two legacy lint findings described above remain visible rather than being hidden.
- The direct `next@16.3.0` dependency has a documented security patch pending approval. The proposed minimum update is `next@16.3.6`, followed by the full Phase 10 regression sequence.

## References and AI acknowledgement

The required APA 7 references and transparent generative-AI acknowledgement are in [`app/REFERENCES.md`](app/REFERENCES.md).
