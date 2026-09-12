# Assessment 2 Implementation Plan: Backend & Database Integration

## Goal
Extend PhonoTrail Studio from a frontend-only Assessment 1 app into a Dockerised, database-backed full-stack application while preserving the existing interface and standalone Wordle/Word Search exports.

## Course-material alignment check

The plan has been checked against both files in `course-materials/assessment2`:
- `2026-CSE3CWA-(OL-2)_ Assessment 2_ Details and instructions _ My LMS subjects.pdf`
- `Assessment 2 Marking criteria and rubric CSE3CWA (1).docx`

The following are mandatory and are represented in the plan: continuation from the Next.js starter project, backend/server-side logic, database schema and ORM, multi-character phoneme storage, multiple activity configurations, CRUD operations, validation and error handling, downloadable Wordle and Word Search outputs from stored data, Docker execution, `/health` returning 200 OK, video evidence of CRUD/frontend/backend/Docker behaviour, code upload, GitHub link, removal of `node_modules` from the zip, AI acknowledgement, and at least five APA 7th-style sources.

The following are implementation choices rather than explicit mandated technologies: SQLite, Prisma, Zod, same-origin Next.js route handlers, named Docker volumes, a three-table relational shape, Postman/Thunder Client, and the exact endpoint paths. They are retained because they fit the existing app and rubric, but the final submission should explain them as justified design decisions.

The Assessment 2 documents require a video walkthrough but do not state a 6-8 minute duration in the extracted brief or rubric. The 6-8 minute target below is retained as practical guidance from the Assessment 1 feedback; confirm any final time limit in the LMS before recording.

## Recommended Architecture
*   **Frontend/Backend:** Next.js App Router
*   **API:** Next.js route handlers under `src/app/api`
*   **Database:** SQLite (optimal for simple local and Docker deployment)
*   **ORM:** Prisma
*   **Validation:** Zod
*   **Persistence:** SQLite database mounted through a Docker volume
*   **Export:** Keep standalone HTML generation, but feed it database-loaded activity data
*   **Shared Code:** Separate types, validation, database access, and export generators from page components

---

## Phase 1: Foundation
*   **Update dependencies:** Install `prisma`, `@prisma/client`, and `zod`.
*   **Add environment configuration:** Set up `DATABASE_URL`.
*   **Configure Prisma:** Add the Prisma CLI configuration and migration workflow; define the models in Phase 2.
*   *Checkpoint:* Dependencies, environment configuration, and Prisma tooling are installed and configured without changing the visible frontend.

## Phase 2: Database Design
Implement three main models to support multiple activities and multi-character phonemes:

1.  **Activity**
    *   ID, activity type, title, clue, difficulty, grid/guess settings, timestamps.
2.  **Word**
    *   ID, activity ID, English/display word, ordering, timestamps.
3.  **Phoneme**
    *   ID, word ID, complete phoneme symbol, position/order. *(Crucial: phonemes can contain multiple characters and must not be stored as individual letters).*

Add seed data after the schema exists:
*   One Wordle activity.
*   One Word Search activity.
*   Multi-character phonemes such as `tʃ`, `dʒ`, and `iː`.

*   *Checkpoint:* Migration creates the schema, seed data is inserted, and a direct Prisma smoke check can retrieve one complete activity with its ordered words and phonemes. CRUD is verified later through the API phase.

## Phase 3: Validation Contract
Define the request and response contract before implementing route handlers:
*   Create shared TypeScript domain types for activities, words, phonemes, and settings.
*   Define Zod schemas for activity creation, updates, IDs, difficulty, grid dimensions, guess limits, words, and ordered multi-character phonemes.
*   Define a consistent success/error response shape and map validation failures to `400` responses.
*   *Checkpoint:* Representative valid and invalid payloads pass or fail predictably without touching the database.

## Phase 4: Backend API
Implement the following routes under `src/app/api`:
*   `GET /health` (Must return `200 OK`)
*   `GET /api/activities`
*   `POST /api/activities`
*   `GET /api/activities/[id]`
*   `PATCH /api/activities/[id]`
*   `DELETE /api/activities/[id]`

*Requirements:* Use nested activity data so the frontend retrieves everything in one request. Ensure consistent JSON responses, correct HTTP status codes, transactions for nested writes, safe database error handling, and clear validation errors.
*   *Checkpoint:* Demonstrate full CRUD using real requests via Postman/Thunder Client.

