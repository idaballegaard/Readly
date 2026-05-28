import { test, expect } from "@playwright/test";
import { buildTestBook, registerAndLogin } from "./helpers";

export default function favoritesTestCollection() {
  test("User can add and remove a favorite book", async ({ request }) => {
    test.setTimeout(15_000);

    const { token } = await registerAndLogin(request, "favorites-toggle");

    const createBookResponse = await request.post("/api/books", {
      headers: {
        "auth-token": token,
      },
      data: buildTestBook({ title: "Favorite Target", rating: 4.4 }),
    });
    const createdBook = await createBookResponse.json();

    expect(createBookResponse.status()).toBe(201);

    const bookId = createdBook._id;

    const addFavoriteResponse = await request.post(`/api/user/favorites/${bookId}`, {
      headers: {
        "auth-token": token,
      },
    });
    const addFavoriteJson = await addFavoriteResponse.json();

    expect(addFavoriteResponse.status()).toBe(200);
    expect(addFavoriteJson.data.isFavorite).toBe(true);
    expect(addFavoriteJson.data.favoriteBookIds).toContain(bookId);

    const getFavoritesResponse = await request.get("/api/user/favorites", {
      headers: {
        "auth-token": token,
      },
    });
    const getFavoritesJson = await getFavoritesResponse.json();

    expect(getFavoritesResponse.status()).toBe(200);
    expect(getFavoritesJson.data.favoriteBookIds).toContain(bookId);

    const removeFavoriteResponse = await request.post(
      `/api/user/favorites/${bookId}`,
      {
        headers: {
          "auth-token": token,
        },
      },
    );
    const removeFavoriteJson = await removeFavoriteResponse.json();

    expect(removeFavoriteResponse.status()).toBe(200);
    expect(removeFavoriteJson.data.isFavorite).toBe(false);
    expect(removeFavoriteJson.data.favoriteBookIds).not.toContain(bookId);
  });

  test("Favorites endpoint rejects invalid token", async ({ request }) => {
    test.setTimeout(15_000);

    const response = await request.get("/api/user/favorites", {
      headers: {
        "auth-token": "invalid.token.value",
      },
    });

    const text = await response.text();

    expect(response.status()).toBe(401);
    expect(text).toContain("Invalid Token");
  });

  test("Favorites endpoint rejects missing token", async ({ request }) => {
    test.setTimeout(15_000);

    const response = await request.get("/api/user/favorites");
    const json = await response.json();

    expect(response.status()).toBe(400);
    expect(json.error).toBe("Access denied.");
  });
}
