# Assessment 3 JMeter load test

This plan measures the production Next.js server with safe, read-only traffic. It sends HTTP `GET` requests to:

- `/api/health`
- `/api/dashboard/summary`
- `/api/activities`

The dashboard and activity routes exercise SQLite reads. No request creates, updates, deletes, or records metrics.

## Test profile

The required scale is represented as executions **per endpoint**. Each virtual user performs all three requests once per loop, so total JMeter samples are three times the stated stage size.

| Stage | Threads | Loops | Ramp-up | Requests per endpoint | Total requests |
|---:|---:|---:|---:|---:|---:|
| 1 | 1 | 1 | 1 second | 1 | 3 |
| 10 | 10 | 1 | 2 seconds | 10 | 30 |
| 100 | 25 | 4 | 5 seconds | 100 | 300 |
| 1,000 | 50 | 20 | 10 seconds | 1,000 | 3,000 |
| 10,000 | 100 | 100 | 20 seconds | 10,000 | 30,000 |

Concurrency is capped at 100 threads for the highest stage. This avoids confusing “10,000 requests” with 10,000 simultaneous desktop threads and produces a repeatable sustained-load comparison on a local machine.

## Reproduction

Use Apache JMeter 5.6.3 with Java 8 or newer. Run the application from `app/` against a disposable migrated database, not `prisma/prisma/dev.db`:

```powershell
$env:DATABASE_URL = "file:./playwright/test.db"
npm run test:e2e:prepare
npm run db:seed
npm run db:seed:metrics
npm run build
npm run start -- --hostname 127.0.0.1 --port 3200
```

In another terminal, run a stage by replacing the three load properties and output filename:

```powershell
jmeter -n -t load-tests/assessment3-read-load.jmx `
  -JHOST=127.0.0.1 -JPORT=3200 `
  -JTHREADS=25 -JLOOPS=4 -JRAMP_SECONDS=5 `
  -l load-tests/raw-results/stage-100.jtl
```

Run the five profiles in ascending order with a brief cooldown between stages. Raw `.jtl` data and generated HTML reports belong under `load-tests/raw-results/`, which is ignored by Git. The concise measured summary is version controlled separately.

## Interpretation rules

- Any assertion failure or non-200 response counts as an error.
- A stage is considered **unacceptable** if its error rate exceeds 1% or aggregate p95 response time exceeds 2,000 ms.
- A stage is labelled **degraded** if aggregate p95 exceeds 500 ms but remains within the unacceptable threshold.
- Results describe this local hardware, runtime, dataset, and SQLite configuration. They are comparative evidence, not a production capacity guarantee.
