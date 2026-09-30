import assert from "node:assert/strict";
import { chromium, request as playwrightRequest } from "@playwright/test";

const baseURL = process.env.PHONOTRAIL_BASE_URL ?? "http://127.0.0.1:3200";
const requiredRoutes = ["/", "/about", "/settings", "/wordle", "/word-search", "/dashboard"];

const api = await playwrightRequest.newContext({ baseURL });
const createdIds = [];

async function responseJson(response, expectedStatus) {
  assert.equal(response.status(), expectedStatus, `${response.url()} returned ${response.status()}`);
  if (expectedStatus === 204) return undefined;
  return response.json();
}

async function waitForSuccessfulGenerations(expected) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    const response = await api.get("/api/dashboard/summary");
    const body = await responseJson(response, 200);
    if (body.data.usage.generations.successful === expected) return body.data;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Dashboard did not reach ${expected} successful generations.`);
}

async function createActivity(payload) {
  const body = await responseJson(await api.post("/api/activities", { data: payload }), 201);
  createdIds.push(body.data.id);
  return body.data;
}

try {
  for (const route of requiredRoutes) {
    const response = await api.get(route);
    assert.equal(response.status(), 200, `${route} did not return HTTP 200`);
  }

  const health = await responseJson(await api.get("/api/health"), 200);
  assert.deepEqual(health, { data: { status: "ok", database: "connected" } });

  const baseline = await responseJson(await api.get("/api/dashboard/summary"), 200);
  assert.equal(baseline.data.health.database, "CONNECTED");
  assert.equal(baseline.data.activities.wordle, 1);
  assert.equal(baseline.data.activities.wordSearch, 1);
  const initialSuccessfulGenerations = baseline.data.usage.generations.successful;

  const wordlePayload = {
    type: "WORDLE",
    title: "Phase 10 Docker Wordle",
    clue: "Disposable Docker verification activity.",
    difficulty: "EASY",
    settings: { maxGuesses: 8 },
    words: [{ displayWord: "p t", englishWord: "test", position: 0, phonemes: ["p", "t"] }],
  };
  const wordSearchPayload = {
    type: "WORD_SEARCH",
    title: "Phase 10 Docker Word Search",
    clue: "Disposable Docker verification activity.",
    difficulty: "EASY",
    settings: { rows: 8, cols: 8 },
    words: [
      { displayWord: "p t", englishWord: "test", position: 0, phonemes: ["p", "t"] },
      { displayWord: "m n", englishWord: "second", position: 1, phonemes: ["m", "n"] },
    ],
  };

  const wordle = await createActivity(wordlePayload);
  const wordSearch = await createActivity(wordSearchPayload);
  const updatedTitle = "Phase 10 Docker Word Search Updated";
  const updated = await responseJson(
    await api.patch(`/api/activities/${wordSearch.id}`, {
      data: { ...wordSearchPayload, title: updatedTitle },
    }),
    200,
  );
  assert.equal(updated.data.title, updatedTitle);

  const persisted = await responseJson(await api.get(`/api/activities/${wordSearch.id}`), 200);
  assert.equal(persisted.data.title, updatedTitle);
  assert.deepEqual(persisted.data.words[0].phonemes.map(({ symbol }) => symbol), ["p", "t"]);

  await responseJson(await api.delete(`/api/activities/${wordle.id}`), 204);
  createdIds.splice(createdIds.indexOf(wordle.id), 1);
  await responseJson(await api.delete(`/api/activities/${wordSearch.id}`), 204);
  createdIds.splice(createdIds.indexOf(wordSearch.id), 1);
  assert.equal((await api.get(`/api/activities/${wordSearch.id}`)).status(), 404);

  const browser = await chromium.launch({ channel: "msedge" });
  try {
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();

    await page.goto(`${baseURL}/wordle`);
    await page.getByLabel("Saved activity").selectOption({ label: "Ship phoneme Wordle" });
    await page.getByText('Loaded "Ship phoneme Wordle".').waitFor();
    const wordleDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export HTML" }).click();
    assert.equal((await wordleDownload).suggestedFilename(), "phonotrail-wordle.html");
    await page.getByText("Exported a standalone playable HTML Wordle.").waitFor();

    await page.goto(`${baseURL}/word-search`);
    await page.getByLabel("Saved activity").selectOption({ label: "Introductory phoneme word search" });
    await page.getByText('Loaded "Introductory phoneme word search".').first().waitFor();
    const wordSearchDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export HTML" }).click();
    assert.equal((await wordSearchDownload).suggestedFilename(), "phonotrail-word-search.html");
    await page.getByText("Styled worksheet exported and opened for review.").waitFor();

    const finalSummary = await waitForSuccessfulGenerations(initialSuccessfulGenerations + 2);
    assert.equal(finalSummary.activities.total, 2);

    await page.goto(`${baseURL}/dashboard`);
    await page.getByRole("heading", { name: "Operational dashboard" }).waitFor();
    await page.getByText("Database connected").waitFor();
  } finally {
    await browser.close();
  }

  console.log(`Docker runtime verification passed at ${baseURL}.`);
  console.log(`Routes: ${requiredRoutes.length}; health: 200; database: CONNECTED; CRUD: passed; exports: 2.`);
  console.log(`Successful generations: ${initialSuccessfulGenerations} -> ${initialSuccessfulGenerations + 2}.`);
} finally {
  for (const id of createdIds) {
    await api.delete(`/api/activities/${id}`).catch(() => undefined);
  }
  await api.dispose();
}
