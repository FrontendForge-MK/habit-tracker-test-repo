const { test, expect } = require("@playwright/test");

const storageKey = "habit-tracker.habits";

test("adds, completes, and restores a habit after reload", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByLabel("Nazwa nowego nawyku").fill("10 minut czytania");
  await page.getByRole("button", { name: "Dodaj" }).click();

  const habitCheckbox = page.locator("#habit-list input[type='checkbox']");
  await expect(habitCheckbox).toHaveCount(1);
  await habitCheckbox.check();
  await expect(page.locator("#progress-label")).toHaveText("1 z 1");

  await page.reload();

  await expect(habitCheckbox).toBeChecked();
  await expect(page.locator("#progress-label")).toHaveText("1 z 1");
  await expect
    .poll(() =>
      page.evaluate((key) => JSON.parse(localStorage.getItem(key)), storageKey),
    )
    .toEqual([
      expect.objectContaining({
        title: "10 minut czytania",
        completed: true,
      }),
    ]);
});
