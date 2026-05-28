import { test, expect, APIRequestContext, Page } from "@playwright/test";

const API_BASE_URL = "http://localhost:4000/api";

interface AuthState {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    favoriteBooks?: string[];
  };
}

function uniqueSuffix(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
}

async function registerUser(
  request: APIRequestContext,
  suffix: string,
): Promise<{ name: string; email: string; password: string }> {
  const user = {
    name: "Frontend E2E User",
    email: `frontend.${suffix}@test.com`,
    password: "12345678",
  };

  const response = await request.post(`${API_BASE_URL}/user/register`, {
    data: user,
  });

  expect(response.status()).toBe(201);
  return user;
}

async function loginUser(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<AuthState> {
  const response = await request.post(`${API_BASE_URL}/user/login`, {
    data: { email, password },
  });

  expect(response.status()).toBe(200);

  const json = await response.json();

  return json.data as AuthState;
}

async function createBook(
  request: APIRequestContext,
  token: string,
  title: string,
  genre: string,
): Promise<string> {
  const response = await request.post(`${API_BASE_URL}/books`, {
    headers: {
      "auth-token": token,
    },
    data: {
      title,
      description: "Created by frontend browser E2E test.",
      author: "E2E Bot",
      publishedDate: "2024-01-01T00:00:00.000Z",
      pages: 280,
      genre,
      rating: 4.5,
      imageUrl: "https://example.com/e2e-book.png",
    },
  });

  expect(response.status()).toBe(201);

  const json = await response.json();
  return String(json._id);
}

async function loginThroughUi(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill(password);
  await page.getByRole("button", { name: "Login" }).click();
}

test("Route guards redirect guest users to login", async ({ page }) => {
  await page.goto("/books");
  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/profile");
  await expect(page).toHaveURL(/\/login$/);
});

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

test("Profile page shows favorites for authenticated user", async ({ page, request }) => {
  const suffix = uniqueSuffix("profile-favorites");
  const user = await registerUser(request, suffix);
  const authState = await loginUser(request, user.email, user.password);

  const favoriteTitle = `Favorite Book ${suffix}`;
  const favoriteBookId = await createBook(request, authState.token, favoriteTitle, "Fantasy");

  const favoriteResponse = await request.post(
    `${API_BASE_URL}/user/favorites/${favoriteBookId}`,
    {
      headers: {
        "auth-token": authState.token,
      },
    },
  );

  expect(favoriteResponse.status()).toBe(200);

  await page.addInitScript((state: AuthState) => {
    localStorage.setItem("auth", JSON.stringify(state));
  }, authState);

  await page.goto("/profile");

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole("heading", { name: "❤️ Your Favorites" })).toBeVisible();
  await expect(page.getByText(favoriteTitle)).toBeVisible();
});
