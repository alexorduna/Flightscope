import { test, expect } from "@playwright/test";

async function searchMtyToTij(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByLabel("Origin", { exact: true }).fill("Monterrey");
  await page.getByRole("option", { name: /Monterrey/ }).click();
  await page.getByLabel("Destination", { exact: true }).fill("Tijuana");
  await page.getByRole("option", { name: /Tijuana/ }).click();
  await page.getByRole("button", { name: /search flights/i }).click();
}

test("searches MTY -> TIJ flights and shows results", async ({ page }) => {
  await searchMtyToTij(page);

  await expect(page.getByRole("heading", { name: /MTY.*TIJ/ })).toBeVisible();
  await expect(page.getByText(/Direct|stop/).first()).toBeVisible();
});

test("shows the data source transparently (live or mock)", async ({ page }) => {
  await searchMtyToTij(page);
  const resultsHeader = page.locator(".results-list__source");
  await expect(resultsHeader).toContainText(/Live data \(SerpApi\)|Demo data \(mock\)/);
});
