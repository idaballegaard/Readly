import { test, expect } from "@playwright/test";
import {
  createBook,
  loginThroughUi,
  loginUser,
  registerUser,
  uniqueSuffix,
} from "./helpers/e2e-helpers";

test("Authenticated user can filter books by title", async ({ page, request }) => {
  const suffix = uniqueSuffix("books-filter");
  const user = await registerUser(request, suffix);
  const authState = await loginUser(request, user.email, user.password);

  const targetTitle = `E2E Target ${suffix}`;
  const otherTitle = `E2E Other ${suffix}`;

  await createBook(request, authState.token, targetTitle, "Fantasy");
  await createBook(request, authState.token, otherTitle, "Sci-Fi");

  await loginThroughUi(page, user.email, user.password);
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/books");
  await expect(page.getByRole("heading", { name: "Explore Books" })).toBeVisible();

  await page.getByPlaceholder("Book title...").fill(targetTitle);

  await expect(page.getByRole("heading", { name: "Search Results" })).toBeVisible();
  await expect(page.getByText("1 book found")).toBeVisible();
});
