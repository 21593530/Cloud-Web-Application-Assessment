# Assessment 3 — submission checklist

Updated 4 October 2026.

**Recording:** use [Assessment3_Final_Recording_Script.md](Assessment3_Final_Recording_Script.md). It contains the setup checks, exact screen actions, eight recording chunks, plain-English explanations and rubric coverage.

**Spoken-only copy:** [Assessment3_Final_Spoken_Script.txt](Assessment3_Final_Spoken_Script.txt). Its cue numbers and words match the recording guide.

The old timed script and fixed starting values have been removed from this document so there is only one walkthrough to follow.

## Timing and official requirements

The supplied brief specifies a **3–8 minute video**, with face, voice and student ID, showing the working app, dashboard, data-driven features, alerts, reporting, observability, Playwright, JMeter, Lighthouse, GitHub homepage and commits. It also requires the project ZIP, repository link, at least five academic/industry references in APA 7, and the official AI acknowledgement.

**Deadline check:** the supplied brief lists **11:59 pm, Sunday 4 October 2026**. If recording on 5 October, confirm an approved extension or a changed LMS deadline; do not assume “tomorrow” is within the original deadline.

Sources checked:
- `course-materials/assessment3/2026-CSE3CWA-(OL-2)_ Assessment 3_ Details and instructions _ My LMS subjects.pdf`
- `course-materials/assessment3/Assessment 3 Marking criteria and rubric CSE3CWA 1.docx`

## Before recording

Complete the setup section in the final recording guide. In particular:

- The app must actually be running in Docker, with database health connected.
- Check both saved activities load and both exported outputs open.
- Prepare the labelled simulated alert if it is absent; never describe an invisible warning.
- Take the success-count baseline after rehearsal, not before.
- Open the saved test reports in advance. Do not rerun the tests on camera.
- Check the assessed work is visible on GitHub.

The final script uses descriptions of the metrics rather than old hard-coded dashboard totals. A rehearsal legitimately changes live events and duration samples; that is not a fault.

## Saved evidence locations

These are existing development results, not a claim that all tests were rerun against the latest Docker image.

| Evidence | Where it is | What it supports |
|---|---|---|
| Playwright, 30 September | `app/playwright-report/index.html`; serve using `npm run test:e2e:report` from `app/` | Two passed workflows; teacher CRUD/persistence and learner preview/download/reporting. Embedded report total: about 6.3 seconds. |
| Playwright source and reproduction | `app/e2e/README.md` and the two `.spec.ts` files beside it | What each scenario checks and how its database is isolated. |
| JMeter, 28 September | `app/load-tests/results/Assessment3_JMeter_Results.md` | Five stages, 33,333 samples, zero errors, final aggregate p95 3 ms; local read-only limits. |
| JMeter raw highest-stage dashboard | `app/load-tests/raw-results/2026-09-28/stage-10000-report/index.html` | Only the final 30,000-sample stage, not the 33,333 total across all stages. Optional backup; not needed in the main walkthrough. |
| Lighthouse summary, 28 September | `app/lighthouse/results/Assessment3_Lighthouse_Results.md` | Baseline/final comparison, contrast changes in both themes and accessibility limitations. |
| Lighthouse original reports | `app/lighthouse/raw-results/2026-09-28/dashboard-baseline.report.html` and `dashboard-final.report.html` | Dashboard Accessibility 96 before and 100 after. |
| Docker and feedback verification | `app/verification/Assessment3_Phase10_Verification.md` | Dated clean-volume, CRUD/export and restart checks; separate 30 September database-health 200/503 verification. |
| Repository evidence | `app/verification/Assessment3_GitHub_Evidence.md`, root README and actual GitHub commits | Documentation and incremental development. |

Do not merge historical checks into a claim of one fresh test run. The JMeter results predate the database-backed healthcheck change. JMeter tested supporting read endpoints, not write-heavy activity creation or full browser exports. Playwright checks learner interaction in the builder preview plus the HTML download; it does not test a complete playthrough of the downloaded file.

## After recording

- Watch the final video and confirm it is between **3 and 8 minutes**.
- Confirm the face camera, voice and student ID are visible/clear.
- Check both generated outputs, the warning, all three testing tools, and GitHub homepage/commits appear.
- Check each spoken claim matches the screen; do not submit a take that says a missing warning or failing test passed.
- Keep the original recording until submission is accepted.

## Create the source ZIP

Use the existing packaging script from a PowerShell terminal:

```powershell
Set-Location C:\repos\cloud-web-app
powershell -ExecutionPolicy Bypass -File app/scripts/create-submission-archive.ps1
```

Output: `submission/PhonoTrail-Studio-Assessment3-source.zip`.

This avoids temporarily removing folders from your working repository. The script excludes dependencies, builds, secrets, databases and raw generated test artifacts while including the source, concise evidence and selected Assessment 3 documents. It refreshes the existing output ZIP, so run it again after final source/document changes.

The archive has previously been about **101 MB**, largely because of the existing Assessment 1 About-page video. Check the actual generated size and LMS limit. Do not silently remove an application asset to shrink it; an approved compression or upload approach may be needed.

## Upload checks

- Commit the intended final work and push normally; do not force push. Confirm GitHub contains the assessed code and documentation.
- Generate the ZIP from that intended final state and inspect its contents.
- Upload the project ZIP and provide the GitHub repository link.
- Upload the 3–8 minute video using the LMS mechanism.
- Include the official AI acknowledgement from the LMS Assessments page. The repository acknowledgement does not replace that form.
- Check `app/REFERENCES.md` supplies the required minimum five academic/industry sources in APA 7.
- The brief says **video-only, no written report**, but also contains a generic Turnitin similarity-score instruction. Follow the actual LMS submission setup and confirm with the subject staff if it is unclear; do not invent a written-report requirement or assume a ZIP/video produces a similarity score.
- Preview or re-download the uploaded items, confirm the required receipt/status, and keep a copy.