Expected API behaviour:
*   `400` for invalid input, `404` for missing records, and `500` for unexpected server failures.
*   No partial nested writes when validation or a transaction fails.
*   Deletes remove related words and phonemes without orphaned records.

## Phase 5: Frontend Integration
Add a saved-activity workflow to the existing Assessment 1 pages:
*   Load activities from the API.
*   Allow the teacher to select an existing activity and display its stored settings.
*   Allow editing and saving updates through the API.
*   Allow deleting activities or words.
*   Generate the preview from retrieved backend data.
*   Export Wordle and Word Search HTML from the saved data.
*   *Checkpoint:* Changing database data dynamically updates the frontend preview and exported HTML file.

### Frontend compatibility review

The overall architecture should work well with the existing frontend because the current pages are already client components and the proposed APIs are same-origin Next.js route handlers. The migration should be incremental: keep the current local/default state as a temporary fallback, introduce the API contract and saved-activity loading, then remove fallback behaviour only after the database workflow is proven.

The integration boundaries are:
- Server route handlers and Prisma own persistence and database errors.
- Shared validation and domain types define the contract used by both routes and client forms.
- Client pages fetch saved activity records and translate them into the existing Wordle and Word Search preview state.
- Export builders remain pure functions that accept a complete activity snapshot and return a standalone HTML string.
- UI components own loading, saving, deleting, validation feedback, and accessible status announcements.

### Important existing frontend risk: multi-character Word Search phonemes

The current Word Search implementation compares words by joining phoneme tokens into one string and, for reverse matching, reversing that string. That is unsafe for phonemes such as `tʃ`, `dʒ`, `iː`, and `æɪ` because reversing characters can split or reorder a single phoneme token. The Assessment 2 implementation must fix this before backend integration is considered complete:
- Compare arrays of phoneme tokens rather than concatenated strings.
- Compare the selected token array with the stored word token array and its token-level reverse.
- Apply the same token-level comparison in the exported standalone Word Search HTML.
- Add a regression check using multi-character phonemes in both forward and reverse paths.

### Recommended implementation order for the frontend

1. Define the API response shape and shared activity types without changing the visible UI.
2. Extract pure phoneme matching, hint, and export functions from the large page files.
3. Add API loading to Wordle and Word Search behind explicit loading/error states.
4. Add saved-activity selection and prove read-only retrieval first.
5. Add create and update forms using the same validation contract as the API.
6. Add delete actions with confirmation and accessible result messages.
7. Switch export actions to the retrieved activity snapshot.
8. Remove or clearly limit hard-coded fallback data after seeded database data is working.

This order keeps the current Assessment 1 preview usable throughout the migration and makes each step independently testable.

## Phase 6: Improve Assessment 1 Weaknesses
*   **Word Search Accessibility:** Add keyboard-focusable cells, Enter/Space selection, visible focus styles, accessible status messages, and keyboard-accessible clear/check controls.
*   **Modularity:** Extract shared domain types, API client helpers, validation schemas, database repository functions, export builders, phoneme hint utilities, and saved-activity controls.
*   **Home Page UI refresh:** Rework the Home page so it feels like a deliberate teacher workspace rather than a basic collection of panels. Improve hierarchy, spacing, first-viewport usefulness, activity entry points, visual balance, and responsive behaviour while preserving the existing brand and navigation.
*   **Theme Preferences (Low Priority):** Only after core work is complete, consider adding a System theme option or reduced motion preference. Do not let this delay core requirements.

### Phase 6 integration timing

The Word Search keyboard work should happen after the activity data shape is stable but before the final frontend-backend checkpoint. That ensures keyboard selection is tested against stored multi-character phoneme data, not only the old hard-coded example. Modularity should begin before API routes become large: extract shared types, repositories, validation, and export builders early, then split page UI as the integration surfaces become clear.

The Home page refresh should happen after the saved-activity API is available, so its primary actions can point to real workflows such as creating a new activity, opening a saved activity, and continuing recent work. Keep this as a focused UI improvement rather than a separate product redesign. Verify it at desktop and mobile widths, and preserve clear keyboard focus and accessible link/button labels.

## Phase 7: Dockerization

> **⚠️ CRITICAL WATCH-OUT: SQLite & Docker Volumes**
> Because we are using SQLite, the database is stored as a local file inside the container. When running in Docker, you **must** configure a Docker volume in your deployment setup to map the database file to your host machine. If you skip volume mapping, your database (and all saved activities) will be completely wiped clean every time the Docker container stops or restarts!

