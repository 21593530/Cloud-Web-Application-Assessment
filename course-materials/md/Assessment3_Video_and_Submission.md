# Assessment 3 final video and submission run sheet

> **Recording source of truth:** Use `Assessment3_Final_Recording_Script.md` for the final pause-and-resume recording. This document remains the detailed evidence and submission run sheet.

Prepared: 30 September 2026
Target video length: 7 minutes 15 seconds
Mandatory range: 3–8 minutes

## Verified starting values

These values were read from the demonstration database through `/api/dashboard/summary` without writing any events:

- Health: application `HEALTHY`, database `CONNECTED`, and the database-backed `/api/health` response is HTTP 200 with `status: ok` and `database: connected`.
- Saved activities: 3 total — 2 Wordle and 1 Word Search.
- Average recorded page time: 74.9 seconds from 12 valid samples.
- Most-used activity type: Wordle, with 7 attempts versus 6 Word Search attempts.
- Generation outcomes: 11 successful, 2 failed, 84.6% success rate.
- Sources: 31 simulated events and 0 live events before the recording interaction.
- Visible warning: “Recent generation failures” because 2 failures occur in the seven-day window.

If a rehearsal records live events, speak to the values visible on screen rather than repeating stale numbers. For the cleanest take, avoid rehearsing the export against the demonstration database or restore the planned recording state first.

## Before pressing Record

1. Commit the Phase 12 files and push `main`; confirm GitHub shows the same final commit as the submission archive.
2. Confirm `.env` exists locally or start the documented Docker container with its persisted database.
3. Open and arrange these tabs before recording:
   - Home page with student details available.
   - Populated dashboard.
   - `prisma/schema.prisma` at `UsageEvent`.
   - `/api/dashboard/summary` and `/api/health`.
   - Wordle with a saved activity selected.
   - Playwright test files and saved HTML report/terminal result.
   - JMeter result summary and final HTML dashboard.
   - Lighthouse baseline and final HTML reports.
   - GitHub repository homepage and commit history.
4. Keep face camera visible and student ID ready.
5. Close notifications, unrelated windows, secrets, and personal tabs.
6. Set a visible timer and stop the take if it is likely to exceed 7:45.

## Exactly what to open and what runs live

The tests have already been run and their evidence has been saved. **Do not rerun Playwright, JMeter, or Lighthouse during the final recording.** Running them live would consume most of the eight-minute limit, introduce avoidable timing risk, and make the evidence harder to explain. Present the saved reports and explain what each test did and what its measured result means.

The only live assessment action in the recording is the short Wordle export followed by a dashboard refresh. The application itself must already be running in Docker before recording begins.

### Window 1: Docker terminal

From the repository root, build and start the assessed application before pressing Record:

```powershell
wsl -d Ubuntu -u root -- docker rm -f phonotrail-app
wsl -d Ubuntu -u root -- bash -c "cd /mnt/c/repos/cloud-web-app/app && docker build -t phonotrail ."
wsl -d Ubuntu -u root -- bash -c "docker run --rm -p 3000:3000 -v phonotrail-data:/data -e DATABASE_URL=file:/data/phonotrail.db --name phonotrail-app phonotrail"
```

Ignore the first command's error if no old container exists. Leave the final command and container running. During the Docker section of the video, briefly show this terminal so the container output is visible; do not rebuild it on camera.

### Window 2: browser tabs, in this order

Open these before recording and arrange them left to right:

1. `http://localhost:3000/` - identification and project introduction.
2. `http://localhost:3000/dashboard` - the main dashboard demonstration.
3. `http://localhost:3000/api/dashboard/summary` - the database-backed summary JSON.
4. `http://localhost:3000/api/health` - the database-backed HTTP 200 health response.
5. `http://localhost:3000/wordle` - the one live export demonstration.
6. The saved Playwright report described below.
7. The saved JMeter report described below.
8. The saved Lighthouse baseline report described below.
9. The saved Lighthouse final report described below.
10. The GitHub repository homepage and then its commit-history page.

Open the saved Playwright report from `app/` before recording:

```powershell
npm run test:e2e:report
```

This command only serves the already-generated report; it does **not** rerun the tests. Leave its terminal open. The underlying report is `app/playwright-report/index.html`, and `app/test-results/.last-run.json` also records `"status": "passed"` with no failed tests.

Open these saved local HTML files in the browser, either from File Explorer or with `Start-Process` in PowerShell:

```powershell
Start-Process "app/load-tests/raw-results/2026-09-28/stage-10000-report/index.html"
Start-Process "app/lighthouse/raw-results/2026-09-28/dashboard-baseline.report.html"
Start-Process "app/lighthouse/raw-results/2026-09-28/dashboard-final.report.html"
```

