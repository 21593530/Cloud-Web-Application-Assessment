# Assessment Notes

## Assessment 1 baseline

PhonoTrail Studio is a Next.js application for a Speech Pathology teacher and student audience. Assessment 1 established the frontend-only experience for phoneme-based Wordle and Word Search activities.

### Existing Assessment 1 requirements
- Teacher-facing toolkit for phoneme-based classroom activities.
- Responsive, readable, accessible frontend design.
- Wordle and Word Search interactive previews.
- Downloadable standalone HTML output for both activities.
- Phoneme hints using visible hover affordances and accessible labels.
- Light/dark theme selection persisted with the `cwa-theme` cookie.
- Pages: Home, About, Wordle, Word Search, and Settings.

### Existing implementation audit
- Next.js App Router frontend is in `app/src/app`.
- Reusable components currently include `SiteHeader` and `SectionCard` under `app/src/components`.
- Wordle and Word Search currently keep activity data in React state and generate HTML client-side from template strings.
- No backend route handlers, database, ORM, Dockerfile, Docker Compose file, API client layer, or automated tests currently exist.
- `package.json` currently contains only Next.js, React, TypeScript, Tailwind/PostCSS, and ESLint dependencies.
- `.gitignore` already excludes `node_modules`, `.next`, build output, coverage, and environment files.
- The current README still describes the project as Assessment 1 frontend-only and will need an Assessment 2 update.

### Assessment 1 assessor feedback

The submitted feedback identified three rubric areas that did not receive full marks. These are important Assessment 2 improvement targets because Assessment 2 extends the same application and also assesses technical justification, modularity, reliability, and evidence of implementation.

#### Themes and persistent preferences - 2.5/4

Assessor feedback:
- Light and Dark themes were implemented and correctly persisted for one year using cookies.
- The root layout read the cookie server-side, allowing the saved theme to be applied immediately rather than only after client hydration.
- The implementation did not include a System/Browser theme option.
- There was no additional persistent accessibility preference.
- There was no shared `ThemeContext` or `ThemeProvider`.
- The assessor considered the basic requirement solid, but less complete than stronger preference systems in the cohort.

Assessment 2 response:
- Preserve the existing cookie-backed theme behaviour while adding a central theme/preferences abstraction if the implementation grows.
- Consider supporting `system` as a third theme mode using `prefers-color-scheme`, while retaining explicit Light and Dark choices.
- Consider one meaningful persisted accessibility preference, such as reduced motion, larger text, or high contrast, only if it can be implemented cleanly and demonstrated.
- Explain the trade-off in the video: cookies provide persistence without localStorage, while a shared provider/context can prevent page-level theme logic from being duplicated.
- Avoid adding preference features that distract from the mandatory backend, database, CRUD, and Docker requirements.

#### Usability, accessibility and responsive design - 3/4

Assessor feedback:
- Strengths included responsive navigation, labelled form controls, phoneme-to-English mouse-over hints, descriptive ARIA labels, semantic buttons, visible hover/focus states, and mobile-responsive builder layouts.
- The teacher preview closely represented the exported student activity, supporting a predictable workflow.
- Word Search remained substantially based on pointer/cell selection rather than demonstrating the same level of complete keyboard accessibility as the rest of the system.
- The presentation discussed accessibility generally rather than technically, so the assessor would stop short of the 3.5-4 range.

Assessment 2 response:
- Make Word Search keyboard-complete: support tabbing to cells, keyboard selection of a path, Enter/Space activation, visible focus, and a clear keyboard workflow for checking or clearing a selection.
- Ensure saved activity loading, CRUD controls, validation messages, and export buttons have labels, focus states, and status announcements.
- Keep `title`, `aria-label`, `aria-live`, semantic buttons, and visible focus styling, but explain their technical purpose in the video rather than only describing accessibility broadly.
- Test the complete Word Search workflow without a mouse and record it as evidence for the video.
- Keep the teacher preview and exported activity behaviour aligned after backend integration.

