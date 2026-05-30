import {
  API_BASE_URL,
  AuthState,
  createBook,
  expect,
  loginUser,
  registerUser,
  test,
  uniqueSuffix,
} from "./helpers/e2e-helpers";

test("Profile page shows favorites for authenticated user", async ({ page, request, workerTag }) => {
  const suffix = uniqueSuffix("profile-favorites", workerTag);
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
