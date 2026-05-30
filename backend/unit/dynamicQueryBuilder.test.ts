import { describe, expect, test } from "vitest";
import { buildDynamicQuery } from "../src/controllers/dynamicQueryBuilder";

function createMockModel(instances: Record<string, string>) {
  return {
    schema: {
      path: (field: string) => {
        const instance = instances[field];
        return instance ? { instance } : undefined;
      },
    },
  } as any;
}

describe("buildDynamicQuery", () => {
  test("builds case-insensitive regex query for string fields", () => {
    const model = createMockModel({ title: "String" });

    const result = buildDynamicQuery(model, { key: "title", value: "harry" });

    expect(result).toEqual({
      title: { $regex: "harry", $options: "i" },
    });
  });

  test("builds numeric query for number fields", () => {
    const model = createMockModel({ pages: "Number" });

    const result = buildDynamicQuery(model, { key: "pages", value: "300" });

    expect(result).toEqual({ pages: 300 });
  });

  test("throws for unknown fields", () => {
    const model = createMockModel({});

    expect(() =>
      buildDynamicQuery(model, { key: "unknownField", value: "x" }),
    ).toThrow("Unknown field: unknownField");
  });
});
