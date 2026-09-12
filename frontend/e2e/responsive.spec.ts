import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 375, height: 812 } });

test("the search form is usable on a mobile viewport", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByLabel("Origin", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /search flights/i })).toBeVisible();

  const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalScroll).toBe(false);

  await page.getByLabel("Origin", { exact: true }).fill("Monterrey");
  await page.getByRole("option", { name: /Monterrey/ }).click();
  await page.getByLabel("Destination", { exact: true }).fill("Tijuana");
  await page.getByRole("option", { name: /Tijuana/ }).click();
  await page.getByRole("button", { name: /search flights/i }).click();

  await expect(page.getByRole("heading", { name: /MTY.*TIJ/ })).toBeVisible();
});
