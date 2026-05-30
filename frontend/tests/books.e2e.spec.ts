import {
  createBook,
  expect,
  loginThroughUi,
  loginUser,
  registerUser,
  test,
  uniqueSuffix,
} from "./helpers/e2e-helpers";

test("Authenticated user can filter books by title", async ({ page, request, workerTag }) => {
  const suffix = uniqueSuffix("books-filter", workerTag);
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

test("Authenticated user can toggle a favorite from book list and see it on profile", async ({ page, request, workerTag }) => {
  const suffix = uniqueSuffix("books-favorite-toggle", workerTag);
  const user = await registerUser(request, suffix);
  const authState = await loginUser(request, user.email, user.password);

  const targetTitle = `Favorite Toggle ${suffix}`;
  const bookId = await createBook(request, authState.token, targetTitle, "Fantasy");

  await loginThroughUi(page, user.email, user.password);
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/books");

  await page.getByPlaceholder("Book title...").fill(targetTitle);

  const favoriteToggle = page.getByTestId(`favorite-toggle-${bookId}`).first();
  await expect(favoriteToggle).toHaveAttribute("aria-label", new RegExp(`Add ${targetTitle} to favorites`));

  await favoriteToggle.click();
  await expect(favoriteToggle).toHaveAttribute("aria-label", new RegExp(`Remove ${targetTitle} from favorites`));

  await page.goto("/profile");
  await expect(page.getByText(targetTitle)).toBeVisible();
});

test("Authenticated user can open book detail from book list", async ({ page, request, workerTag }) => {
  const suffix = uniqueSuffix("books-detail", workerTag);
  const user = await registerUser(request, suffix);
  const authState = await loginUser(request, user.email, user.password);

  const targetTitle = `Book Detail ${suffix}`;
  const bookId = await createBook(request, authState.token, targetTitle, "Fantasy");

  await loginThroughUi(page, user.email, user.password);
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/books");

  await page.getByPlaceholder("Book title...").fill(targetTitle);
  await page.getByTestId(`book-card-${bookId}`).first().click();

  await expect(page).toHaveURL(new RegExp(`/books/${bookId}$`));
  await expect(page.getByRole("heading", { name: targetTitle })).toBeVisible();
  await expect(page.getByText("Created by frontend browser E2E test.")).toBeVisible();
});

test("Authenticated user can remove a favorite again from book list", async ({ page, request, workerTag }) => {
  const suffix = uniqueSuffix("books-favorite-remove", workerTag);
  const user = await registerUser(request, suffix);
  const authState = await loginUser(request, user.email, user.password);

  const targetTitle = `Favorite Remove ${suffix}`;
  const bookId = await createBook(request, authState.token, targetTitle, "Fantasy");

  await loginThroughUi(page, user.email, user.password);
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/books");

  await page.getByTestId("search-title-input").fill(targetTitle);

  const favoriteToggle = page.getByTestId(`favorite-toggle-${bookId}`).first();
  await favoriteToggle.click();
  await expect(favoriteToggle).toHaveAttribute("aria-label", new RegExp(`Remove ${targetTitle} from favorites`));

  await favoriteToggle.click();
  await expect(favoriteToggle).toHaveAttribute("aria-label", new RegExp(`Add ${targetTitle} to favorites`));

  await page.goto("/profile");
  await expect(page.getByText("No favorites yet.")).toBeVisible();
});

test("Authenticated user can filter by genre and sort by newest published", async ({ page, request, workerTag }) => {
  const suffix = uniqueSuffix("books-genre-sort", workerTag);
  const user = await registerUser(request, suffix);
  const authState = await loginUser(request, user.email, user.password);

  const olderTitle = `Fantasy Older ${suffix}`;
  const newerTitle = `Fantasy Newer ${suffix}`;
  const targetGenre = `Genre-${suffix}`;
  const otherGenre = `Other-${suffix}`;

  await createBook(request, authState.token, olderTitle, targetGenre, {
    rating: 4.9,
    publishedDate: "2022-01-01T00:00:00.000Z",
  });
  await createBook(request, authState.token, newerTitle, targetGenre, {
    rating: 4.1,
    publishedDate: "2025-01-01T00:00:00.000Z",
  });
  await createBook(request, authState.token, `Sci-Fi Other ${suffix}`, otherGenre, {
    rating: 5,
    publishedDate: "2026-01-01T00:00:00.000Z",
  });

  await loginThroughUi(page, user.email, user.password);
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/books");

  await page.getByTestId("search-genre-select").selectOption(targetGenre);
  await expect(page.getByRole("heading", { name: "Search Results" })).toBeVisible();
  await expect(page.getByTestId("result-count")).toHaveText("2 books found");

  const firstResultCard = page.locator('[data-testid^="book-card-"]').first();
  await expect(firstResultCard).toContainText(olderTitle);

  await page.getByTestId("sort-by-select").selectOption("published");
  await expect(firstResultCard).toContainText(newerTitle);
});
