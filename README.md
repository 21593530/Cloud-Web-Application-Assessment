# PhonoTrail Studio

PhonoTrail Studio is a Next.js phoneme activity builder for teachers, extended for Assessment 2 as a database-backed full-stack application. It combines teacher-facing Wordle and Word Search builders with Prisma-powered persistence, validated API routes, and classroom-ready HTML export.

## What is included

- Assessment 2 planning and rubric evidence in the app folder
- Course-material references under the course-materials folder
- A prototype and earlier design references in the prototypes folder
- A Next.js App Router application in the app folder featuring:
  - saved activity management through same-origin API routes
  - SQLite + Prisma persistence for activities, words, and phonemes
  - Zod validation and consistent error responses
  - teacher workflow pages for Wordle and Word Search
  - HTML export for classroom distribution
  - keyboard-accessible Word Search interaction

## Project structure

- course-materials/ — assessment brief, rubric, and reference materials
- prototypes/ — earlier prototype work and static examples
- app/ — full application source, Prisma schema, validation, and seed data

## Local setup

```bash
cd app
npm install
cp .env.example .env 2>/dev/null || true
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Then open http://localhost:3000.

## Environment variables

The app expects a SQLite database URL for Prisma.

```bash
DATABASE_URL="file:./prisma/dev.db"
```

For local development, this can be placed in a `.env` file in the app directory.

## Database commands

```bash
cd app
npx prisma migrate dev
npx prisma generate
npm run db:seed
npx prisma studio
```

## Validation checks

```bash
cd app
npm run validate:contract
npm run validate:phonemes
```

## Build and run checks

```bash
cd app
npm run build
npm run start
```

## API endpoints

The application exposes JSON API routes for the saved activity workflow:

- GET /api/health
- GET /api/activities
- POST /api/activities
- GET /api/activities/[id]
- PATCH /api/activities/[id]
- DELETE /api/activities/[id]

These routes return consistent JSON payloads with validation and database errors handled centrally.

## Docker

The project includes a container build and startup flow for SQLite persistence using a Docker volume.

```bash
docker build -t phonotrail .
docker volume create phonotrail-data
docker run --rm -p 3000:3000 -v phonotrail-data:/data -e DATABASE_URL=file:/data/phonotrail.db phonotrail
```

The runtime image uses the Prisma migration step before starting the app and stores the SQLite database in /data so data survives container restarts when the named volume is mounted.

## Design notes

- Multi-character phoneme tokens such as tʃ, dʒ, and iː are stored as ordered strings rather than split into individual characters.
- Word Search matching is token-aware to avoid corrupting phoneme strings during reverse checks.
- The full-stack architecture keeps validation, database access, and export logic separated from UI pages to support reuse and easier maintenance.
- SQLite is appropriate for this Assessment 2 scope, but a server-backed database would be the next step for multi-instance production deployments.

## Final submission notes

Before submitting, remove node_modules from any archive and include the required evidence package: database CRUD walkthrough, validation checks, Docker evidence if available, and the required references and AI acknowledgement statement.
