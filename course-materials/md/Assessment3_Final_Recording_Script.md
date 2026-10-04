# Assessment 3 final pause-and-resume recording script

Prepared: 4 October 2026

This is the final recording document. Follow it from top to bottom. The earlier `Assessment3_Video_and_Submission.md` remains a detailed evidence record, but this document is the practical script to use while recording.

Target finished length: **approximately 7 minutes 15 seconds**  
Mandatory length: **3–8 minutes**

## The recording method

Record this as ten short chunks using Pause and Resume.

- Keep the face-camera overlay visible in every chunk.
- Keep this script on a phone, tablet, second monitor, or printed page so it is not captured.
- While paused, move to the next specified window, tab, file, heading, or scroll position.
- Resume only when the correct evidence is already visible.
- Read the words under **Say** naturally. Do not read the preparation instructions aloud.
- Pause at the stated checkpoint before arranging the next chunk.
- Do not rerun Playwright, JMeter, or Lighthouse during the recording. Their final evidence is already saved.
- The only intentional live data-changing action is one Wordle HTML export.
- Speak to the values actually visible on the dashboard. Small differences from the verified starting values are expected because visiting pages records live events.
- Stop and restart the take if the finished recording is likely to exceed 7 minutes 45 seconds.

## Rubric coverage

| Requirement | Where it is demonstrated |
|---|---|
| Student ID, face, voice, and application | Chunk 1 and face/voice throughout |
| Data-driven dashboard and reporting views | Chunks 2, 4, and 5 |
| Wordle and Word Search activity generation | Chunks 2 and 4 |
| Database persistence and stored activity data | Chunks 3 and 4 |
| Operational statistics and health | Chunks 2, 3, and 5 |
| Alerts and unusual states | Chunk 5 |
| Playwright evidence | Chunk 6 |
| JMeter evidence | Chunk 7 |
| Lighthouse evidence and resulting improvement | Chunk 8 |
| Docker reliability | Chunk 9 |
| Code quality, GitHub homepage, and commit history | Chunks 3 and 10 |

## Before opening the recorder

### 1. Start the final Docker application

The final `phonotrail` image has already been built. Open a visible PowerShell window and run:

```powershell
wsl -d Ubuntu -u root -- docker rm -f phonotrail-app
```

Ignore `No such container` if it appears. Then run:

```powershell
wsl -d Ubuntu -u root -- bash -c "docker run --rm -p 3000:3000 -v phonotrail-data:/data -e DATABASE_URL=file:/data/phonotrail.db --name phonotrail-app phonotrail"
```

Leave this command running. Do not close this terminal. Wait until it shows that migrations have been checked and Next.js is ready.

### 2. Open the saved Playwright report

Open a second PowerShell window:

```powershell
cd C:\repos\cloud-web-app\app
npm run test:e2e:report
```

This serves the existing report; it does not rerun the tests. Leave this PowerShell window open.

### 3. Open browser tabs in this exact order

Use one browser window. Arrange these tabs from left to right:

1. **Home:** `http://localhost:3000/`
2. **Dashboard:** `http://localhost:3000/dashboard`
3. **Dashboard JSON:** `http://localhost:3000/api/dashboard/summary`
4. **Health JSON:** `http://localhost:3000/api/health`
5. **Wordle:** `http://localhost:3000/wordle`
6. **Playwright:** the report opened by `npm run test:e2e:report`
7. **JMeter:** open the following saved file:

   ```powershell
   Start-Process "C:\repos\cloud-web-app\app\load-tests\raw-results\2026-09-28\stage-10000-report\index.html"
   ```

8. **Lighthouse baseline:**

   ```powershell
   Start-Process "C:\repos\cloud-web-app\app\lighthouse\raw-results\2026-09-28\dashboard-baseline.report.html"
   ```

9. **Lighthouse final:**

   ```powershell
   Start-Process "C:\repos\cloud-web-app\app\lighthouse\raw-results\2026-09-28\dashboard-final.report.html"
   ```

10. **GitHub homepage:** `https://github.com/21593530/Cloud-Web-Application-Assessment`
11. **GitHub commits:** `https://github.com/21593530/Cloud-Web-Application-Assessment/commits/main/`

### 4. Open VS Code tabs in this exact order

