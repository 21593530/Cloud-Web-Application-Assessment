# Assessment 3 — final video walkthrough

Updated 4 October 2026. **This is the recording guide.** It replaces the previous ten-section script and its printed wording. The matching [spoken-only TXT](Assessment3_Final_Spoken_Script.txt) has the same numbered cues and exactly the same spoken words.

**Aim: about 7 minutes. Required length: 3–8 minutes.** Timing below is a guide, not a deadline for each sentence. Keep your face visible, include your voice throughout, and show your student ID at the start.

## How to use this without juggling instructions

- **DO** the small action, then **SAY** the words directly underneath it. Stay on that screen until you finish those words.
- Only read the quoted text aloud. The explanations and actions are for you.
- Record one chunk at a time. **Pause → set up the next screen → resume.** You can also pause between numbered cues. You do not have to talk while finding a tab.
- Speak as if you are showing the app to a classmate. A short breath or quiet click is fine. You do not need to memorise this or recite changing dashboard numbers.
- Keep this guide on a second screen, another device, or paper—not over the evidence you are recording.
- You are showing **saved test results**, not running tests on camera. You are not repeating the full Assessment 2 CRUD demonstration.

## Setup — do this once, off camera

Do not press Record until these checks pass. This setup is not part of the video.

### 1. Check Docker and prepare its evidence

Open a PowerShell terminal and run:

```powershell
wsl -d Ubuntu -u root -- docker ps --filter name=phonotrail-app
```

You need a row for **phonotrail-app**, with port **3000** published. Leave this short output visible for cue 1.2. If it is already running, **do not rebuild, remove or restart it**.