*   Add `Dockerfile` and `.dockerignore`.
*   Set `DATABASE_URL="file:/data/phonotrail.db"` for the container runtime and ensure the Prisma schema uses the same SQLite file location.
*   Use a named volume mounted at `/data`, so the SQLite database survives container replacement:
    ```bash
    docker volume create phonotrail-data
    docker run --rm -p 3000:3000 -v phonotrail-data:/data -e DATABASE_URL=file:/data/phonotrail.db phonotrail
    ```
*   Run the production migration as part of the release/startup procedure before the app serves traffic. Seed data should be an explicit setup command, not run on every container restart, so it cannot overwrite teacher data.
*   Document that a named volume preserves the database file, but it is not a backup strategy. Keep a backup/export procedure for the final demonstration and submission evidence.
*   Keep the SQLite choice scoped to this assessment. If later deployment requires multiple application instances or higher concurrent writes, migrate to a server database such as PostgreSQL rather than sharing a SQLite file between containers.
*   Verify locally:
    ```bash
    docker build -t phonotrail .
    docker volume create phonotrail-data
    docker run --rm -p 3000:3000 -v phonotrail-data:/data -e DATABASE_URL=file:/data/phonotrail.db phonotrail
    ```
*   *Checkpoint:* The application loads in Docker, `/health` returns `200 OK`, CRUD operations work, and HTML exports download correctly.

## Phase 8: Documentation & GitHub
Update the `README.md` with:
*   Local installation & environment variables.
*   Prisma migration & seed commands.
*   API endpoint list & Docker commands.
*   Verification steps & known design decisions.
*   *Commit Strategy:* Use focused commits (e.g., "Add Prisma database schema", "Integrate saved activities into Wordle").

## Phase 9: Video Plan (target 6–8 minutes; confirm the Assessment 2 LMS limit)

**Submission format:** This is a separate technical walkthrough video for the marker, submitted directly to the LMS alongside the project `.zip` (without `node_modules`) and the GitHub repository link — the same submission pattern as Assessment 1. It is **not** embedded in the app. The About page keeps its original Assessment 1 wording and its original short tutorial video embed (`phonotrailaboutvideo.mp4`), because the Assessment 2 brief requires the existing frontend to "remain in place." The new technical video only needs to exist as an uploaded/linked file for the marker.

### Exact steps for each segment

*   **0:00–0:30 — Intro:** Face on camera, state student number, say the project name and "Assessment 2, backend and database integration."

*   **0:30–1:15 — Architecture:** Open `prisma/schema.prisma` in the editor. Point at the three models (`Activity`, `Word`, `Phoneme`) and read out one phoneme symbol such as `tʃ` while saying "this is stored as one complete token, not split into individual characters, so multi-character phonemes survive intact."

*   **1:15–2:00 — Docker:** In a terminal, run `docker build -t phonotrail .` then `docker run --rm -p 3000:3000 -v phonotrail-data:/data -e DATABASE_URL=file:/data/phonotrail.db phonotrail`. Wait for the "Applying database migrations..." and "Starting PhonoTrail Studio..." log lines, then say "the container is now running the production build with a persisted volume."

*   **2:00–2:30 — `/health`:** With the container (or `npm run dev`) running, open a new browser tab to `http://localhost:3000/api/health`. Open DevTools → Network tab first, reload the page, click the `health` request, and point at the **Status: 200** and the response body `{"data":{"status":"ok"}}`. Say out loud: "the health endpoint returns HTTP 200 with a status ok payload."

*   **2:30–4:00 — CRUD, shown through the Network tab so the HTTP verbs and status codes are visible:**
    1. **Create:** Open DevTools → Network, filter by "Fetch/XHR". Go to `/word-search`, fill in a new word list, click **Save Activity**. Click the resulting network request and show method `POST /api/activities`, status `201`, and the JSON body containing the new `id`.
    2. **Read:** Reload the page. Show the `GET /api/activities` request firing on load, status `200`, and the saved activity appearing in the "Saved activity" dropdown.
    3. **Update:** Select the saved activity, change a word or the grid size, click **Save Activity** again. Show the `PATCH /api/activities/[id]` request and its `200` response with the updated fields.
    4. **Delete:** Click **Delete Saved Activity**. Show the `DELETE /api/activities/[id]` request and its `204 No Content` response, then show the dropdown no longer lists it.
    5. **Validation error (optional but strong evidence):** Try saving with an empty word list or clear a required field, show the resulting `400` response and the on-page error message.

