import { test, expect } from "@playwright/test";

test("filtering by 'Direct' reduces results to non-stop flights", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Origin", { exact: true }).fill("Monterrey");
  await page.getByRole("option", { name: /Monterrey/ }).click();
  await page.getByLabel("Destination", { exact: true }).fill("Tijuana");
  await page.getByRole("option", { name: /Tijuana/ }).click();
  await page.getByRole("button", { name: /search flights/i }).click();

  await expect(page.getByText(/results|result/)).toBeVisible();
  const countBefore = await page.locator(".flight-card").count();

  await page.getByLabel("Direct").check();

  await expect(page.locator(".flight-card__stops", { hasText: "stop" })).toHaveCount(0);
  const countAfter = await page.locator(".flight-card").count();
  expect(countAfter).toBeLessThanOrEqual(countBefore);
  expect(countAfter).toBeGreaterThan(0);
});

test("sorting by price descending changes the first result", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Origin", { exact: true }).fill("Monterrey");
  await page.getByRole("option", { name: /Monterrey/ }).click();
  await page.getByLabel("Destination", { exact: true }).fill("Tijuana");
  await page.getByRole("option", { name: /Tijuana/ }).click();
  await page.getByRole("button", { name: /search flights/i }).click();

  await expect(page.locator(".flight-card").first()).toBeVisible();
  const cheapestFirstPrice = await page.locator(".flight-card__price").first().textContent();

  await page.getByRole("button", { name: /ascending order/i }).click();

  const priciestFirstPrice = await page.locator(".flight-card__price").first().textContent();
  expect(priciestFirstPrice).not.toEqual(cheapestFirstPrice);
});
