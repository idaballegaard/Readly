import {
  APIRequestContext,
  expect,
  Page,
  test as base,
} from "@playwright/test";

export { expect };

export const test = base.extend<{ workerTag: string }>({
  workerTag: [
    async ({}, use, workerInfo) => {
      await use(`w${workerInfo.workerIndex}`);
    },
    { scope: "worker" },
  ],
});

export const API_BASE_URL = process.env.BASE_URL ?? "http://localhost:4000/api";

export interface AuthState {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    favoriteBooks?: string[];
  };
}

interface TestBookOverrides {
  description?: string;
  author?: string;
  publishedDate?: string;
  pages?: number;
  rating?: number;
  imageUrl?: string;
}

export function uniqueSuffix(prefix: string, workerTag: string): string {
  return `${workerTag}-${prefix}-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
}

export async function registerUser(
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

export async function loginUser(
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

export async function createBook(
  request: APIRequestContext,
  token: string,
  title: string,
  genre: string,
  overrides: TestBookOverrides = {},
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
      ...overrides,
    },
  });

  expect(response.status()).toBe(201);

  const json = await response.json();
  const createdBookId = String(json._id ?? json.id ?? "");

  expect(createdBookId).toBeTruthy();
  return createdBookId;
}

export async function loginThroughUi(
  page: Page,
  email: string,
  password: string,
) {
  await page.goto("/login");
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill(password);
  await page.getByRole("button", { name: "Login" }).click();
}