*   **4:00–5:15 — Wordle from saved data:** Open `/wordle`, select a saved activity from the dropdown, show the builder repopulating with the stored phonemes/clue/difficulty, then play a guess in the live preview to show it is driven by that loaded record.

*   **5:15–6:30 — Word Search from saved data:** Open `/word-search`, select a saved activity, show the grid regenerating from stored tokens, demonstrate keyboard selection (Tab to a cell, Enter/Space to select, Tab through the path, Enter to check), then click **Export HTML** and open the downloaded file to show it works standalone.

*   **6:30–7:15 — Validation/error handling and accessibility recap:** Briefly show one more `400`/`404` example (e.g. request a non-existent activity id) and narrate the Word Search keyboard workflow you just demonstrated, naming the specific technique (Enter/Space activation, visible focus ring, `aria-pressed`, live status text).

*   **7:15–8:00 — Close:** Summarise the technical decisions (SQLite + Prisma, Zod validation, Docker volume for persistence) and state that APA 7 references and the AI acknowledgement are included in `REFERENCES.md`.

---

## Definition of Done
- [x] Database schema supports multiple activities and multi-character phonemes.
- [x] CRUD APIs work with real stored data.
- [x] `/health` returns `200 OK`.
- [x] Validation and error handling are fully functional.
- [x] Wordle and Word Search interfaces load backend data.
- [x] Standalone HTML exports are generated successfully from saved data.
- [ ] Application runs completely inside a Docker container. *(Docker build/run verified in the Dockerfile design; runtime execution has not been confirmed on this machine because the Docker CLI is not installed here. Verify on a Docker-enabled machine before recording the video.)*
- [x] Word Search keyboard accessibility is improved.
- [x] Code is highly modularised.
- [x] `README.md` and GitHub commit history are updated and professional.
- [ ] `node_modules` is excluded from the final `.zip` file. *(Confirm at packaging time; already excluded from git via `.gitignore`.)*
- [ ] Video evidence meets all rubric criteria (under 8 minutes).
- [x] AI acknowledgement and APA 7th ed. references are included (`REFERENCES.md`).

## Video progress log

Keep this section updated as implementation phases are completed. It is intended to become the evidence outline for the final 6-8 minute walkthrough.

### Completed so far
- Phase 1 foundation started: Prisma CLI/client and Zod installed; database scripts added; `.env.example` added; real environment files remain ignored.
- Prisma versions aligned to stable `6.16.3` for both `prisma` and `@prisma/client` after correcting an initial CLI/client mismatch and avoiding the newer config/adapter workflow before it is needed.
- Phase 2 schema created with `Activity`, `Word`, and `Phoneme` models.
- Multi-character phonemes are stored as complete strings with explicit ordering, including seed examples such as `tʃ`, `dʒ`, `ʉː`, and `iː`.
- Seed script created for one Wordle activity and one Word Search activity.
- Initial SQLite migration applied successfully and Prisma schema validation passed.
- Seed rerun was verified as non-destructive when activities already exist.
- Frontend production build still passes after adding the database layer.
- Phase 3 validation contract created with shared activity types, Zod schemas, and consistent API response helpers.
- Validation smoke check verified a valid multi-character Wordle payload is accepted while invalid Wordle and blank-phoneme payloads are rejected.
- Phase 4 API routes implemented for `/api/health` and activity list/create/read/update/delete operations.
- Real HTTP smoke test verified health `200`, seeded activity retrieval, nested create/read/update, delete `204`, invalid payload `400`, invalid ID `400`, and missing valid ID `404`.
- Node UTF-8 response check confirmed API phoneme symbols such as `tʃ` and `ɪ` survive the database-to-JSON response intact.
- Phase 5 integration started and completed for both builders: Wordle and Word Search load saved activities from the API and can save/update stored activity data.
- Word Search also supports deleting a selected saved activity, while both builders show loading/save/error status messages.
- Saved Word Search records regenerate the local board from stored ordered phoneme tokens and grid settings; the standalone export workflow remains available.
- Phase 5 TypeScript and production build checks passed after fixing the persisted word-position mapping.
- Phase 6 accessibility work started: Word Search cells now support Enter/Space selection, visible keyboard focus, row/column labels, `aria-pressed`, and live status feedback.
- Word Search matching now compares ordered phoneme token arrays rather than reversing characters, including in the standalone export.
- Multi-character phoneme regression check passed for forward, reverse, and split-token cases.