#### Code quality, modularity, GitHub and written justification - 2.5/4

Assessor feedback:
- The project correctly used a `create-next-app` foundation and included a customised README, assessment notes, and GitHub repository link.
- The video gave meaningful justification for the educator-facing layout, teacher workflow, phoneme hints, standalone HTML trade-off, cookie choice, and responsive design.
- The student explicitly identified the trade-off of duplicated inline CSS/JavaScript in exchange for a genuinely portable single HTML file.
- The video showed GitHub commits and discussed iterative development.
- Modularity was weaker than suggested: beyond `SiteHeader` and `SectionCard`, the Wordle and Word Search pages remained very large files containing builder UI, preview gameplay, logic, and complete standalone HTML templates.
- The presentation was substantially over the required 6-8 minutes.

Assessment 2 response:
- Extract shared server/domain types, validation schemas, API response/error helpers, database access, and activity generation logic into focused modules.
- Split the large Wordle and Word Search pages into reusable builder controls, preview components, saved-activity controls, export helpers, and shared phoneme UI components where useful.
- Keep export generation separate from page components so the backend-driven data flow and standalone HTML templates can be tested independently.
- Maintain a professional GitHub history with focused commits that show schema, API, integration, Docker, and documentation progress.
- Update the README with exact setup, migration/seed, API, Docker, and verification commands.
- Plan the Assessment 2 video to stay within the required 6-8 minutes and use a timed evidence sequence rather than over-explaining every implementation detail.

#### Assessment 1 improvement priorities carried into Assessment 2

1. Complete keyboard accessibility for Word Search and explain the implementation using concrete HTML and interaction details.
2. Improve modularity by separating domain logic, validation, API/database access, UI components, and standalone export generation.
3. Add only proportionate preference improvements, such as a System theme or one accessibility preference, after the mandatory backend work is stable.
4. Keep the technical walkthrough concise and time-boxed to 6-8 minutes.

## Assessment 2 source summary

Source files reviewed:
- `course-materials/assessment2/2026-CSE3CWA-(OL-2)_ Assessment 2_ Details and instructions _ My LMS subjects.pdf`
- `course-materials/assessment2/Assessment 2 Marking criteria and rubric CSE3CWA (1).docx`

### Administrative requirements
- Title: Assessment 2 Backend implementation and database integration.
- Due: 11:59 pm, Sunday 13 September 2026.
- Weighting: 25%.
- Length: 1,100 words equivalent.
- Individual assessment.
- Generative AI use: Full AI is permitted, subject to the required AI acknowledgement.
- Submission: video-only assessment plus uploaded project code, GitHub repository link, and any required supporting documentation.
- Remove `node_modules` before creating the project zip.
- Include a minimum of five academic or industry sources in APA 7th style.

### Purpose and continuity
Assessment 2 continues directly from Assessment 1. The frontend must remain in place, but temporary frontend values must become database-backed values. Teachers must be able to create and manage phoneme-based word content, save activity settings, retrieve stored data, and generate Wordle and Word Search HTML from that stored data. The application must run inside Docker.

## Mandatory Assessment 2 capabilities

### 1. Next.js foundation
- Continue from a project created with `npx create-next-app .`.
- Keep the existing Next.js App Router structure and extend it with server-side route handlers and persistence.

### 2. Backend/API
- Add server-side logic that supports the Assessment 1 frontend.
- Expose APIs or Next.js route handlers for activity data.
- Add `GET /health` returning HTTP `200 OK`; the response should be simple and demonstrably healthy, for example `{ "status": "ok" }`.
- Return consistent JSON response shapes and appropriate HTTP status codes.

