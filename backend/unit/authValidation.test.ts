import { describe, expect, test } from "vitest";
import {
  validateUserLoginInfo,
  validateUserRegistrationInfo,
} from "../src/controllers/authController";

describe("auth validation", () => {
  test("accepts valid registration payload", () => {
    const result = validateUserRegistrationInfo({
      name: "Ida Ballegaard",
      email: "ida@example.com",
      password: "12345678",
    } as any);

    expect(result.error).toBeUndefined();
  });

  test("rejects short registration password", () => {
    const result = validateUserRegistrationInfo({
      name: "Ida Ballegaard",
      email: "ida@example.com",
      password: "1234",
    } as any);

    expect(result.error?.details[0].message).toContain("at least 6 characters long");
  });

  test("rejects login payload without email", () => {
    const result = validateUserLoginInfo({
      password: "12345678",
    } as any);

    expect(result.error?.details[0].message).toContain('"email" is required');
  });
});