1. `app/prisma/schema.prisma` — position at `model UsageEvent` around line 51.
2. `app/src/app/api/health/route.ts` — keep the Prisma checks and HTTP 503 response visible.
3. `app/e2e/builder-crud.spec.ts` — position at the test name.
4. `app/e2e/generated-activity-reporting.spec.ts` — position at the test name.
5. `app/load-tests/results/Assessment3_JMeter_Results.md` — open Markdown Preview and position at `Stage results`.
6. `app/lighthouse/results/Assessment3_Lighthouse_Results.md` — open Markdown Preview and position at `Results`.
7. `app/verification/Assessment3_Phase10_Verification.md` — position at `Docker verification`; later move to `Post-feedback database healthcheck verification`.

### 5. Final visual preparation

- Set browser and VS Code zoom so the important text is readable in the captured video.
- Close notifications, email, private tabs, secrets, and unrelated applications.
- Put the dashboard near the top of the page.
- On Wordle, make sure the `Saved activity` dropdown is visible.
- Confirm Browser Tab 4 displays:

  ```json
  {"data":{"status":"ok","database":"connected"}}
  ```

- Confirm the Playwright report shows two passed tests.
- Confirm GitHub shows commit `9237a02` near the top.
- Have the physical student ID ready.
- Start a separate timer when recording begins.

## Expected dashboard values

The verified prepared dataset started with the following values. Live page visits may increase source/event totals or duration samples before recording, so use the values visible on screen rather than forcing these numbers.

| Metric | Verified prepared value |
|---|---:|
| Current activities | 3 |
| Saved Wordle | 2 |
| Saved Word Search | 1 |
| Average page time | 74.9 seconds from 12 prepared samples |
| Most-used output | Wordle |
| Wordle attempts | 7 |
| Word Search attempts | 6 |
| Successful generations | 11 |
| Failed generations | 2 |
| Success rate | 84.6% |
| Prepared simulated events | 31 |

The live Wordle export should increase successful generations by one and add a live generation event. Do not repeat the export if the first one succeeds.

---

# Recording chunks

## Chunk 1 — Identification and scope

Target: **0:00–0:25**  
Rubric evidence: mandatory student ID, face, voice, working application, and clear project scope.

### While paused, prepare

- Show Browser Tab 1: PhonoTrail Studio home page.
- Make sure the face-camera overlay is visible and not covering important page content.
- Hold the student ID ready beside your face.

### Resume and do

1. Look toward the camera.
2. Hold the student ID steady for several seconds.
3. Keep the home page visible.
4. Lower the ID after saying the student number.

### Say

> Hi, I am Isaac Riley Lambert, student number 21593530. This is PhonoTrail Studio for Assessment 3: data-driven application and reporting. It continues my phoneme-based Wordle and Word Search builders and adds database-backed reporting, observability, operational statistics, alerts, and measured testing evidence.

### Pause when

Pause immediately after saying “measured testing evidence.”

### Check before continuing

- Face visible.
- ID readable.
- Name and student number spoken clearly.
- Home page visible.

---

## Chunk 2 — Dashboard and reporting overview

Target: **0:25–1:35**  
Rubric evidence: polished dashboard, stored activity counts, meaningful reporting views, operational statistics, and source transparency.

### While paused, prepare

- Switch to Browser Tab 2: Dashboard.
- Scroll to the top.
- Look at the actual card values so you do not accidentally quote a stale number.

### Resume and do

1. Point to `Application healthy` and `Database connected`.
2. Move across the `Current activities`, `Saved Wordle`, and `Saved Word Search` cards.
3. Point to `Average time on page`, `Most-used output`, successful and failed generations, and success rate.
4. Scroll to `Generation attempts by activity type` and `Generation outcomes`.
5. Scroll near the bottom to `Recent operational events` and `Data source disclosure`.
6. Point to the visible `simulated` and `live` labels.

### Say

> The dashboard combines current teaching activities with stored operational events. It shows three saved activities: two Wordle and one Word Search. The prepared duration samples average 74.9 seconds. Wordle is the most-used output, with seven attempts compared with six, and the starting generation result is eleven successes and two failures, or 84.6 percent. Activity totals come directly from Activity records, while operational statistics come from UsageEvent records. The source disclosure distinguishes simulated evidence from live interactions, so prepared data is never presented as genuine user traffic.

If a live value differs, state the visible value instead of the prepared number.

### Pause when

Pause with `Recent operational events` or `Data source disclosure` visible.

### Check before continuing

- Activity counts shown.
- Average duration shown.
- Most-used type shown.
- Success/failure statistics shown.
- Simulated/live disclosure shown.

