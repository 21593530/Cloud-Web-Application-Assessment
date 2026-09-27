import { expect, test } from "@playwright/test";

const originalTitle = "A3 E2E Builder Activity";
const updatedTitle = "A3 E2E Builder Activity Updated";
const originalWords = "tʃ ɪ n\nʃ iː p";
const updatedWords = "dʒ æ m\nʃ iː p";

test("teacher can create, retrieve, update, and delete a Word Search activity", async ({ page, request }) => {
  await page.goto("/word-search");

  await expect(page.getByRole("heading", { name: "Build a polished phoneme word search" })).toBeVisible();

  const savedActivity = page.getByLabel("Saved activity");
  const activityTitle = page.getByLabel("Activity Title (custom name for saving)");
  const words = page.getByLabel("Words (one per line, phonemes separated by spaces)");
  const rows = page.getByLabel("Rows");
  const columns = page.getByLabel("Columns");

  await expect(page.getByText("0 saved Word Search activities.")).toBeVisible();
  await activityTitle.fill(originalTitle);
  await words.fill(originalWords);
  await rows.fill("7");
  await columns.fill("9");
  await page.getByRole("button", { name: "Save as New Activity" }).click();

  await expect(page.getByText(`Saved new "${originalTitle}".`)).toBeVisible();
  await expect(savedActivity.locator("option", { hasText: originalTitle })).toHaveCount(1);
  const activityId = await savedActivity.inputValue();
  expect(activityId).not.toBe("");

  await page.reload();
  await expect(savedActivity.locator("option", { hasText: originalTitle })).toHaveCount(1);
  await savedActivity.selectOption({ label: originalTitle });
  await expect(page.getByText(`Loaded "${originalTitle}".`).first()).toBeVisible();
  await expect(activityTitle).toHaveValue(originalTitle);
  await expect(words).toHaveValue(originalWords);
  await expect(rows).toHaveValue("7");
  await expect(columns).toHaveValue("9");

  await activityTitle.fill(updatedTitle);
  await words.fill(updatedWords);
  await rows.fill("10");
  await page.getByRole("button", { name: "Update Saved Activity" }).click();

  await expect(page.getByText(`Updated "${updatedTitle}".`)).toBeVisible();
  await page.reload();
  await expect(savedActivity.locator("option", { hasText: updatedTitle })).toHaveCount(1);
  await savedActivity.selectOption(activityId);
  await expect(activityTitle).toHaveValue(updatedTitle);
  await expect(words).toHaveValue(updatedWords);
  await expect(rows).toHaveValue("10");

  const persistedResponse = await request.get(`/api/activities/${activityId}`);
  expect(persistedResponse.status()).toBe(200);
  const persisted = await persistedResponse.json();
  expect(persisted.data.title).toBe(updatedTitle);
  expect(persisted.data.settings.rows).toBe(10);
  expect(persisted.data.words[0].phonemes.map((phoneme: { symbol: string }) => phoneme.symbol)).toEqual(["dʒ", "æ", "m"]);

  await page.getByRole("button", { name: "Delete Saved Activity" }).click();
  await expect(page.getByText("Saved activity deleted.")).toBeVisible();
  await expect(savedActivity.locator(`option[value="${activityId}"]`)).toHaveCount(0);

  const deletedResponse = await request.get(`/api/activities/${activityId}`);
  expect(deletedResponse.status()).toBe(404);
});