Open [Home](http://localhost:3000/) and [health](http://localhost:3000/api/health). The health page must show `status: "ok"` and `database: "connected"`.

If the app is stopped, use the **App is stopped** instructions at the end of this guide before continuing.

### 2. Check the demonstration data and warning

Open [Dashboard](http://localhost:3000/dashboard), click **Refresh dashboard**, and look just below the introduction for **Alerts and information → Recent generation failures**.

If the simulated example is absent or has aged out, run this in a second PowerShell terminal:

```powershell
wsl -d Ubuntu -u root -- docker exec phonotrail-app npm run db:seed:metrics
```

This creates or refreshes **31 labelled simulated reporting records**, including two recent failures. It does **not** delete saved activities or live records. Rerunning refreshes the dates on those fixed example records rather than duplicating them. It **does change the displayed reporting totals**; that is why this happens before recording.

Refresh the dashboard again. Confirm the warning is visible and **Data source disclosure** at the bottom includes simulated events. Do not reset the database to match an old script. If other live failures are present, the warning count can be higher than two; do not describe those as simulated.

### 3. Choose the two saved activities

In [Wordle](http://localhost:3000/wordle), check the **Saved activity** dropdown. Choose one with phonemes, an English equivalent, a clue and a difficulty. In [Word Search](http://localhost:3000/word-search), choose one with a non-empty word list and a working grid.

Use existing activities; their exact names do not matter. Write the two titles here if helpful:

- Wordle: ____________________
- Word Search: ____________________

Rehearse loading and exporting each **before** the take. Both exports should open a new tab and download an HTML file. Allow pop-ups/downloads for localhost if your browser asks. Check both generated outputs are visible. Close the rehearsal output tabs afterward; keep the builder tabs.

Refresh the dashboard **after rehearsal**. Write down **Successful generations: ______**. This is your starting count. The two exports during chunk 2 should add two. Do not seed or perform extra exports between this baseline and chunk 3.

### 4. Open the saved results

From a separate PowerShell terminal:

```powershell
Set-Location C:\repos\cloud-web-app\app
npm run test:e2e:report
```

This opens/serves the existing Playwright report; it does **not** run the tests. Leave the terminal running. Check the browser report shows **both tests passed**. Click each test once to find its **Test Steps**, then return to the overview.

Open these two files through File Explorer, or paste each absolute path into a browser address bar:

- `C:\repos\cloud-web-app\app\lighthouse\raw-results\2026-09-28\dashboard-baseline.report.html`
- `C:\repos\cloud-web-app\app\lighthouse\raw-results\2026-09-28\dashboard-final.report.html`

Confirm the baseline Accessibility score is **96** and final score is **100**. Find and expand the baseline colour-contrast failure now, so you know where it is.

In VS Code, use **Ctrl+P**, paste each path below, and press Enter. For the two Markdown files, press **Ctrl+Shift+V** to open a readable preview; pin the preview tabs so the next file does not replace them.

- `app/prisma/schema.prisma` — start at `model Activity`.
- `app/load-tests/results/Assessment3_JMeter_Results.md` — start at **Outcome**; find **Stage results** below it.
- `app/lighthouse/results/Assessment3_Lighthouse_Results.md` — start at **Finding and response**.

The JMeter Markdown table is the saved five-stage evidence. You do not need to launch JMeter or open five separate reports. Do not use `.last-run.json` as your main Playwright evidence; the HTML report is clearer.

### 5. Put the windows in recording order

Keep one browser window for the app/reports and VS Code for the schema/two result summaries. Use page names, not tab numbers; exported files will add tabs.

| Chunk | Have this ready before resuming |
|---|---|
| 1 | Home, student ID, Docker status terminal |
| 2 | Wordle and Word Search builder tabs |
| 3 | Dashboard refreshed after both exports |
| 4 | VS Code schema; browser health page |
| 5 | Playwright report overview |
| 6 | VS Code JMeter results preview |
| 7 | Lighthouse baseline browser tab, results preview, final browser tab |
| 8 | GitHub homepage and commits page |

Open [GitHub homepage](https://github.com/21593530/Cloud-Web-Application-Assessment) and [commits](https://github.com/21593530/Cloud-Web-Application-Assessment/commits/main/). Make sure the assessed work is visible; do not push or commit during the recording.

Close notifications, secrets and unrelated windows. Check the microphone, face camera and text size. Do a short sound test. **If a report, warning or saved activity is missing, resolve it now—not halfway through the recording.**

---

# Recording starts here

## Chunk 1 — Introduce the project

Guide: 0:00–0:30.

**What this means — not spoken:** You are showing what the app is for and that the assessed version is running in Docker.

**While paused:** Browser → Home (`http://localhost:3000/`). Face camera on; student ID in your hand. Have the Docker status terminal ready behind the browser.

### 1.1 — Home page

**DO:** Start recording. Hold your student ID beside your face for a few seconds, then lower it. Stay on Home.

**SAY:**

> Hi, I'm Isaac Riley Lambert, student number 21593530. This is PhonoTrail Studio, my phoneme-based Wordle and Word Search builder. For Assessment 3, I've added a dashboard so I can see how the app is being used and whether it's working properly.

### 1.2 — PowerShell → prepared Docker status

**DO:** Switch to the terminal showing the `docker ps` result. Point to `phonotrail-app` and the port 3000 mapping. Do not type or start anything.

**SAY:**

> I'm running the app in Docker, using the same persistent database setup from Assessment 2.

**PAUSE. Chunk 1 is finished.** Prepare the next chunk before resuming.

---

## Chunk 2 — Load and export both activities

Guide: 0:30–1:40.

**What this means — not spoken:** Loading proves these are saved activities. Exporting shows what a learner actually receives. Both exports should also create reporting events.

**While paused:** Browser → Wordle (`http://localhost:3000/wordle`), at the Saved activity dropdown. Use the two saved activities you checked during setup; do not create new ones on camera.

### 2.1 — Wordle builder → Saved activity

**DO:** Select your prepared saved Wordle. Wait for `Loaded "…".` Show the phoneme tokens, then scroll slowly to English equivalent, Teacher clue and Difficulty.

**SAY:**

> I'll start with a saved Wordle. Selecting it brings back the phonemes, English word, clue and difficulty from the database. I don't need to enter them again.

### 2.2 — Wordle builder → Export HTML → generated Wordle tab

**DO:** Click Export HTML once, just above Live Preview. Switch to the newly opened game tab and leave its grid and keyboard visible. If no tab opens, pause and open the latest `phonotrail-wordle.html` from browser Downloads; do not export again.

**SAY:**

> This is the exported Wordle that a learner can use. It's a standalone HTML file, so they don't need my application server running to play it.

### 2.3 — Word Search builder → Saved activity

**DO:** Switch to `http://localhost:3000/word-search`. Select your prepared saved Word Search. Wait for it to load, then show its word list and Rows/Columns settings.

**SAY:**

> Word Search works the same way. This saved activity restores its phoneme word list and grid settings.

### 2.4 — Word Search builder → Export HTML → generated worksheet tab

**DO:** Click Export HTML once. Show the new worksheet tab with its grid and word list. If no tab opens, pause and open the latest `phonotrail-word-search.html` from Downloads.

**SAY:**

> Here's its exported worksheet. Both outputs come from stored teaching content, and each export also records a generation event for the dashboard.

**PAUSE. Chunk 2 is finished.** Prepare the next chunk before resuming.

---

## Chunk 3 — Show what the dashboard tells you

Guide: 1:40–3:15.

**What this means — not spoken:** The dashboard answers three questions: what is saved, how the app is being used, and whether anything needs attention. Simulated data is labelled demonstration data, not real classroom traffic.

**While paused:** Browser → Dashboard (`http://localhost:3000/dashboard`). Click Refresh dashboard and wait. Check that Successful generations is two higher than your setup baseline. If it is not, use the troubleshooting notes before recording this chunk.

### 3.1 — Dashboard → Alerts and information, just below the introduction

**DO:** Keep Recent generation failures and its explanatory sentence visible. Point to the WARNING label. This must be the prepared simulated example checked during setup.

**SAY:**

> The dashboard also tells me when something needs attention. This warning shows recent failed generation attempts. I've included labelled simulated failures to demonstrate it safely. The warning uses words as well as colour.

### 3.2 — Dashboard → Saved activity and usage metrics

**DO:** Scroll slightly to the cards. Point across Current activities, Saved Wordle and Saved Word Search.

**SAY:**

> These cards count the activities currently saved in the database, split into Wordle and Word Search.

### 3.3 — Dashboard → Average time on page and Most-used output

**DO:** Keep these two cards visible and point to each as you mention it. You do not need to read their numbers aloud.

**SAY:**

> These show average recorded time on a page and which activity type has the most generation attempts. That helps me understand usage, although time on a page isn't proof of learning.

### 3.4 — Dashboard → Successful generations, Failed generations and Generation success rate

**DO:** Point to Successful generations first, then the failures and percentage. Only use the first sentence after confirming the increase during the pause.

**SAY:**

> The success count has increased after those two exports. Alongside it, I can see failed attempts and the overall success rate, so I can monitor export reliability.

### 3.5 — Dashboard → Generation attempts by activity type and Generation outcomes

**DO:** Scroll down to the two charts directly below the cards. Leave both visible.

**SAY:**

> The charts make the comparison easier to read: which builder is being used, and how many attempts succeeded or failed.

### 3.6 — Dashboard → Generation trend

**DO:** Scroll to the seven-day table alongside Average time by page. Point to the dated rows.

**SAY:**

> This table shows successes and failures over the last seven dates, rather than just one overall total.

### 3.7 — Dashboard → Recent operational events, then Data source disclosure

**DO:** Scroll to Recent operational events and point to a `Generation succeeded` row marked `live`. Then scroll slightly to the Data source disclosure directly below the reports. If navigation has pushed the export out of the ten recent rows, pause; do not describe an invisible row.

**SAY:**

> Here's a live generation event from the demonstration. Below it, the disclosure separates live records from simulated examples. That makes it clear which figures came from real use and which were prepared for testing.

**PAUSE. Chunk 3 is finished.** Prepare the next chunk before resuming.

---

## Chunk 4 — Explain the database and health check

Guide: 3:15–4:05.

**What this means — not spoken:** Activity → Word → Phoneme stores teaching content. UsageEvent stores what happened during use. The health endpoint checks that the database can actually be read.

**While paused:** VS Code → `app/prisma/schema.prisma`, near the top. Also have the browser health page ready. This is the only application code file you need to show.

### 4.1 — VS Code → schema.prisma → model Activity, Word and Phoneme

**DO:** Show Activity and Word, then scroll just enough to show Phoneme and its `symbol` and `position` fields. Do not read every field.

**SAY:**

> The database separates activities, words and phonemes. Each phoneme has a position, so sounds stay in the right order, including symbols made from more than one character.

### 4.2 — VS Code → schema.prisma → model UsageEvent

**DO:** Scroll a little farther down to UsageEvent. Point to eventType, durationMs, source and createdAt while leaving the whole model visible.

**SAY:**

> UsageEvent stores the reporting data separately. It records things like page time and export results. The server validates these events, saves them, and adds them up for the dashboard. This keeps reporting separate from the teaching content.

### 4.3 — Browser → http://localhost:3000/api/health

**DO:** Show the JSON containing `status: ok` and `database: connected`. Do not stop the database to demonstrate a failure.

**SAY:**

> This health check now reads both the activity and reporting tables before returning OK. That addresses my Assessment 2 feedback: it checks the database, not just whether the server can send a response.

**PAUSE. Chunk 4 is finished.** Prepare the next chunk before resuming.

---

## Chunk 5 — Show the two Playwright tests

Guide: 4:05–4:55.

**What this means — not spoken:** Playwright uses a browser to perform actions and check the result automatically. One test covers the teacher's workflow; the other covers a learner interaction and export reporting.

**While paused:** Browser → saved Playwright report. Clear any search/filter so both passed tests are listed. The report was opened during setup; do not run tests while recording.

### 5.1 — Playwright report → overview with both passed tests

**DO:** Leave the two passing test names and green results visible.

**SAY:**

> I used Playwright to check complete workflows in the browser. This saved report shows both tests passed.

### 5.2 — Playwright report → teacher can create, retrieve, update, and delete a Word Search activity

**DO:** Click that test name. Show its Test Steps, with saving, reloading, updating and deleting visible as you scroll. Do not open the source file or read code.

**SAY:**

> The teacher test saves a Word Search, reloads it, changes it and deletes it. It also checks that multi-character phonemes keep their correct order.

### 5.3 — Playwright report → learner interaction and export appear in dashboard reporting

**DO:** Return to the report overview using browser Back, then click the learner test. Show its steps for the guess, download and dashboard checks.

**SAY:**

> The learner test solves a Wordle in the preview, checks the HTML download, and confirms that the dashboard records the success. These tests use a separate database, so they don't overwrite my saved demonstration activities.

**PAUSE. Chunk 5 is finished.** Prepare the next chunk before resuming.

---

## Chunk 6 — Explain the JMeter load results

Guide: 4:55–5:45.

**What this means — not spoken:** JMeter sends repeated requests to measure speed and errors. Requests per endpoint are not the same thing as simultaneous users. The saved run tested reads, not a full browser export under load.

**While paused:** VS Code → `app/load-tests/results/Assessment3_JMeter_Results.md` → Markdown Preview (`Ctrl+Shift+V`). Start at Outcome. The summary is easier to show than switching between five large reports.

### 6.1 — JMeter results preview → Outcome

**DO:** Show the paragraph containing 33,333 HTTP samples and 0.00% errors.

**SAY:**

> JMeter tested the health, activity and dashboard endpoints at increasing request volumes. Across all five stages, it recorded thirty-three thousand, three hundred and thirty-three requests with no errors.

### 6.2 — JMeter results preview → Stage results

**DO:** Scroll to the five-row table. Point down the Requests per endpoint column, then to the final row's p95 and Errors columns. Keep the table readable; no raw report switch is needed.

**SAY:**

> The stages go from one to ten thousand requests per endpoint. In the largest stage, ninety-five percent of responses took about three milliseconds or less. None of the stages crossed my failure threshold.

### 6.3 — JMeter results preview → Interpretation and limitations

**DO:** Scroll to the first two limitation bullets, which identify staged requests, 100 threads and local networking.

**SAY:**

> These were local, read-only tests, not ten thousand simultaneous users or full classroom exports. They show how this test setup behaved, not what a cloud deployment could handle.

**PAUSE. Chunk 6 is finished.** Prepare the next chunk before resuming.

---

## Chunk 7 — Show the accessibility improvement

Guide: 5:45–6:30.

**What this means — not spoken:** Lighthouse checks accessibility automatically. Here it found text that was too faint against its background; the colour change fixed those scored failures.

**While paused:** Browser → saved Lighthouse baseline report, at the Accessibility score. Have the final report open beside it. VS Code → Lighthouse results preview should already be positioned at Finding and response.

### 7.1 — Browser → dashboard-baseline.report.html

**DO:** Show Accessibility 96. Scroll to the failed colour-contrast audit and expand it so the warning/simulated label examples are visible.

**SAY:**

> Lighthouse gave the original dashboard an accessibility score of ninety-six. It found that the warning and simulated-data labels didn't have enough contrast against their backgrounds.

### 7.2 — VS Code → app/lighthouse/results/Assessment3_Lighthouse_Results.md → Finding and response

**DO:** Show the table of corrected text colours and contrast ratios for Light and Dark. It is directly below the two original failing ratios.

**SAY:**

> I changed those text colours in both light and dark themes. The new combinations are above six to one, making the labels easier to read.

### 7.3 — Browser → dashboard-final.report.html

**DO:** Show Accessibility 100. Leave this score visible for the rest of the chunk.

**SAY:**

> The follow-up dashboard audit scored one hundred. That means its scored automated checks passed, not that accessibility is finished. Keyboard and assistive-technology checks still matter.

**PAUSE. Chunk 7 is finished.** Prepare the next chunk before resuming.

---

## Chunk 8 — Finish with GitHub

Guide: 6:30–7:00.

**What this means — not spoken:** The repository shows the implementation, supporting documents and development history. You are acknowledging a real limitation rather than claiming everything is perfect.

**While paused:** Browser → `https://github.com/21593530/Cloud-Web-Application-Assessment`, scrolled to the rendered README. Have the commits page open beside it.

### 8.1 — GitHub → repository homepage → README

**DO:** Show Data flow, then scroll to Known limitations and pre-submission decisions. The README also links setup, evidence and references; do not open each link.

**SAY:**

> The repository explains the data flow and links the setup instructions, test evidence and references. One limitation is that word lists still belong to individual activities. Shared reusable lists would be a future improvement.

### 8.2 — GitHub → commits page

**DO:** Switch to `https://github.com/21593530/Cloud-Web-Application-Assessment/commits/main/`. Show the focused Assessment 3 commits, scrolling only enough to reveal a few. Finish here.

**SAY:**

> The commits show how the reporting and testing were added in stages. Overall, the app still produces the classroom activities, but now I can see how it's being used and back up the results with tests. Thank you.

**PAUSE. Chunk 8 is finished.** Stop and save the recording.

---

# Off-camera help — not part of the script

## If something does not match the screen

- **App is stopped:** if you already have the current `phonotrail` image and no `phonotrail-app` container exists, start it with the command below in a terminal you leave open. It reuses the existing named volume; do not delete the volume. If a stopped container with that name already exists, use `wsl -d Ubuntu -u root -- docker start -a phonotrail-app` instead. If Docker reports a port conflict or a missing image, resolve it before recording; do not switch to `npm run dev` and call that Docker.

  ```powershell
  wsl -d Ubuntu -u root -- docker run --rm -p 3000:3000 -v phonotrail-data:/data -e DATABASE_URL=file:/data/phonotrail.db --name phonotrail-app phonotrail
  ```

- **No Recent generation failures warning:** complete setup step 2. An all-clear message means no warning rule is active; it does not mean the dashboard is broken.
- **The warning includes real failures:** say “I've included labelled simulated failures to demonstrate it safely” as written, not “all failures are simulated.” If you cannot distinguish the prepared example from an unexpected fault, investigate before recording.
- **An export does not open a new tab:** pause. Open the latest downloaded HTML through browser Downloads (`Ctrl+J`). Do not click Export repeatedly.
- **Success count has not increased:** pause and refresh again after a few seconds. Confirm both exports actually completed. If reporting still has not updated, stop the take and investigate rather than claiming it worked.
- **The live export row has disappeared:** Recent operational events shows only ten rows. Repeated navigation creates more events. If needed, redo chunks 2–3 together, taking a fresh baseline first; do not claim an unrelated row is the export.
- **A saved test report is missing or failing:** do not read out a passing result. Prepare/verify the evidence off camera first. Test reproduction commands are in `app/e2e/README.md`, `app/load-tests/README.md` and `app/lighthouse/README.md`.
- **You stumble on a sentence:** pause, put the screen back at that cue, and resume from the start of that sentence. You do not need to restart the whole video.

## The ideas in ordinary English

| Term | What you mean |
|---|---|
| Persistence | Saved data is still there when you retrieve it again; Docker keeps SQLite in a named volume. |
| Phoneme | A speech sound represented by a token, which can contain more than one character. |
| Reporting event | A small database record of something happening, such as an export succeeding. |
| Observability | Being able to tell what the app is doing and whether something is wrong. |
| Simulated data | Deliberately prepared, labelled examples—not genuine classroom traffic. |
| Health check | A server route that checks the database can be read and returns a status. |
| Playwright | Automated browser actions with checks that the expected result occurred. |
| JMeter | Repeated HTTP requests used to measure response times and errors. |
| p95 | About 95% of measured responses took this long or less. |
| Lighthouse | Automated checks that can identify accessibility problems; not a complete accessibility guarantee. |
| Contrast | How clearly text stands out from its background. |

## What is verified, and what still needs a live check

Checked on 4 October 2026: the official brief and rubric, current source/labels, saved report paths, Playwright embedded results (**2 passed, 0 failed; about 6.3 seconds**), JMeter summary, and Lighthouse before/after evidence.

The application was **not reachable at localhost:3000 during this rewrite**. This document does not claim the Docker demo has been rehearsed or its current data verified. Complete the setup checks when the container is running.

Playwright evidence is dated **30 September**. JMeter and the baseline/final Lighthouse evidence are dated **28 September**. These are saved development results, not tests rerun while recording. In particular, the JMeter run predates the feedback-driven database healthcheck change; do not call it a fresh benchmark of the updated route. The load test exercised supporting read endpoints, not full browser generation or write-heavy traffic.

## Rubric coverage — for checking, not reading aloud

| Official criterion | Weight | Evidence in this walkthrough |
|---|---:|---|
| Data-driven dashboard, reporting views and activity generation | 6% | Chunk 2 shows both generated outputs; chunk 3 shows cards, comparisons and the dated report. |
| Database persistence and stored activity data | 6% | Chunk 2 retrieves saved words/settings; chunk 4 explains Activity/Word/Phoneme and UsageEvent; chunk 5 shows automated persistence checks. |
| Observability and operational statistics | 5% | Chunk 3 covers counts, page time, most-used output, success/failure, live events, simulated records and the warning; chunk 4 shows database health. |
| Testing and accessibility evidence | 4% | Chunks 5–7 show both Playwright workflows, five JMeter stages with limitations, and Lighthouse findings plus the design change. |
| Code quality and GitHub | 4% | Chunk 4 explains separate data responsibilities; chunk 8 shows the homepage, documented limitation and commits. |
| Mandatory video content | — | Face and voice throughout; ID in chunk 1; working Docker application; 3–8 minute final duration. |

This is a coverage check, not a guarantee of marks. The implementation's existing limitations remain documented.

## After recording

Play back the whole video once. Check readable evidence, clear sound, face/ID, both exported activities, all three testing tools, GitHub homepage/commits, and a total duration of **3–8 minutes**.

Use [Video and Submission](Assessment3_Video_and_Submission.md) only for packaging and upload checks. It no longer contains a competing script.
