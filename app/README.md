# PhonoTrail Studio

PhonoTrail Studio began as a frontend-only Assessment 1 project and is now a database-backed full-stack application for Assessment 2. It combines the original teacher-facing Wordle and Word Search builders with Prisma/SQLite persistence, Zod validation, and Next.js API routes.

See the root [README.md](../README.md) for full setup, API, and Docker instructions. See [Assessment2_Plan.md](./Assessment2_Plan.md) for the phase-by-phase implementation plan and evidence log, [ASSESSMENT_NOTES.md](./ASSESSMENT_NOTES.md) for the rubric/feedback alignment, and [REFERENCES.md](./REFERENCES.md) for the APA 7 sources and AI acknowledgement.

## Included pages

- Home — teacher workspace and entry points into each workflow
- About — Assessment 2 project overview, student details, and video walkthrough
- Word Search — phoneme puzzle builder with saved-activity workflow and keyboard-accessible play
- Wordle — phoneme Wordle builder with saved-activity workflow, hints, and feedback
- Settings — light/dark theme selection with persistent preference

## How to run

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open http://localhost:3000 to view the site.

## Build verification

```bash
npm run build
```
