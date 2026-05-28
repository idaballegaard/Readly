import { test, expect } from "@playwright/test";

test("Route guards redirect guest users to login", async ({ page }) => {
  await page.goto("/books");
  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/profile");
  await expect(page).toHaveURL(/\/login$/);
});
