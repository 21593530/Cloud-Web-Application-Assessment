# Lighthouse accessibility checks

This directory records the repeatable Lighthouse procedure used for Assessment 3. Lighthouse `13.5.0` is installed as a development dependency so the audit version is fixed by `package-lock.json`.

## Test conditions

- Build mode: Next.js production build and production server.
- Browser: local Microsoft Edge in headless mode (`HeadlessChrome/153.0.0.0`).
- Data: migrated and seeded disposable database at `prisma/playwright/test.db`.
- Primary route: `http://127.0.0.1:3300/dashboard`.
- Regression route: `http://127.0.0.1:3300/wordle`.
- Lighthouse category: accessibility only, desktop preset.

Prepare the disposable database and production build from `app`:

```powershell
$env:DATABASE_URL = "file:./playwright/test.db"
npm run test:e2e:prepare
npm run db:seed
npm run db:seed:metrics
npm run build
$env:PORT = "3300"
npm run start
```

Run an audit from a second terminal:

```powershell
npx lighthouse http://127.0.0.1:3300/dashboard `
  --only-categories=accessibility `
  --preset=desktop `
  --output=json `
  --output=html `
  --output-path=lighthouse/raw-results/YYYY-MM-DD/dashboard-final `
  --chrome-path="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" `
  --chrome-flags="--headless=new --disable-gpu --no-first-run" `
  --quiet
```

The browser path is machine-specific and should be adjusted if Chrome or Edge is installed elsewhere.

## Evidence policy

The concise, version-controlled interpretation is in `results/Assessment3_Lighthouse_Results.md`. Generated HTML and JSON reports are stored under `raw-results/` and ignored by Git because they are large local evidence artifacts. Preserve the final HTML reports separately for the video and submission evidence package.

On this Windows/Edge environment, Lighthouse wrote complete HTML and JSON reports but then returned exit code `1` when Windows denied cleanup of its temporary browser profile. The reports themselves contain valid scores and no Lighthouse run warnings. This environment cleanup message is not an accessibility audit failure.

Lighthouse is automated evidence, not a substitute for manual accessibility testing. Its ten manual audit prompts still require keyboard, focus-order, landmark, off-screen-content, and custom-control review.
