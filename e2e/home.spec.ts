import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load and display content", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should have working search", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.locator('input[type="search"]');
    await searchInput.fill("Inception");
    await searchInput.press("Enter");
    await expect(page).toHaveURL(/\/search/);
  });
});

