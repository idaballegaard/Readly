import { APIRequestContext, expect } from "@playwright/test";

interface TestUser {
  name: string;
  email: string;
  password: string;
}

interface TestBook {
  title: string;
  description: string;
  author: string;
  publishedDate: string;
  pages: number;
  genre: string;
  rating: number;
  imageUrl?: string;
}

export function buildTestUser(seed: string = "default"): TestUser {
  const uniqueSuffix = `${Date.now()}.${Math.round(Math.random() * 1000000)}`;

  return {
    name: "Playwright User",
    email: `playwright.${seed}.${uniqueSuffix}@test.com`,
    password: "12345678",
  };
}

export function buildTestBook(overrides: Partial<TestBook> = {}): TestBook {
  return {
    title: "The Playwright Journey",
    description: "A test-only book used by API E2E tests.",
    author: "QA Bot",
    publishedDate: "2024-01-01T00:00:00.000Z",
    pages: 350,
    genre: "Testing",
    rating: 4.2,
    imageUrl: "https://example.com/playwright-book.png",
    ...overrides,
  };
}

export async function registerAndLogin(
  request: APIRequestContext,
  seed: string = "default",
): Promise<{ token: string; userId: string }> {
  const user = buildTestUser(seed);

  const registerResponse = await request.post("/api/user/register", {
    data: user,
  });

  expect(registerResponse.status()).toBe(201);

  const loginResponse = await request.post("/api/user/login", {
    data: {
      email: user.email,
      password: user.password,
    },
  });

  expect(loginResponse.status()).toBe(200);

  const loginJson = await loginResponse.json();

  return {
    token: loginJson.data.token,
    userId: loginJson.data.user.id,
  };
}