### 3. Database schema and phoneme model
The schema must support:
- Multiple saved activity configurations.
- Activity type: Wordle or Word Search.
- Activity title or name.
- Difficulty level and guess/grid settings.
- Teacher clue or hint.
- English word metadata where needed.
- Ordered phoneme tokens for each word.
- Multi-character phonemes such as `tʃ`, `dʒ`, `iː`, and `æɪ`; never model a phoneme as a single character.
- Multiple words in a Word Search configuration.
- Generated output settings and other metadata needed to recreate an activity.
- Created and updated timestamps.

Recommended relational shape:
- `Activity`: id, type, title, difficulty, clue, settings JSON or normalised settings, createdAt, updatedAt.
- `Word`: id, activityId, display/English word, order, createdAt, updatedAt.
- `Phoneme`: id, wordId, symbol, position.

Use Prisma or another suitable ORM. SQLite is a practical local/Docker option for this assessment; the database path must be configured through an environment variable and persisted appropriately when the container runs.

### 4. CRUD
Teachers must be able to demonstrate create, read, update, and delete operations for words or activity settings. At minimum, implement and document endpoints equivalent to:
- `GET /api/activities` - list saved activities.
- `POST /api/activities` - create an activity and its words/phonemes.
- `GET /api/activities/:id` - retrieve one complete activity.
- `PATCH /api/activities/:id` - update activity settings and/or word content.
- `DELETE /api/activities/:id` - delete an activity and its related data.
- `GET /api/words` or nested word endpoints if individual word CRUD is demonstrated separately.
- `POST/PATCH/DELETE` word operations if the video demonstrates word-level CRUD.

Use transactions for nested activity/word/phoneme writes where appropriate, and ensure deletes do not leave orphaned records.

### 5. Activity generation and integration
- Replace the current single temporary frontend examples with data loaded from the backend.
- Allow the user to choose a saved activity/configuration and load its words, phonemes, hints, difficulty, and settings.
- Generate both downloadable Wordle and Word Search HTML outputs from retrieved database data.
- Keep the standalone export requirement: generated files must still embed their own CSS and JavaScript and must not depend on the Next.js server after download.
- Make the data flow visible in the video: create/save data, retrieve it, edit it, then generate output from the updated record.

### 6. Validation and error handling
Validate before database writes:
- Required activity type and title.
- Supported activity type values only.
- Non-empty word lists where required.
- Non-empty phoneme tokens.
- Preserve each phoneme token as a complete string, including multi-character symbols.
- Valid difficulty and numeric settings within defined limits.
- Valid IDs and route parameters.
- Word Search grid dimensions and Wordle guess limits.

Handle and demonstrate:
- Missing request bodies or fields: `400 Bad Request`.
- Malformed phoneme data: clear validation error, no partial write.
- Unknown records: `404 Not Found`.
- Database/server failures: `500` response with a safe user-facing message and server-side logging.
- Duplicate or invalid values according to the chosen schema constraints.

Use a shared validation layer and shared API error response format rather than duplicating ad hoc checks in each route.

### 7. Docker
- Add a Dockerfile following the lab pattern and use a reproducible Node/Next.js production build.
- Install dependencies with the lockfile, build the app, and run the production server.
- Configure the database location and runtime settings through environment variables.
- Ensure the container exposes the application port and that `/health` works from inside the running container.
- Add `.dockerignore` to exclude `node_modules`, `.next`, local databases if appropriate, and other unnecessary files.
- Test the actual workflow: build image, run container, call `/health`, open the app, perform CRUD, and generate an activity.
- A Compose file is optional unless needed for a separate database service; do not add unnecessary infrastructure.

### 8. Video walkthrough evidence
The video must:
- Show the student ID within the first 30 seconds.
- Show the student’s face and include narration throughout.
- Explain the backend architecture and how the database supports the builder.
- Demonstrate creating data.
- Demonstrate saving data.
- Demonstrate reading/retrieving data.
- Demonstrate editing data.
- Demonstrate deleting words or activity settings.
- Show the frontend using backend data to generate Wordle output.
- Show the frontend using backend data to generate Word Search output.
- Demonstrate `GET /health` returning `200 OK`.
- Demonstrate the application running inside Docker.