---

## Chunk 3 — Database model, data flow, and genuine healthcheck

Target: **1:35–2:30**  
Rubric evidence: clean database persistence, structured operational data, code quality, meaningful health status, and response to Assessment 2 feedback.

### While paused, prepare

- Switch to VS Code Tab 1: `app/prisma/schema.prisma` at `model UsageEvent`.
- Make the model readable without unnecessary surrounding code.

### Resume and do

1. Point to `eventType`, `activityType`, `activityId`, `pagePath`, `durationMs`, `source`, and `createdAt`.
2. Switch to VS Code Tab 2: `app/src/app/api/health/route.ts`.
3. Point to the two Prisma `findFirst` checks, the connected response, and the controlled HTTP 503 response.
4. Switch to Browser Tab 3: Dashboard JSON. Briefly point to `health`, `activities`, `usage`, `sources`, and `recentEvents`. Use `Ctrl+F` if needed.
5. Switch to Browser Tab 4: Health JSON. Point to `status: ok` and `database: connected`.

### Say

> I preserved the Activity, Word, and ordered Phoneme models and added UsageEvent as a separate reporting model. Validated events avoid raw teaching content and personal or fingerprinting data, and the server aggregates them into this dashboard response. In response to my Assessment 2 feedback, the health endpoint now queries the Activity and UsageEvent tables through Prisma before returning HTTP 200 and database connected. A failed check returns a controlled HTTP 503 without exposing internal database details.

### Pause when

Pause with Browser Tab 4 showing the connected health response.

### Check before continuing

- `UsageEvent` shown.
- Health implementation shown—not merely the JSON.
- HTTP 200 connected response shown.
- Feedback-driven improvement explicitly explained.

---

## Chunk 4 — Live Wordle export and reporting update

Target: **2:30–3:15**  
Rubric evidence: activity generation, persisted builder data retrieval, generated output, and clear connection between application use and reporting.

### While paused, prepare

- Note the current `Successful generations` number on Browser Tab 2.
- Switch to Browser Tab 5: Wordle.
- Scroll to the `Saved activity` dropdown.

### Resume and do

1. Open `Saved activity` and select `Ship phoneme Wordle`.
2. If that title is absent, choose any populated saved Wordle.
3. Wait for the `Loaded` status message.
4. Briefly point to the restored phonemes, English equivalent, clue, difficulty, and live preview.
5. Scroll to the buttons above `Live Preview`.
6. Click `Export HTML` once.
7. Wait for `Exported a standalone playable HTML Wordle.`
8. Do not open the downloaded file; the visible download and success message are sufficient.
9. Switch to Browser Tab 2 and refresh once with `Ctrl+R`.
10. Point to the successful-generation increase and the newest live generation event.

### Say while performing the actions

> This saved Wordle restores its phonemes, English equivalent, clue, difficulty, and settings from the database. I am exporting it as standalone playable HTML. The download completes while a non-blocking request records the successful generation. After refreshing the dashboard, the success count increases and a live event appears. Reporting therefore reflects real builder use, but a reporting outage cannot prevent the classroom export.

### Pause when

Pause with the updated dashboard metric or newest live event visible.

### Check before continuing

- Saved activity loaded from the database.
- Export success message visible.
- Dashboard refreshed only once.
- Increased count or new live event shown.

---

## Chunk 5 — Alerts and reporting interpretation

Target: **3:15–3:40**  
Rubric evidence: warning indicators for unusual states and understandable operational signals.

### While paused, prepare

- Remain on Browser Tab 2.
- Scroll to `Alerts and information`.
- Place `Recent generation failures` clearly on screen.

### Resume and do

1. Point to the warning title.
2. Point to the failure count and explanatory text.
3. Keep the textual label visible while explaining accessibility.

### Say

> This warning reports generation failures in the current seven-day window and links the condition to a concrete count. It uses a text label and explanation rather than colour alone. These are controlled simulated records, making the alert repeatable without presenting them as genuine failures.

### Pause when

Pause with the complete warning visible.

### Check before continuing

- Warning title and supporting text readable.
- Failure count mentioned.
- Simulated nature disclosed.

---

## Chunk 6 — Playwright end-to-end testing

Target: **3:40–4:35**  
Rubric evidence: clear Playwright evidence explaining reliability from both teacher and learner perspectives.

### While paused, prepare