### Video evidence still required
- [ ] Show the schema and explain why phonemes are ordered string records rather than characters.
- [ ] Show migration and seed execution.
- [ ] Show real CRUD requests and responses.
- [ ] Show frontend data loading from the database.
- [ ] Show Wordle and Word Search generation from saved records.
- [ ] Show validation/error handling, Docker, `/health`, keyboard accessibility, and final exports.

### Critical fix applied during final review (12 Sep 2026)
A missing `app/.env` file meant the locally running dev server had no `DATABASE_URL` at all, so every `/api/activities` request returned `500 Internal Server Error` and both builder pages showed "Activities could not be loaded." This was invisible in prior `npm run build`/`prisma migrate deploy` checks because those commands had `DATABASE_URL` set manually in the terminal session, not through a persisted `.env` file. Fixed by creating `app/.env` (gitignored) with `DATABASE_URL="file:./prisma/dev.db"` and restarting the dev server; confirmed working via a real browser session showing "1 saved Wordle activity." **Before recording the video, confirm `.env` exists locally (copy from `.env.example`) and the dev/production server is started fresh after any `.env` change.**

Also corrected stale Assessment 1 branding still visible across the running site: the page `<title>`, the site footer, and the About page all referenced "Assessment 1 — Frontend Design and Usability" instead of Assessment 2. These are now updated.

### About page reverted (12 Sep 2026)
The About page was reverted back to its original Assessment 1 wording and its original embedded tutorial video, per the brief's requirement that the existing frontend "must remain in place." The Assessment 2 technical walkthrough (schema, CRUD, Docker, `/health`, keyboard accessibility) is a separate video submitted directly to the LMS for the marker, not embedded in the app. The site header badge and footer still read "Assessment 2" as persistent site chrome; only the About page body text and its video were reverted.

### Docker status (12 Sep 2026)
Docker CLI is still not installed on this machine. An attempt to check WSL availability inadvertently triggered the Windows "install WSL" prompt, which enabled the `VirtualMachinePlatform` Windows feature (a system-level change requiring a reboot to take effect). No Linux distribution or Docker Engine was installed. Installing Docker Desktop/Engine was intentionally not pursued further without explicit user confirmation, since it requires a reboot and administrator involvement. The Dockerfile, `.dockerignore`, and entrypoint script are implemented and reviewed, but runtime container verification remains outstanding until Docker is available (post-reboot, on this machine or another Docker-enabled machine).

## Phase-by-phase feasibility conclusion

The plan is feasible as an extension of the current frontend if implemented in the stated order. No redesign or replacement of the Assessment 1 pages is required. The existing Next.js App Router can host the API route handlers, the client pages can consume same-origin JSON APIs, Prisma can persist the activity model, and the existing export concept can remain standalone by receiving stored activity snapshots.

The highest-risk areas are:
- Preserving multi-character phoneme tokens through database writes, API responses, React state, matching logic, and generated HTML.
- Preventing database loading states or API failures from breaking the existing previews.
- Keeping SQLite migrations and the Docker volume aligned with the runtime `DATABASE_URL`.
- Completing Word Search keyboard interaction instead of only adding focus styling.
- Avoiding another large page-file implementation by extracting pure logic and reusable UI as each phase is built.

The safest working rule is: finish and verify one phase before making the next phase depend on it. Each checkpoint should use real data and executable checks, while the frontend keeps a visible loading, empty, and error state so partial backend progress remains usable.

## Assessment 1 feedback closure: negative points addressed in Assessment 2

The Assessment 1 feedback identified several valid weaknesses. These are explicitly addressed in the Assessment 2 plan and implementation sequence to avoid repeating the same issues in the final submission.

### 1) Theme preferences were too limited
The original implementation satisfied the core light/dark requirement but was weaker than stronger cohort examples because it lacked a System/Browser theme option and did not use a shared theme provider pattern. Phase 6 explicitly treats theme preferences as a low-priority enhancement rather than a blocking requirement. The final implementation keeps the persisted theme flow, but the plan does not allow theme polish to delay the database/API/core submission work. If a System theme or additional accessibility preference is added, it is treated as a bonus improvement rather than a prerequisite.

### 2) Word Search keyboard accessibility was incomplete
The feedback correctly noted that the original Word Search relied too heavily on pointer-based selection rather than fully accessible keyboard interaction. This is directly targeted in Phase 6: keyboard-focusable cells, Enter/Space activation, visible focus styles, `aria-pressed`, row/column labels, accessible status messaging, and keyboard-friendly clear/check controls are all explicitly required. This is not an optional polish item; it is a stated requirement before final validation.

