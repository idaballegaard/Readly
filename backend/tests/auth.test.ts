import { test, expect } from "@playwright/test";
import { buildTestUser } from "./helpers";

export default function authTestCollection() {
  test("User can login after registration", async ({ request }) => {
    test.setTimeout(15_000);

    const user = buildTestUser("auth-success");

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
    const loginJson = await loginResponse.json();

    expect(loginResponse.status()).toBe(200);
    expect(loginJson.error).toBe(null);
    expect(loginJson.data.token).toBeTruthy();
    expect(loginJson.data.user.email).toBe(user.email);
  });

  test("Login fails with invalid password", async ({ request }) => {
    test.setTimeout(15_000);

    const user = buildTestUser("auth-invalid-password");

    const registerResponse = await request.post("/api/user/register", {
      data: user,
    });
    expect(registerResponse.status()).toBe(201);

    const loginResponse = await request.post("/api/user/login", {
      data: {
        email: user.email,
        password: "wrong-password",
      },
    });
    const loginJson = await loginResponse.json();

    expect(loginResponse.status()).toBe(400);
    expect(loginJson.error).toBe("Password or email is wrong.");
  });

  test("Duplicate registration email is rejected", async ({ request }) => {
    test.setTimeout(15_000);

    const user = buildTestUser("auth-duplicate");

    const firstRegister = await request.post("/api/user/register", {
      data: user,
    });
    expect(firstRegister.status()).toBe(201);

    const secondRegister = await request.post("/api/user/register", {
      data: user,
    });
    const secondRegisterJson = await secondRegister.json();

    expect(secondRegister.status()).toBe(400);
    expect(secondRegisterJson.error).toBe("Email already exists.");
  });

  test("Login fails with unknown email", async ({ request }) => {
    test.setTimeout(15_000);

    const response = await request.post("/api/user/login", {
      data: {
        email: "unknown-user@test.com",
        password: "12345678",
      },
    });
    const json = await response.json();

    expect(response.status()).toBe(400);
    expect(json.error).toBe("Password or email is wrong.");
  });
}
