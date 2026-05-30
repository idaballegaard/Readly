import { beforeEach, describe, expect, test } from "vitest";
import {
  clearAuthState,
  getAuthState,
  getAuthToken,
  getStoredUser,
  isAuthenticated,
} from "./useAuth";

describe("useAuth storage helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("returns null when auth is not stored", () => {
    expect(getAuthState()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });

  test("returns token and user when auth exists", () => {
    const authState = {
      token: "token-123",
      user: {
        id: "user-1",
        name: "Ida",
        email: "ida@example.com",
      },
    };

    localStorage.setItem("auth", JSON.stringify(authState));

    expect(getAuthState()).toEqual(authState);
    expect(getAuthToken()).toBe("token-123");
    expect(getStoredUser()).toEqual(authState.user);
    expect(isAuthenticated()).toBe(true);
  });

  test("clears broken auth JSON and returns null", () => {
    localStorage.setItem("auth", "not-json");

    expect(getAuthState()).toBeNull();
    expect(localStorage.getItem("auth")).toBeNull();
  });

  test("clearAuthState removes auth from storage", () => {
    localStorage.setItem("auth", JSON.stringify({ token: "x", user: { email: "e" } }));

    clearAuthState();

    expect(getAuthState()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });
});
