# Assessment 3 Playwright suite

Run the isolated end-to-end suite from `app/`:

```powershell
npm run test:e2e
```

The command recreates `app/prisma/playwright/test.db`, applies the committed Prisma migrations, starts Next.js on `127.0.0.1:3100`, and runs the tests in the locally installed Microsoft Edge browser. It never opens or writes to the demonstration database at `app/prisma/prisma/dev.db`.

The two required scenarios are separated by purpose:

- `builder-crud.spec.ts` verifies create, reload/retrieve, update, multi-character phoneme persistence, and delete through the Word Search builder.
- `generated-activity-reporting.spec.ts` verifies health and invalid-input responses, loads a known Wordle activity, completes a keyboard interaction, exports standalone HTML, and confirms the success in the dashboard.

Failures retain a Playwright trace and screenshot under `test-results/`. Every run also creates an HTML report under `playwright-report/`; open it with:

```powershell
npm run test:e2e:report
```

Both output directories and the disposable database directory are intentionally ignored by Git.
