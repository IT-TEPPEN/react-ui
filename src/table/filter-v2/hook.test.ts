import { isMatchCondition } from "./hook";
import { Condition } from "../../search-bar";
import { DEFAULT_SEARCH_OPERATOR } from "../../share/search-operator/constant";

function operator(key: string) {
  const op = DEFAULT_SEARCH_OPERATOR.find((o) => o.key === key);
  if (!op) throw new Error(`operator ${key} not found`);
  return op;
}

function dateCondition(key: string, value: Date): Condition {
  return {
    target: { key: "d", label: "日付", type: "date" },
    operator: operator(key),
    input: { type: "single date", payload: { value } },
  } as Condition;
}

function stringCondition(key: string, value: string): Condition {
  return {
    target: { key: "s", label: "文字", type: "string" },
    operator: operator(key),
    input: { type: "single string", payload: { value } },
  } as Condition;
}

const match = (condition: Condition, value: unknown) =>
  isMatchCondition(condition, value, condition.input);

describe("date filter", () => {
  // The search bar gives a date at midnight; rows may have a time of day.
  const jan1 = new Date(2024, 0, 1);
  const jan1Morning = new Date(2024, 0, 1, 10, 30);
  const dec31Night = new Date(2023, 11, 31, 23, 59);
  const jan2 = new Date(2024, 0, 2, 0, 0);

  test.each([
    ["date:eq", [false, true, false]],
    ["date:neq", [true, false, true]],
    ["date:gt", [false, false, true]],
    ["date:gte", [false, true, true]],
    ["date:lt", [true, false, false]],
    ["date:lte", [true, true, false]],
  ])("%s compares by day", (key, expected) => {
    const condition = dateCondition(key, jan1);
    expect(
      [dec31Night, jan1Morning, jan2].map((value) => match(condition, value))
    ).toEqual(expected);
  });

  test("rows without a date do not match and do not throw", () => {
    const condition = dateCondition("date:gte", jan1);
    for (const value of [undefined, null, "", "not a date"]) {
      expect(match(condition, value)).toBe(false);
    }
  });

  test("date strings are compared as dates", () => {
    expect(match(dateCondition("date:eq", jan1), "2024-01-01T10:00:00")).toBe(
      true
    );
  });
});

describe("string filter", () => {
  test("like / not like work with numbers and empty values", () => {
    expect(match(stringCondition("string:like", "12"), 1234)).toBe(true);
    expect(match(stringCondition("string:like", "x"), undefined)).toBe(false);
    expect(match(stringCondition("string:not_like", "x"), undefined)).toBe(
      true
    );
  });
});
