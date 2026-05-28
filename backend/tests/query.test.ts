import { test, expect } from "@playwright/test";
import { buildTestBook, registerAndLogin } from "./helpers";

export default function queryTestCollection() {
  test("Generic query returns books for a valid string field", async ({ request }) => {
    test.setTimeout(15_000);

    const { token } = await registerAndLogin(request, "query-generic-string");

    const booksToCreate = [
      buildTestBook({ title: "Fantasy Target", genre: "Fantasy" }),
      buildTestBook({ title: "Sci-Fi Other", genre: "Sci-Fi" }),
    ];

    for (const book of booksToCreate) {
      const createResponse = await request.post("/api/books", {
        headers: {
          "auth-token": token,
        },
        data: book,
      });
      expect(createResponse.status()).toBe(201);
    }

    const response = await request.post("/api/books/query", {
      data: {
        key: "genre",
        value: "fan",
      },
    });
    const json = await response.json();

    expect(response.status()).toBe(200);
    expect(json).toHaveLength(1);
    expect(json[0].title).toBe("Fantasy Target");
  });

  test("Generic query returns 500 for unknown field", async ({ request }) => {
    test.setTimeout(15_000);

    const response = await request.post("/api/books/query", {
      data: {
        key: "unknownField",
        value: "test",
      },
    });
    const json = await response.json();

    expect(response.status()).toBe(500);
    expect(String(json)).toContain("Unknown field: unknownField");
  });

  test("Path query requires token and supports case-insensitive match", async ({ request }) => {
    test.setTimeout(15_000);

    const { token } = await registerAndLogin(request, "query-path-auth");

    const createResponse = await request.post("/api/books", {
      headers: {
        "auth-token": token,
      },
      data: buildTestBook({ title: "Author Match", author: "J.K. RowLiNg" }),
    });

    expect(createResponse.status()).toBe(201);

    const unauthorized = await request.get("/api/books/author/rowling");
    const unauthorizedJson = await unauthorized.json();

    expect(unauthorized.status()).toBe(400);
    expect(unauthorizedJson.error).toBe("Access denied.");

    const authorized = await request.get("/api/books/author/rowling", {
      headers: {
        "auth-token": token,
      },
    });
    const authorizedJson = await authorized.json();

    expect(authorized.status()).toBe(200);
    expect(authorizedJson).toHaveLength(1);
    expect(authorizedJson[0].author).toBe("J.K. RowLiNg");
  });
}
