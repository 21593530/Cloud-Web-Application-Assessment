import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const appDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const testDirectory = path.join(appDirectory, "prisma", "playwright");
const testDatabase = path.join(testDirectory, "test.db");
const testDatabaseUrl = "file:./playwright/test.db";

await mkdir(testDirectory, { recursive: true });

for (const suffix of ["", "-journal", "-shm", "-wal"]) {
  await rm(`${testDatabase}${suffix}`, { force: true });
}

// Prisma's Windows schema engine migrates an existing empty SQLite file
// reliably, but may not create a database at an alternate test URL itself.
await writeFile(testDatabase, "");

const prismaEntryPoint = path.join(appDirectory, "node_modules", "prisma", "build", "index.js");
const migration = spawnSync(process.execPath, [prismaEntryPoint, "migrate", "deploy"], {
  cwd: appDirectory,
  env: {
    ...process.env,
    DATABASE_URL: testDatabaseUrl,
  },
  encoding: "utf8",
  stdio: "pipe",
});

if (migration.stdout) process.stdout.write(migration.stdout);
if (migration.stderr) process.stderr.write(migration.stderr);

if (migration.status !== 0) {
  const reason = migration.error instanceof Error ? `: ${migration.error.message}` : "";
  throw new Error(`Playwright database migration failed with exit code ${migration.status ?? "unknown"}${reason}.`);
}

console.log(`Prepared isolated Playwright database: ${testDatabase}`);
