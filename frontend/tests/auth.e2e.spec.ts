import {
  expect,
  loginThroughUi,
  registerUser,
  test,
  uniqueSuffix,
} from "./helpers/e2e-helpers";

test("Register flow logs in user and blocks guest-only login route", async ({ page, workerTag }) => {
  const suffix = uniqueSuffix("register-ui", workerTag);
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

test("Authenticated user can logout and loses access to protected routes", async ({ page, request, workerTag }) => {
  const suffix = uniqueSuffix("logout-ui", workerTag);
  const user = await registerUser(request, suffix);

  await loginThroughUi(page, user.email, user.password);
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText(user.email)).toBeVisible();

  await page.getByRole("button", { name: "Logout" }).first().click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();

  await page.goto("/profile");
  await expect(page).toHaveURL(/\/login$/);
});

test("Login shows an error for invalid credentials", async ({ page, request, workerTag }) => {
  const suffix = uniqueSuffix("login-error-ui", workerTag);
  const user = await registerUser(request, suffix);

  await page.goto("/login");
  await page.getByPlaceholder("Email").fill(user.email);
  await page.getByPlaceholder("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText("Password or email is wrong.")).toBeVisible();
});

test("Register shows validation error for short password", async ({ page, workerTag }) => {
  const suffix = uniqueSuffix("register-validation-ui", workerTag);

  await page.goto("/register");
  await page.getByPlaceholder("Name").fill("Frontend E2E User");
  await page.getByPlaceholder("Email").fill(`frontend.${suffix}@test.com`);
  await page.getByPlaceholder("Password").fill("1234");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/register$/);
  await expect(
    page.getByText('"password" length must be at least 6 characters long'),
  ).toBeVisible();
});