### 3) Code modularity was weaker than claimed
The earlier app was too monolithic, especially in the large Wordle and Word Search page files. Phase 6 specifically addresses this through modularisation: shared domain types, validation schemas, API client logic, database repository functions, export builders, phoneme hint utilities, and saved-activity controls are separated from page-level UI logic. The code structure is intentionally designed so the app is easier to maintain, test, and explain in the final video and written justification.

### 4) Presentation and final evidence need to be tighter
The earlier assessment video was substantially too long and the presentation was broader than it needed to be. Phase 9 reduces this to a controlled 6-8 minute evidence plan with explicit timeboxes, and the final walkthrough focuses on database schema, CRUD, `/health`, frontend loading from saved records, Wordle/Word Search generation, validation, keyboard accessibility, and Docker behaviour. This is a measured, rubric-aligned evidence structure rather than a general product demo.

### 5) Final submission quality and documented rationale
The assessment plan now includes a stronger final documentation and GitHub handover pathway: `README.md` updates, transparent design decisions, commit strategy, and a final submission checklist. The project is no longer framed as a simple visual build; it is positioned as a full-stack assessment with clear technical choices, validation evidence, and accessible teacher flows.

In short, the negative points from Assessment 1 are no longer just acknowledged—they are directly converted into concrete Phase 6, Phase 7, and Phase 9 requirements, with explicit verification checkpoints and final evidence expectations.

## Assessment 1 Feedback

### Frontend structure, pages and overall interface design
All required pages are implemented as proper Next.js App Router routes: Home, About, Wordle, Word Search and Settings. The application has a consistent global header/footer, full desktop navigation and an appropriate hamburger menu on smaller screens. The About page includes student details and the required locally embedded walkthrough video (phonotrailaboutvideo.mp4). Both activities follow a clear builder → live preview → export workflow, and the interface is cohesive and professional.

### Themes and persistent preferences Maximum score
Light and Dark themes are implemented and correctly persisted for one year using cookies. The root layout reads the cookie server-side, allowing the saved theme to be applied immediately rather than only after client hydration. However, there is no System/Browser theme option, no additional persistent layout/accessibility preference, and no shared ThemeContext/provider. This is a solid implementation of the basic requirement but less complete than the stronger preference systems in the cohort.

### Wordle and Word Search activity behaviour and HTML output generation Maximum score
Both activities genuinely satisfy the teacher-builder requirement. Wordle allows the teacher to construct an arbitrary phoneme target using the phoneme keyboard, enter the English equivalent and clue, and configure Easy/Normal/Hard difficulty through the number of guesses. The preview implements proper duplicate-aware correct/present/absent scoring and English-equivalence completion feedback. Word Search allows teachers to edit the phoneme word list directly, add/remove content and configure rows/columns from 6–12. Puzzle generation supports horizontal, vertical and diagonal directions including reverse placement. Both exports are self-contained HTML with embedded CSS, JavaScript and activity data, and the student demonstrates the downloaded versions operating independently.

### Usability, accessibility and responsive design Maximum score
Good usability work is evident: responsive navigation, labelled form controls, phoneme-to-English mouse-over hints, descriptive ARIA labels, semantic buttons, visible hover/focus states and mobile-responsive builder layouts. The teacher preview closely represents the exported student activity, which supports a predictable workflow. However, Word Search remains substantially based on pointer/cell selection rather than demonstrating the same level of complete keyboard accessibility as the strongest submissions. The presentation also discusses accessibility more generally than technically, so I would stop short of 3.5–4.

### Code quality, modularity, GitHub and written justification Maximum score
The project is correctly based on Next.js/create-next-app and has a customised README, assessment notes and GitHub repository link. The 11:11 presentation gives meaningful justification of the educator-facing layout, teacher workflow, phoneme hints, standalone HTML trade-off, cookie choice and responsive design. In particular, the student explicitly identifies the trade-off of duplicated inline CSS/JavaScript increasing exported file size in exchange for a genuinely portable single HTML file. The video also shows GitHub commits and discusses iterative development. Code modularity is also weaker than the student suggests: beyond SiteHeader and SectionCard, the Wordle and Word Search pages are very large files containing builder UI, preview gameplay, puzzle logic and complete standalone HTML templates. The presentation is also substantially over the required 6–8 minutes.