The large JMeter HTML dashboard only shows the highest stage. Use the concise Markdown summary in the editor to show all five stages together.

### Window 3: VS Code tabs, in this order

Open only these files so switching is predictable:

1. `app/prisma/schema.prisma` - search for `model UsageEvent` before recording.
2. `app/e2e/builder-crud.spec.ts` - show the named builder/CRUD scenario.
3. `app/e2e/generated-activity-reporting.spec.ts` - show the learner/export/reporting scenario.
4. `app/load-tests/results/Assessment3_JMeter_Results.md` - show the five-row results table.
5. `app/lighthouse/results/Assessment3_Lighthouse_Results.md` - show the 96-to-100 table and contrast response.
6. `app/verification/Assessment3_Phase10_Verification.md` - show the Docker verification table and persistence result.
7. This run sheet - keep the narration visible on another screen or print it, but do not make it the main recorded content.

### What to do in each evidence section

| Section | Show on screen | Action during recording |
|---|---|---|
| Dashboard | Live `/dashboard` in Docker | Point to the cards, health, source disclosure, warning, and recent records. |
| Data flow | `UsageEvent`, summary JSON, health JSON | Switch between the three prepared tabs; do not edit code. |
| Live proof | Wordle, then Dashboard | Load a saved Wordle, export its HTML, refresh Dashboard, and point to the increased success count/live event. |
| Playwright | Two spec files, then saved HTML report | Briefly name what each test covers, then show the green passing report. Do not run the suite. |
| JMeter | Markdown five-stage table, then stage-10000 HTML report | Point to 33,333 samples, zero errors, p95, and throughput. Do not run JMeter. |
| Lighthouse | Baseline HTML, Markdown finding, final HTML | Show 96, explain the contrast fix, then show 100. Do not rerun Lighthouse. |
| Docker | Running container terminal and live Dashboard | State that clean migration, routes, CRUD, exports, restart persistence, and health were already verified. Do not rebuild. |
| GitHub | Repository homepage and commit history | Scroll just enough to show documentation and focused Assessment 3 commits. |

If a local HTML report is awkward to read at recording scale, show its concise Markdown result instead. The goal is to make the evidence legible and explain it accurately, not to prove that a long-running command can finish while the camera is on.

## Timed script

### 0:00–0:25 — Identification and scope

**On-screen steps — Browser, Tab 1 (`http://localhost:3000/`):**

1. Keep the face-camera overlay visible for the entire recording.
2. Hold the student ID steady beside your face for several seconds.
3. Lower the ID and leave the PhonoTrail Studio home page visible.
4. Do not navigate until the introductory sentence is finished.

**Say:**

> Hi, I am Isaac Riley Lambert, student number 21593530. This is PhonoTrail Studio for Assessment 3: data-driven application and reporting. It keeps my phoneme-based Wordle and Word Search builders and adds database-backed reporting, observability, operational statistics, and testing evidence.

### 0:25–1:35 — Dashboard and stored data

**On-screen steps — Browser, Tab 2 (`http://localhost:3000/dashboard`):**

1. Click Browser Tab 2; the dashboard should already be loaded from Docker.
2. At the top, point to `Application healthy` and `Database connected`.
3. Under `Saved activity and usage metrics`, move across these cards while naming them: `Current activities`, `Saved Wordle`, `Saved Word Search`, `Average time on page`, `Most-used output`, `Successful generations`, `Failed generations`, and `Generation success rate`.
4. Scroll once to `Generation attempts by activity type` and `Generation outcomes`.
5. Scroll near the bottom to `Recent operational events` and `Data source disclosure`; point to `simulated` so the prepared data is not presented as live traffic.
6. Return near the top before changing tabs. Speak to the numbers actually visible if they differ from the prepared values.

**Say:**

> The dashboard combines current teaching activities with stored operational events. The demonstration database contains two Wordle activities and one Word Search. Twelve valid duration samples average 74.9 seconds. Wordle is currently the most-used type, with seven attempts compared with six, and generation has recorded eleven successes and two failures, an 84.6 percent success rate. Activity totals come from the existing Activity records; usage statistics come from the separate UsageEvent table. The source disclosure identifies all 31 prepared events as simulated.

### 1:35–2:20 — Data model and observability flow

**On-screen steps — VS Code Tab 1, then Browser Tabs 3 and 4:**

1. Switch to VS Code Tab 1: `app/prisma/schema.prisma`.
2. The editor should already be positioned at `model UsageEvent` around line 51. Point briefly to `eventType`, `activityType`, `status`, `durationMs`, `source`, and `createdAt`; do not scroll through the whole schema.
3. Switch to Browser Tab 3: `http://localhost:3000/api/dashboard/summary`. Point to the health/database section, activity counts, usage totals, sources, and recent events in the JSON. A quick browser find with `Ctrl+F` is acceptable if the response is long.
4. Switch to Browser Tab 4: `http://localhost:3000/api/health`. Point to both `status: ok` and `database: connected`, and explain that the response is HTTP 200 because both required database tables were reached successfully. Do not open developer tools just to show the status code; the working response plus narration is sufficient.