Recommended order: student ID and introduction, Docker/container startup, `/health`, database/API overview, create/read/update/delete workflow, Wordle generation, Word Search generation, brief closing explanation.

### 9. Code quality and GitHub practice
- Keep server, database, validation, and UI responsibilities modular.
- Use readable TypeScript types and consistent response/error conventions.
- Update README with setup, environment variables, database migration/seed commands, API routes, Docker commands, and test/demo instructions.
- Use meaningful commits and a sensible branch/workflow where possible.
- Do not commit `node_modules`, secrets, local environment files, or unnecessary build output.
- Keep the GitHub repository link available in the submission package.

## Rubric weighting and A-grade targets

The rubric totals 25% across five areas:

| Area | Weight | A-grade evidence |
|---|---:|---|
| Database schema and phoneme data model | 7% | Clear ORM schema, multi-character phonemes, activity settings, and multiple configurations. |
| CRUD APIs and healthcheck | 6% | Reliable create/read/update/delete APIs, strong validation/error handling, and `/health` returning 200. |
| Dockerize | 4% | Reproducible Docker build and successful runtime following the lab pattern. |
| Activity generation and frontend-backend integration | 4% | Stored database data drives both downloadable activity types and settings workflow. |
| Code quality and GitHub practice | 4% | Organised repository, good commits/branches, current README, no `node_modules`, readable maintainable code. |

## Assessment 2 implementation checklist

### Foundation
- [ ] Add ORM/database dependencies and configuration.
- [ ] Add Prisma schema/migrations or the selected ORM equivalent.
- [ ] Add seed data for at least one Wordle and one Word Search activity.
- [ ] Add shared domain types for activities, words, phonemes, and settings.

### Backend
- [ ] Add `GET /health` and verify HTTP 200.
- [ ] Add activity list/create/read/update/delete routes.
- [ ] Add word CRUD routes or make nested word CRUD explicit and demonstrable.
- [ ] Add transactions for nested writes and cascading/explicit deletes.
- [ ] Add shared validation and API error handling.

### Frontend integration
- [ ] Replace hard-coded/default-only activity workflow with API loading.
- [ ] Add saved-activity selection/loading UI.
- [ ] Add save/update/delete controls with clear loading and error states.
- [ ] Feed retrieved records into Wordle and Word Search previews.
- [ ] Ensure both export functions use stored/retrieved data.
- [ ] Keep standalone exported files free of external CSS/JS dependencies.

### Docker and documentation
- [ ] Add Dockerfile.
- [ ] Add `.dockerignore`.
- [ ] Configure database persistence and environment variables.
- [ ] Test production build inside Docker.
- [ ] Test `/health` inside Docker.
- [ ] Update README for local, database, API, and Docker setup.
- [ ] Add at least five APA 7 sources and the AI acknowledgement required by the unit.
- [ ] Prepare a video showing every required workflow and evidence point.
- [ ] Create the final zip without `node_modules`.

## Recommended verification sequence

Run these checks as the implementation progresses:
1. Install dependencies and run the database migration/seed.
2. Run the app locally and call `GET /health`.
3. Exercise API create/read/update/delete operations with real requests.
4. Confirm multi-character phonemes survive create, retrieval, editing, and export.
5. Confirm Wordle and Word Search previews load saved records.
6. Confirm downloaded HTML files work without the Next.js app running.
7. Build and run the Docker image.
8. Repeat `/health`, CRUD, and activity generation inside Docker.
9. Run lint/build and record the successful output for the submission/video.

## Assessment 2 source and acknowledgement reminder

The brief asks for a minimum of five academic or industry sources in APA 7th style and an AI acknowledgement when AI tools are used. Candidate source categories include official Next.js documentation, React documentation, Prisma/database documentation, Docker documentation, and relevant accessibility or web engineering standards. The final references must be checked against the unit’s required source expectations before submission.
