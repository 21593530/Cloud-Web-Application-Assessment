# PhonoTrail Studio

PhonoTrail Studio began as a frontend-only Assessment 1 project and is now a database-backed full-stack application for Assessment 2. It combines the original teacher-facing Wordle and Word Search builders with Prisma/SQLite persistence, Zod validation, and Next.js API routes.

See the root [README.md](../README.md) for full setup, API, and Docker instructions. See [REFERENCES.md](./REFERENCES.md) for the APA 7 sources and AI acknowledgement.

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
## Run as Docker

# kill old containers
wsl -d Ubuntu -u root -- docker rm -f phonotrail-app

# run the docker
wsl -d Ubuntu -u root -- bash -c "cd /mnt/c/repos/cloud-web-app/app && docker build -t phonotrail ."

wsl -d Ubuntu -u root -- bash -c "docker run --rm -p 3000:3000 -v phonotrail-data:/data -e DATABASE_URL=file:/data/phonotrail.db --name phonotrail-app phonotrail"

Open http://localhost:3000 to view the site.

## Build verification

```bash
npm run build
```
