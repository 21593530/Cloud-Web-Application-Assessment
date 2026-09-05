# Assessment 2 Implementation Plan: Backend & Database Integration

## Goal
Extend PhonoTrail Studio from a frontend-only Assessment 1 app into a Dockerised, database-backed full-stack application while preserving the existing interface and standalone Wordle/Word Search exports.

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
*   **Theme Preferences (Low Priority):** Only after core work is complete, consider adding a System theme option or reduced motion preference. Do not let this delay core requirements.

### Phase 6 integration timing

The Word Search keyboard work should happen after the activity data shape is stable but before the final frontend-backend checkpoint. That ensures keyboard selection is tested against stored multi-character phoneme data, not only the old hard-coded example. Modularity should begin before API routes become large: extract shared types, repositories, validation, and export builders early, then split page UI as the integration surfaces become clear.

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

## Phase 9: Video Plan (6–8 Minutes)
*   **0:00–0:30:** Face, narration, student ID, project introduction.
*   **0:30–1:15:** Explain backend architecture and Prisma database schema.
*   **1:15–2:00:** Show Docker container running successfully.
*   **2:00–2:30:** Show `/health` returning `200 OK`.
*   **2:30–4:00:** Demonstrate database CRUD (Create, Read, Update, Delete).
*   **4:00–5:15:** Show backend data successfully driving the Wordle activity.
*   **5:15–6:30:** Show backend data driving the Word Search activity.
*   **6:30–7:15:** Show validation/error handling and keyboard accessibility.
*   **7:15–8:00:** Summarise technical decisions and display APA 7 references.

---

## Definition of Done
- [ ] Database schema supports multiple activities and multi-character phonemes.
- [ ] CRUD APIs work with real stored data.
- [ ] `/health` returns `200 OK`.
- [ ] Validation and error handling are fully functional.
- [ ] Wordle and Word Search interfaces load backend data.
- [ ] Standalone HTML exports are generated successfully from saved data.
- [ ] Application runs completely inside a Docker container.
- [ ] Word Search keyboard accessibility is improved.
- [ ] Code is highly modularised.
- [ ] `README.md` and GitHub commit history are updated and professional.
- [ ] `node_modules` is excluded from the final `.zip` file.
- [ ] Video evidence meets all rubric criteria (under 8 minutes).
- [ ] AI acknowledgement and APA 7th ed. references are included.

## Phase-by-phase feasibility conclusion

The plan is feasible as an extension of the current frontend if implemented in the stated order. No redesign or replacement of the Assessment 1 pages is required. The existing Next.js App Router can host the API route handlers, the client pages can consume same-origin JSON APIs, Prisma can persist the activity model, and the existing export concept can remain standalone by receiving stored activity snapshots.

The highest-risk areas are:
- Preserving multi-character phoneme tokens through database writes, API responses, React state, matching logic, and generated HTML.
- Preventing database loading states or API failures from breaking the existing previews.
- Keeping SQLite migrations and the Docker volume aligned with the runtime `DATABASE_URL`.
- Completing Word Search keyboard interaction instead of only adding focus styling.
- Avoiding another large page-file implementation by extracting pure logic and reusable UI as each phase is built.

The safest working rule is: finish and verify one phase before making the next phase depend on it. Each checkpoint should use real data and executable checks, while the frontend keeps a visible loading, empty, and error state so partial backend progress remains usable.