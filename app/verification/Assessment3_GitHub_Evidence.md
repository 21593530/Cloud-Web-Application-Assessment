# Assessment 3 Git and GitHub evidence

Audit date: 28 September 2026  
Repository: https://github.com/21593530/Cloud-Web-Application-Assessment

## Branch state

After `git fetch --prune origin`, local `main` was `0` commits behind and `1` commit ahead of `origin/main`:

- Local `main`: `66f2318` — `test: add final Docker and integration verification`
- Remote `origin/main`: `50f4862` — `test: add Lighthouse accessibility evidence and contrast fixes`

The earlier README divergence was already resolved by merge commit `7e38d3c`; no merge, rebase, force push, or history rewrite is currently required. After the Phase 11 documentation commit, the remaining action is a normal `git push origin main` so the GitHub homepage matches the final local branch. That external update is intentionally not claimed until it has occurred.

## Focused Assessment 3 history

| Commit | Purpose |
|---|---|
| `951dbae` — `docs: define Assessment 3 metrics and dashboard contract` | Phase 1 contract, privacy boundaries, formulas, alerts, and API shape |
| `e042b8f` — `feat: add Assessment 3 metrics persistence and seed data` | Phase 2 migration, `UsageEvent`, validation, and deterministic simulation |
| `c635254` — `feat: add metrics instrumentation and reporting dashboard` | Ingestion/summary APIs, non-blocking builder instrumentation, and dashboard |
| `945b0dd` — `feat: harden dashboard alerts and metrics resilience` | Alert-policy validation, request limits, filtering, retry, and retention behavior |
| `c5bd59e` — `test: add isolated Playwright end-to-end coverage` | Disposable database and two required browser workflows |
| `baf81d3` — `test: add JMeter load plan and results` | Staged read-only plan and measured result interpretation |
| `50f4862` — `test: add Lighthouse accessibility evidence and contrast fixes` | Baseline/final audits and evidence-led contrast correction |
| `66f2318` — `test: add final Docker and integration verification` | Clean-volume migrations, runtime checks, persistence restart, and final evidence |

The sequence distinguishes contract/design, persistence, implementation, resilience, end-to-end testing, load testing, accessibility, and final integration. It provides a concise commit path to show in the Assessment 3 video.

## GitHub video checklist

- Open the repository homepage and confirm the updated Assessment 3 README is visible.
- Open the commit history and show the focused sequence above.
- Confirm the Phase 11 documentation commit and `66f2318` are present remotely.
- Confirm the displayed branch is `main` and the submitted repository URL matches `app/github-link.txt`.
- Do not claim the GitHub state matches the submission archive until the final commit has been pushed and the archive has been created from that same revision.