**Say:**

> I kept the completed Activity, Word, and Phoneme models intact and added UsageEvent as a separate append-only reporting model. A user action is validated by the server, stored as a small event, aggregated by the dashboard service, and returned through `/api/dashboard/summary`. In response to Assessment 2 feedback, `/api/health` now performs lightweight Prisma reads against both required database tables before returning HTTP 200 and `database: connected`; it returns HTTP 503 if that check fails. Usage records do not contain raw word lists, phonemes, personal information, IP addresses, or browser fingerprints.

### 2:20–3:05 — Live generation and reporting update

**On-screen steps — Browser Tab 5, then Browser Tab 2:**

1. Switch to Browser Tab 5: `http://localhost:3000/wordle`.
2. At the top of the builder, open the `Saved activity` dropdown and select `Ship phoneme Wordle`. If that exact title is absent, select any populated saved Wordle.
3. Wait until the status pill says that the activity was loaded. Do not change its phonemes or save it.
4. Scroll to the buttons immediately above `Live Preview` and click `Export HTML` once.
5. Wait for the message `Exported a standalone playable HTML Wordle.` The downloaded file itself does not need to be opened.
6. Switch back to Browser Tab 2 and refresh the dashboard once with `Ctrl+R`.
7. Point to the increased `Successful generations` value, the changed live/simulated source count, and the newest `live` generation event under `Recent operational events`.
8. Do not repeat the export if the metric takes a moment to appear; wait for the dashboard refresh to finish, then continue.

**Say while performing those actions:**

> The original builder and standalone HTML export remain in place. I am exporting this saved Wordle activity. The browser downloads the playable file while a non-blocking request records one successful generation. After refreshing the dashboard, the success count increases by one and a live event appears. If reporting is unavailable, the classroom export still completes.

### 3:05–3:35 — Alerts and unusual states

**On-screen steps — remain on Browser Tab 2:**

1. Scroll to `Alerts and information` near the top of the dashboard.
2. Point directly to `Recent generation failures` and the sentence containing the failure count.
3. Point briefly to the visible text label; this supports the statement that the warning is not communicated by colour alone.

**Say:**

> This warning reports two failed generation attempts in the current seven-day window. It is clearly labelled in text, not communicated by colour alone, and links an unusual operational state to a concrete count. The failures are controlled simulated records included for repeatable assessment evidence.

### 3:35–4:35 — Playwright

**On-screen steps — VS Code Tabs 2 and 3, then Browser Tab 6:**

1. Switch to VS Code Tab 2: `app/e2e/builder-crud.spec.ts`. Keep the test name visible and briefly point to the create/reload/update/delete workflow; do not read the code line by line.
2. Switch to VS Code Tab 3: `app/e2e/generated-activity-reporting.spec.ts`. Keep the test name visible and briefly point to the learner interaction, download, and dashboard assertion.
3. Switch to Browser Tab 6, the report opened earlier with `npm run test:e2e:report`.
4. Leave the green overall result and both passed tests visible for most of this section. If needed, click the report's `All` or passed-test view so both test names are on screen.
5. Do not click Run and do not execute `npm run test:e2e` during the recording.

**Say:**

> Playwright covers both required perspectives. The builder test creates, reloads, updates, and deletes a Word Search activity while verifying ordered multi-character phonemes. The learner test solves a known Wordle preview, downloads its standalone HTML, and confirms the generation in dashboard reporting. The final isolated Edge run passed both tests in 5.4 seconds and recreated its own database, so the demonstration data was not changed.

### 4:35–5:35 — JMeter

**On-screen steps — VS Code Tab 4, then Browser Tab 7:**

1. Switch to VS Code Tab 4: `app/load-tests/results/Assessment3_JMeter_Results.md`.
2. Use Markdown Preview if available, and position the document at the `Stage results` table.
3. Move down the five rows while naming 1, 10, 100, 1,000, and 10,000 requests per endpoint. Point to `Total samples`, `p95`, `Throughput`, and `Errors`—especially the 10,000 row.
4. Switch to Browser Tab 7: the saved `stage-10000-report/index.html` JMeter dashboard. Show its summary/statistics area only; do not explore every graph.
5. Do not start JMeter during the recording.

**Say:**

