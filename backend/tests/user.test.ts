import { test, expect } from "@playwright/test";

export default function userTestCollection() {
  test("Valid user registration info", async ({ request }) => {
    test.setTimeout(10_000);

    const uniqueEmail = `idaballegaard+${Date.now()}@msn.com`;

    // Arrange
    const user = {
      name: "Ida Ballegaard",
      email: uniqueEmail,
      password: "12345678",
    };

    // Act
    const response = await request.post("/api/user/register", { data: user });
    const json = await response.json();

    // Assert
    expect(response.status()).toBe(201);
    expect(json.error).toEqual(null);
  });

  test("Invalid user registration info", async ({ request }) => {
    test.setTimeout(10_000);

    const uniqueEmail = `idaballegaard+${Date.now()}@msn.com`;

    // Arrange
    const user = {
      name: "Ida Ballegaard",
      email: uniqueEmail,
      password: "1234", // invalid password according to Joi
    };

    // Act
    const response = await request.post("/api/user/register", { data: user });
    const json = await response.json();

    // Assert
    expect(response.status()).toBe(400);
    //console.log(json.error);
    expect(json.error).toEqual(
      '"password" length must be at least 6 characters long',
    );
  });
}
