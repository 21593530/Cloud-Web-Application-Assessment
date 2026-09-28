# Assessment 3 JMeter Results

## Outcome

All five read-only request-volume stages completed successfully. Across 33,333 HTTP samples, JMeter recorded zero assertion failures, zero non-200 responses, and a 0.00% error rate.

No tested stage reached the predeclared unacceptable threshold of more than 1% errors or an aggregate p95 above 2,000 ms. No stage reached the degraded threshold of an aggregate p95 above 500 ms. The practical failure point was therefore **not reached within this controlled local read-only profile**.

## Test context

- Date: 28 September 2026, Australia/Sydney.
- Application: Next.js 16.3.0 production build on `127.0.0.1:3200`.
- Runtime: Node.js 24.12.0.
- Load tool: Apache JMeter 5.6.3 in non-GUI mode.
- Java: Eclipse Temurin 21.0.12.1+1 LTS.
- Operating system: Windows x64, release 10.0.26200.
- CPU: AMD Ryzen 7 9800X3D 8-Core Processor, 16 logical processors.
- Memory: 33,992,806,400 bytes (approximately 31.7 GiB).
- Database: disposable migrated SQLite database containing 2 activities, 5 words, 15 phonemes, and 31 deterministic simulated usage events.
- Endpoints: `GET /api/health`, `GET /api/dashboard/summary`, and `GET /api/activities`.
- Assertions: every request was required to return HTTP 200.
- Network: local loopback; no external network latency was present.

## Stage results

JMeter's generated HTML report supplied the mean, median, percentiles, range, error rate, and throughput below. The stage number is the number of executions per endpoint; total samples are three times that value.

| Requests per endpoint | Total samples | Threads × loops | Mean | Median | p90 | p95 | p99 | Min–max | Throughput | Errors |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 3 | 1 × 1 | 35.00 ms | 37 ms | 46 ms | 46.00 ms | 46.00 ms | 22–46 ms | 27.52 req/s | 0 (0.00%) |
| 10 | 30 | 10 × 1 | 3.13 ms | 2 ms | 4 ms | 12.70 ms | 16.00 ms | 1–16 ms | 17.07 req/s | 0 (0.00%) |
| 100 | 300 | 25 × 4 | 2.94 ms | 2 ms | 7.90 ms | 13.95 ms | 17.99 ms | 0–29 ms | 62.50 req/s | 0 (0.00%) |
| 1,000 | 3,000 | 50 × 20 | 2.48 ms | 1 ms | 9 ms | 13.00 ms | 16.00 ms | 0–31 ms | 304.41 req/s | 0 (0.00%) |
| 10,000 | 30,000 | 100 × 100 | 2.19 ms | 1 ms | 2 ms | 3.00 ms | 17.00 ms | 0–122 ms | 1,492.76 req/s | 0 (0.00%) |

The smallest stage includes cold application, database, and runtime work, so its latency should not be interpreted as worse scalability. The later stages benefit from a warmed process and much larger sample sets. Their lower percentile values do not prove that load improves performance.

## Highest-stage endpoint detail

| Endpoint | Samples | Mean | Median | p95 | p99 | Maximum | Throughput | Errors |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `GET /api/health` | 10,000 | 0.85 ms | 1 ms | 2 ms | 3 ms | 19 ms | 497.66 req/s | 0 |
| `GET /api/dashboard/summary` | 10,000 | 3.75 ms | 2 ms | 13 ms | 29 ms | 64 ms | 498.13 req/s | 0 |
| `GET /api/activities` | 10,000 | 1.96 ms | 1 ms | 4 ms | 12 ms | 122 ms | 498.21 req/s | 0 |

The database-backed dashboard summary was predictably slower than the lightweight health response, but its 13 ms p95 remained far below the 500 ms degraded threshold.

## Interpretation and limitations

- This is a staged **request-volume equivalent**, not 10,000 simultaneous users. The final stage configured 100 threads, 100 loops, and a 20-second ramp to produce 10,000 requests to each endpoint safely and repeatably.
- Results describe one local machine, one small SQLite dataset, one production Node process, and loopback networking. They must not be presented as cloud or internet-facing capacity.
- High-volume writes were deliberately excluded. SQLite serialises writes, and destructive or telemetry-heavy concurrency would measure a different bottleneck while adding avoidable risk.
- The demonstration database was never used. Counts in the disposable database remained at 2 activities, 5 words, 15 phonemes, and 31 usage events after testing.
- The highest tested read-only stage remained healthy, so the first unacceptable point is above this profile or requires a different constraint such as slower hardware, network latency, a larger dataset, sustained concurrency, or writes.

## Evidence locations

- Version-controlled plan: `app/load-tests/assessment3-read-load.jmx`
- Reproduction instructions: `app/load-tests/README.md`
- Concise results: this document
- Local raw files and JMeter HTML dashboards: `app/load-tests/raw-results/2026-09-28/` (ignored by Git)
- Highest-stage dashboard: `app/load-tests/raw-results/2026-09-28/stage-10000-report/index.html`
