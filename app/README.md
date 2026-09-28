# PhonoTrail Studio application

This directory contains the Next.js App Router application for PhonoTrail Studio. The project retains the Assessment 1 builders and Assessment 2 Prisma/SQLite CRUD workflow, then adds the Assessment 3 dashboard, usage-event persistence, observability, alerts, and test evidence.

See the repository [README](../README.md) for the complete setup, routes, metrics, Docker workflow, results, and known limitations. See [REFERENCES.md](./REFERENCES.md) for APA 7 sources and the AI acknowledgement.

## Quick start

```powershell
npm ci
Copy-Item .env.example .env
npx prisma migrate deploy
npm run db:seed
npm run db:seed:metrics
npm run dev
```

Open http://localhost:3000. The operational dashboard is at http://localhost:3000/dashboard and health is available from http://localhost:3000/api/health.

## Main directories

- `src/app/` — pages and API route handlers.
- `src/lib/` — domain contracts, validation, API clients, server repositories, aggregation, and alerts.
- `prisma/` — schema, committed migrations, activity seed, and deterministic metric seed.
- `e2e/` — isolated Playwright builder/CRUD and generated-activity workflows.
- `load-tests/` — JMeter plan, reproduction guide, and concise results.
- `lighthouse/` — accessibility procedure and before/after results.
- `verification/` — final integrated and Docker verification evidence.
- `scripts/` — contract checks, disposable-database preparation, and repeatable Docker runtime verification.

## Useful commands

| Command | Purpose |
|---|---|
| `npm run db:seed` | Seed the two example teaching activities if the database is empty |
| `npm run db:seed:metrics` | Recreate 31 deterministic simulated usage events |
| `npm run db:reset:simulated-metrics` | Explicit alias for resetting only simulated events |
| `npm run validate:contract` | Validate activity input rules |
| `npm run validate:metrics` | Validate metric-event allowlists and limits |
| `npm run validate:alerts` | Verify dashboard warning thresholds and boundary cases |
| `npm run validate:phonemes` | Regress token-aware multi-character phoneme matching |
| `npm run test:e2e` | Recreate the disposable database and run two Edge workflows |
| `npm run verify:docker` | Verify routes, health, CRUD, both exports, and reporting against a running container on port 3200 |
| `npm run build` | Create the production Next.js build |

Never point the Playwright, JMeter, Lighthouse, or Docker verification procedures at `prisma/prisma/dev.db`. Their guides use disposable databases or volumes.
