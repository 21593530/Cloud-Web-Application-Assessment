import { expect, test } from "@playwright/test";

const activityTitle = "A3 E2E Generated Activity";

test("learner interaction and export appear in dashboard reporting", async ({ page, request }) => {
  const healthResponse = await request.get("/api/health");
  expect(healthResponse.status()).toBe(200);
  await expect(healthResponse.json()).resolves.toEqual({ data: { status: "ok" } });

  const invalidResponse = await request.post("/api/activities", {
    data: { type: "WORDLE", title: "Invalid empty test activity", words: [] },
  });
  expect(invalidResponse.status()).toBe(400);
  await expect(invalidResponse.json()).resolves.toMatchObject({
    error: { code: "VALIDATION_ERROR", message: "Activity data is invalid." },
  });

  const createResponse = await request.post("/api/activities", {
    data: {
      type: "WORDLE",
      title: activityTitle,
      clue: "A short E2E phoneme sequence.",
      difficulty: "EASY",
      settings: { maxGuesses: 8 },
      words: [
        {
          displayWord: "p t",
          englishWord: "test",
          position: 0,
          phonemes: ["p", "t"],
        },
      ],
    },
  });
  expect(createResponse.status()).toBe(201);
  const created = await createResponse.json();
  const activityId = created.data.id as string;

  try {
    await page.goto("/wordle");
    const savedActivity = page.getByLabel("Saved activity");
    await expect(savedActivity.locator("option", { hasText: activityTitle })).toHaveCount(1);
    await savedActivity.selectOption(activityId);
    await expect(page.getByText(`Loaded "${activityTitle}".`)).toBeVisible();

    const gameKeyboard = page.getByLabel("Phoneme game keyboard");
    await gameKeyboard.getByRole("button", { name: /^p —/ }).click();
    await gameKeyboard.getByRole("button", { name: /^t —/ }).click();
    await page.getByRole("button", { name: "Submit guess" }).click();
    await expect(page.getByText(/Correct! p t/)).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export HTML" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("phonotrail-wordle.html");
    await expect(page.getByText("Exported a standalone playable HTML Wordle.")).toBeVisible();

    await expect.poll(async () => {
      const response = await request.get("/api/dashboard/summary");
      const summary = await response.json();
      return summary.data.usage.generations.successful;
    }).toBe(1);

    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Operational dashboard" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Saved activity and usage metrics" })).toBeVisible();

    const successfulGenerations = page.locator("article").filter({
      has: page.getByRole("heading", { name: "Successful generations" }),
    });
    await expect(successfulGenerations).toContainText("1");
    await expect(page.getByLabel("Reporting source disclosure")).toContainText("live event");
  } finally {
    await request.delete(`/api/activities/${activityId}`);
  }
});
