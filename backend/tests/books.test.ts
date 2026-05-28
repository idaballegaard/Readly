import { test, expect } from "@playwright/test";
import { buildTestBook, registerAndLogin } from "./helpers";

export default function booksTestCollection() {
  test("Book CRUD flow works for authenticated user", async ({ request }) => {
    test.setTimeout(15_000);

    const { token } = await registerAndLogin(request, "books-crud");

    const createResponse = await request.post("/api/books", {
      headers: {
        "auth-token": token,
      },
      data: buildTestBook(),
    });
    const createdBook = await createResponse.json();

    expect(createResponse.status()).toBe(201);
    expect(createdBook._id).toBeTruthy();

    const bookId = createdBook._id;

    const getByIdResponse = await request.get(`/api/books/${bookId}`);
    const getByIdJson = await getByIdResponse.json();

    expect(getByIdResponse.status()).toBe(200);
    expect(getByIdJson).toHaveLength(1);
    expect(getByIdJson[0]._id).toBe(bookId);

    const updateResponse = await request.put(`/api/books/${bookId}`, {
      headers: {
        "auth-token": token,
      },
      data: {
        title: "The Updated Playwright Journey",
        rating: 4.9,
      },
    });

    expect(updateResponse.status()).toBe(200);

    const getUpdatedResponse = await request.get(`/api/books/${bookId}`);
    const getUpdatedJson = await getUpdatedResponse.json();

    expect(getUpdatedResponse.status()).toBe(200);
    expect(getUpdatedJson[0].title).toBe("The Updated Playwright Journey");
    expect(getUpdatedJson[0].rating).toBe(4.9);

    const deleteResponse = await request.delete(`/api/books/${bookId}`, {
      headers: {
        "auth-token": token,
      },
    });

    expect(deleteResponse.status()).toBe(200);

    const getAfterDeleteResponse = await request.get(`/api/books/${bookId}`);
    const getAfterDeleteJson = await getAfterDeleteResponse.json();

    expect(getAfterDeleteResponse.status()).toBe(200);
    expect(getAfterDeleteJson).toHaveLength(0);
  });

  test("Highest rated endpoint returns top 4 books sorted by rating", async ({ request }) => {
    test.setTimeout(15_000);

    const { token } = await registerAndLogin(request, "books-highest-rated");

    const booksToCreate = [
      buildTestBook({ title: "Book A", rating: 1.5 }),
      buildTestBook({ title: "Book B", rating: 4.1 }),
      buildTestBook({ title: "Book C", rating: 2.9 }),
      buildTestBook({ title: "Book D", rating: 5.0 }),
      buildTestBook({ title: "Book E", rating: 3.8 }),
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

    const highestRatedResponse = await request.get("/api/books/highest-rated");
    const highestRatedJson = await highestRatedResponse.json();

    expect(highestRatedResponse.status()).toBe(200);
    expect(highestRatedJson).toHaveLength(4);

    const ratings = highestRatedJson.map((book: { rating: number }) => book.rating);
    expect(ratings).toEqual([...ratings].sort((a, b) => b - a));
    expect(ratings[0]).toBe(5);
  });

  test("Creating a book without token is rejected", async ({ request }) => {
    test.setTimeout(15_000);

    const response = await request.post("/api/books", {
      data: buildTestBook(),
    });
    const json = await response.json();

    expect(response.status()).toBe(400);
    expect(json.error).toBe("Access denied.");
  });

  test("Updating a non-existing book returns 404", async ({ request }) => {
    test.setTimeout(15_000);

    const { token } = await registerAndLogin(request, "books-update-missing");
    const nonExistingBookId = "507f1f77bcf86cd799439011";

    const response = await request.put(`/api/books/${nonExistingBookId}`, {
      headers: {
        "auth-token": token,
      },
      data: {
        title: "Will Not Be Updated",
      },
    });
    const text = await response.text();

    expect(response.status()).toBe(404);
    expect(text).toContain(`Cannot update book with ud=${nonExistingBookId}`);
  });

  test("Deleting a non-existing book returns 404", async ({ request }) => {
    test.setTimeout(15_000);

    const { token } = await registerAndLogin(request, "books-delete-missing");
    const nonExistingBookId = "507f1f77bcf86cd799439011";

    const response = await request.delete(`/api/books/${nonExistingBookId}`, {
      headers: {
        "auth-token": token,
      },
    });
    const text = await response.text();

    expect(response.status()).toBe(404);
    expect(text).toContain(`Cannot delete book with id=${nonExistingBookId}`);
  });
}