- Switch to VS Code Tab 3: `builder-crud.spec.ts` at the test name.

### Resume and do

1. Show the builder/CRUD test name and briefly scroll through its major actions.
2. Switch to VS Code Tab 4: `generated-activity-reporting.spec.ts`.
3. Show its test name and the health, learner interaction, download, and reporting assertions.
4. Switch to Browser Tab 6: Playwright report.
5. Keep the green overall result and both passed test names visible.
6. Do not click Run or rerun the suite.

### Say

> Playwright covers both required perspectives with an isolated migrated database. The teacher workflow creates, reloads, updates, and deletes a Word Search while checking ordered multi-character phonemes. The learner workflow checks health and invalid input, solves a Wordle preview, downloads its HTML, and confirms dashboard reporting. Both Edge tests passed in 6.3 seconds, and the disposable database protects the demonstration data.

### Pause when

Pause with the green Playwright result and both test names visible.

### Check before continuing

- Both source specifications shown.
- Both test purposes explained.
- Passing HTML report shown.
- Isolation from demonstration data explained.

---

## Chunk 7 — JMeter staged load testing

Target: **4:35–5:30**  
Rubric evidence: clearly demonstrated JMeter results and accurate interpretation of behaviour under load.

### While paused, prepare

- Switch to VS Code Tab 5: JMeter results Markdown Preview.
- Position the document at the five-row `Stage results` table.

### Resume and do

1. Move down the 1, 10, 100, 1,000, and 10,000 rows.
2. Point to total samples, p95, throughput, and errors.
3. Emphasise the 10,000 row.
4. Switch to Browser Tab 7: saved JMeter HTML dashboard.
5. Show the summary/statistics area without exploring every graph.

### Say

> JMeter exercised health, dashboard-summary, and activity reads at one, ten, one hundred, one thousand, and ten thousand requests per endpoint. All 33,333 samples completed with zero errors. The final stage reached about 1,493 requests per second, a 2.19 millisecond mean, and 3 millisecond aggregate p95. The failure threshold was not reached. These are comparative local read-only results, not a production-capacity claim.

### Pause when

Pause with the highest-stage JMeter summary visible.

### Check before continuing

- All five stages shown.
- 33,333 samples and zero errors stated.
- Throughput and p95 interpreted.
- Local/read-only limitation stated.

---

## Chunk 8 — Lighthouse accessibility improvement

Target: **5:30–6:15**  
Rubric evidence: Lighthouse results clearly demonstrated and used to explain a real design improvement.

### While paused, prepare

- Switch to Browser Tab 8: dashboard baseline Lighthouse report.
- Keep the accessibility score of 96 visible.

### Resume and do

1. Point to the baseline score of 96 and the failed colour-contrast audit.
2. Switch to VS Code Tab 6: Lighthouse results Markdown Preview.
3. Point to the original failing ratios and the corrected light/dark ratios above 6:1.
4. Switch to Browser Tab 9: final Lighthouse report.
5. Point to the final score of 100 and the absence of scored failures.

### Say

> Lighthouse initially scored the dashboard 96 and found two labels below the required 4.5-to-1 text contrast ratio. I introduced theme-aware text colours above 6 to 1 in both themes. The final dashboard scored 100 with all 25 weighted audits passing, and Wordle also scored 100. Automated results support this change but do not replace manual keyboard, focus, landmark, and assistive-technology checks.

### Pause when

Pause with the final Lighthouse score of 100 visible.

### Check before continuing

- Baseline 96 shown.
- Specific contrast problem explained.
- Measured design response shown.
- Final 100 shown.
- Automated-audit limitation acknowledged.

---

## Chunk 9 — Docker reliability and persistence

Target: **6:15–6:45**  
Rubric evidence: required deployment environment, migrations, persistence, health, CRUD, exports, and final integration reliability.

### While paused, prepare

- Switch to the visible PowerShell window running the foreground Docker container.
- Make sure startup/migration output is visible.

### Resume and do

1. Show the Docker terminal and point to migration/startup output.
2. Switch to VS Code Tab 7: Phase 10 verification.
3. Position at `Docker verification` and point to routes, health, CRUD, exports, and restart persistence.
4. Briefly move to `Post-feedback database healthcheck verification` and point to the 200/503 result.
5. Switch briefly to Browser Tab 4 for the live health JSON.
6. Return to Browser Tab 2 for the populated Docker dashboard.

### Say

