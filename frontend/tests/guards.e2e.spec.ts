import { test, expect } from "./helpers/e2e-helpers";

test("Route guards redirect guest users to login", async ({ page }) => {
  await page.goto("/books");
  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/profile");
  await expect(page).toHaveURL(/\/login$/);
});