> JMeter 5.6.3 exercised health, dashboard, and activity reads at one, ten, one hundred, one thousand, and ten thousand requests per endpoint. All 33,333 samples returned HTTP 200 with zero errors. The final stage reached about 1,493 requests per second, with a 2.19 millisecond mean and 3 millisecond aggregate p95. The local read-only failure point was not reached, so these are comparative loopback results rather than a production-capacity claim.

### 5:35–6:20 — Lighthouse

**On-screen steps — Browser Tab 8, VS Code Tab 5, then Browser Tab 9:**

1. Switch to Browser Tab 8: `dashboard-baseline.report.html`. Keep the Accessibility score of `96` visible and point to the failed colour-contrast audit.
2. Switch to VS Code Tab 5: `app/lighthouse/results/Assessment3_Lighthouse_Results.md` and position it at `Finding and response`. Point to the two original ratios and then the four corrected light/dark ratios above 6:1.
3. Switch to Browser Tab 9: `dashboard-final.report.html`. Keep the Accessibility score of `100` visible and, if convenient, show that there are no scored failures.
4. Do not run Lighthouse during the recording.

**Say:**

> Lighthouse initially scored the dashboard 96 and found warning and simulated-data labels below the required 4.5-to-1 contrast ratio. I introduced theme-aware text colours above 6 to 1 in both themes. The final dashboard scored 100 with all 25 weighted audits passing, and the unchanged Wordle route also scored 100. Manual accessibility checks are still required despite the automated score.

### 6:20–6:50 — Docker reliability

**On-screen steps — Docker terminal, VS Code Tab 6, then Browser Tabs 4 and 2:**

1. Switch to the Docker terminal that has remained running since before recording. Point to the container/Next.js startup output; do not stop or rebuild the container.
2. Switch to VS Code Tab 6: `app/verification/Assessment3_Phase10_Verification.md`. Position it at `Docker verification` and point to the passed routes, health, CRUD, exports, and named-volume restart results.
3. Switch briefly to Browser Tab 4 to show the live health JSON again.
4. Switch to Browser Tab 2 to show that the database-backed dashboard is still populated.

**Say:**

> The final image applied both Prisma migrations to a clean named SQLite volume. Six application routes and the genuine database-backed healthcheck returned HTTP 200, database status was connected, CRUD and both exports passed, and the reporting data remained after a container restart. A separate unavailable-database check returned the expected HTTP 503. The Docker dashboard also retained the Lighthouse score of 100.

### 6:50–7:15 — GitHub and conclusion

**On-screen steps — Browser Tab 10 (GitHub):**

1. Switch to the GitHub repository homepage. Scroll briefly through the rendered README headings for architecture/data flow, testing evidence, references, AI acknowledgement, and limitations; do not read them all.
2. Open the repository's `Commits` page in the same tab.
3. Slowly scroll through the focused Assessment 3 commits, from the contract and persistence work through Playwright, JMeter, Lighthouse, Docker verification, documentation, and the final submission-preparation commit.
4. Finish on either the commit history or the live dashboard—whichever makes the closing sentence feel smoother.

**Say:**

> The repository homepage documents the data flow, setup, measured evidence, references, AI acknowledgement, and limitations. The commit history separates contract design, persistence, reporting, resilience, Playwright, JMeter, Lighthouse, Docker verification, and documentation. PhonoTrail Studio now preserves its original classroom builders while making the system observable, tested, accessible, and understood under load.

## Immediately after recording

- Confirm the duration is between 3 and 8 minutes.
- Confirm face, voice, and student ID are visible and understandable.
- Scrub to each section and confirm all required evidence is readable.
- Confirm GitHub homepage and commits appear in the recording.
- Keep the original recording until the LMS submission is accepted.

## Source package

Run from the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File app/scripts/create-submission-archive.ps1
```

The script creates `submission/PhonoTrail-Studio-Assessment3-source.zip`, includes the application plus the Assessment 3 plan, metric contract, and final run sheet, and rejects dependencies, builds, environment files, databases, raw reports, logs, and test artifacts.

The archive is approximately 101 MB because it preserves the existing 101 MB Assessment 1 video used by the About page. Check the LMS upload limit before the submission window. Do not silently omit that asset, because doing so changes established application behaviour; seek an approved compression or alternate-upload approach if the limit is lower.

## Manual submission gates

- Commit Phase 12 and push `main` normally; do not force push.
- Confirm the GitHub final commit matches the committed source used for the ZIP.
- Upload the source ZIP and provide the GitHub repository link.
- Upload the final 3–8 minute video through the required LMS mechanism.
- Complete and submit the official AI acknowledgement available from the LMS Assessments page; the repository acknowledgement supports but does not replace that required form.
- Include any separately required Word/PDF submission statement and confirm Turnitin produces a similarity score. The brief warns that a submission without a similarity score will not be marked.
- Re-download or preview every uploaded item before final submission.