> The application is running in Docker with SQLite in the named `phonotrail-data` volume. Clean-volume verification applied both migrations, returned HTTP 200 for six routes and the database-backed healthcheck, passed CRUD and both exports, and retained data after restart. An unavailable-database check returned HTTP 503, demonstrating meaningful failure signalling.

### Pause when

Pause with the live Docker dashboard visible.

### Check before continuing

- Docker terminal shown.
- Named-volume persistence explained.
- Migration, CRUD, exports, and restart evidence mentioned.
- Genuine 200/503 health behaviour mentioned.

---

## Chunk 10 — GitHub, code quality, limitations, and conclusion

Target: **6:45–7:20**  
Rubric evidence: professional GitHub homepage, focused history, maintainable structure, critical evaluation, and conclusion.

### While paused, prepare

- Switch to Browser Tab 10: GitHub repository homepage.
- Position the README near the architecture/data-flow and evidence sections.

### Resume and do

1. Scroll briefly through the README sections for data flow, setup, Docker, testing evidence, limitations, references, and AI acknowledgement.
2. Switch to Browser Tab 11: commit history.
3. Slowly show the focused commits for metric design, persistence, dashboard reporting, resilience, Playwright, JMeter, Lighthouse, Docker verification, documentation, and the final database-backed healthcheck.
4. Keep commit `9237a02` visible if possible.
5. Finish on the commit history or switch to Browser Tab 2 for the dashboard closing shot.

### Say

> The repository documents the architecture, setup, evidence, references, AI acknowledgement, and limitations. Its focused commits separate persistence, reporting, resilience, Playwright, JMeter, Lighthouse, Docker verification, documentation, and the feedback-driven healthcheck. Words currently belong to individual activities rather than reusable versioned lists; that is documented as future schema work. PhonoTrail Studio preserves its classroom builders while adding evidence that the system is observable, tested, accessible, and understood under load.

### Stop recording when

Stop immediately after “understood under load.” Do not add an improvised second conclusion.

### Final chunk check

- GitHub README shown.
- Focused commit history shown.
- Latest healthcheck commit shown.
- Limitation critically evaluated.
- Clear conclusion delivered.

---

# Immediately after recording

Do not upload immediately. Review the complete rendered video first.

- [ ] Finished length is between 3 and 8 minutes.
- [ ] Face remains visible throughout.
- [ ] Student ID is readable at the beginning.
- [ ] Voice is clear and continuous across resumed chunks.
- [ ] Pause/resume transitions do not remove or repeat important sentences.
- [ ] Dashboard values are readable.
- [ ] Wordle export and resulting dashboard update are visible.
- [ ] Database model and genuine healthcheck are shown.
- [ ] Alert is shown and explained.
- [ ] Both Playwright tests and the green result are visible.
- [ ] All five JMeter stages and final result are visible.
- [ ] Lighthouse 96, the contrast response, and final 100 are visible.
- [ ] Docker terminal and verification evidence are visible.
- [ ] GitHub homepage and commits are visible.
- [ ] No passwords, tokens, private messages, or unrelated personal information appear.

# Submission checks after the video is accepted

- [ ] Keep the original recording until the LMS submission is confirmed.
- [ ] Confirm `main` and `origin/main` match.
- [ ] Upload `submission/PhonoTrail-Studio-Assessment3-source.zip`.
- [ ] Check the LMS accepts the approximately 101 MB ZIP.
- [ ] Upload the final 3–8 minute video using the required LMS method.
- [ ] Provide the GitHub repository link.
- [ ] Complete the official LMS AI acknowledgement; the repository acknowledgement does not replace it.
- [ ] Submit any required Word/PDF statement and confirm Turnitin produces a similarity score.
- [ ] Re-download or preview every submitted item before final submission.

# Emergency fallbacks during recording

- If a dashboard value differs, state the visible value; do not restart merely because live telemetry changed it.
- If the export succeeds but the dashboard has not updated, wait for the refresh to finish. Refresh once more only if necessary; do not export twice.
- If a raw HTML report is difficult to read, show its Markdown results summary instead.
- If a browser tab is missing, pause, reopen it, place it in the expected position, and resume.
- If you lose your place, pause. Find the next **Say** block and resume from the start of that chunk.
- If Docker stops, pause, restart the documented foreground command, confirm health and dashboard, then resume the affected chunk.
- If the recording exceeds 8 minutes, it must be redone or carefully shortened before submission.
