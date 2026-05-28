import { test, expect } from "@playwright/test";
import { uniqueSuffix } from "./helpers/e2e-helpers";

test("Register flow logs in user and blocks guest-only login route", async ({ page }) => {
  const suffix = uniqueSuffix("register-ui");
  const email = `frontend.${suffix}@test.com`;

  await page.goto("/register");

  await page.getByPlaceholder("Name").fill("Frontend E2E User");
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill("12345678");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText(email)).toBeVisible();

  await page.goto("/login");
  await expect(page).toHaveURL(/\/$/);
});
