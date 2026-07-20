const { test, expect } = require("@playwright/test");

const storageKey = "habit-tracker.habits";
const themeStorageKey = "habit-tracker.theme";

test("uses the system color preference until a selected theme is saved", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await expect(page.locator("html")).not.toHaveAttribute("data-theme");
  await expect(page.getByRole("button", { name: "Włącz jasny motyw" })).toBeVisible();
  await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");

  await page.getByRole("button", { name: "Włącz jasny motyw" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: "Włącz ciemny motyw" })).toBeVisible();
  await expect(page.locator("html")).toHaveCSS("color-scheme", "light");

  await page.reload();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: "Włącz ciemny motyw" })).toBeVisible();
  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), themeStorageKey))
    .toBe("light");
});

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

test("filters habits and refreshes the current view after completion changes", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  const nameInput = page.getByLabel("Nazwa nowego nawyku");
  await nameInput.fill("Czytanie");
  await page.getByRole("button", { name: "Dodaj" }).click();
  await nameInput.fill("Spacer");
  await page.getByRole("button", { name: "Dodaj" }).click();
  await page.getByLabel("Oznacz nawyk „Spacer” jako wykonany").check();

  const allFilter = page.getByRole("button", { name: "Wszystkie" });
  const activeFilter = page.getByRole("button", { name: "Do zrobienia" });
  const completedFilter = page.getByRole("button", { name: "Wykonane" });

  await expect(allFilter).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#habit-list li")).toHaveCount(2);

  await activeFilter.click();
  await expect(activeFilter).toHaveAttribute("aria-pressed", "true");
  await expect(allFilter).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByText("Czytanie", { exact: true })).toBeVisible();
  await expect(page.getByText("Spacer", { exact: true })).toHaveCount(0);

  await page.getByLabel("Oznacz nawyk „Czytanie” jako wykonany").check();
  await expect(page.locator("#habit-list li")).toHaveCount(0);

  await completedFilter.click();
  await expect(completedFilter).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#habit-list li")).toHaveCount(2);
  await expect(page.getByText("Czytanie", { exact: true })).toBeVisible();
  await expect(page.getByText("Spacer", { exact: true })).toBeVisible();
});

test("deletes a habit and persists the remaining habit after reload", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  const nameInput = page.getByLabel("Nazwa nowego nawyku");
  await nameInput.fill("Czytanie");
  await page.getByRole("button", { name: "Dodaj" }).click();
  await nameInput.fill("Spacer");
  await page.getByRole("button", { name: "Dodaj" }).click();
  await page.getByLabel("Oznacz nawyk „Spacer” jako wykonany").check();

  await page.getByRole("button", { name: "Usuń nawyk Czytanie" }).click();

  await expect(page.getByText("Czytanie", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Oznacz nawyk „Spacer” jako wykonany")).toBeChecked();
  await expect(page.locator("#progress-label")).toHaveText("1 z 1");

  await page.reload();

  await expect(page.getByText("Czytanie", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Oznacz nawyk „Spacer” jako wykonany")).toBeChecked();
  await expect(page.getByRole("button", { name: "Usuń nawyk Spacer" })).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate((key) => JSON.parse(localStorage.getItem(key)), storageKey),
    )
    .toEqual([
      expect.objectContaining({
        title: "Spacer",
        completed: true,
      }),
    ]);
});
