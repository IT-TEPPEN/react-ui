import { formatDateForCopy, formatDatetimeForCopy } from "./format";

// Tests run in Asia/Tokyo (see jest.global-setup.js), where UTC-based
// formatting would shift these values to the previous day.
describe("copy formatting", () => {
  test("runs in a time zone ahead of UTC", () => {
    expect(new Date(2024, 0, 1).getTimezoneOffset()).toBe(-540);
  });

  test("formats a date in the local time zone", () => {
    expect(formatDateForCopy(new Date(2024, 0, 1))).toBe("2024-01-01");
    expect(formatDateForCopy(new Date(2024, 11, 31, 8, 59))).toBe(
      "2024-12-31"
    );
  });

  test("formats a datetime in the local time zone", () => {
    expect(formatDatetimeForCopy(new Date(2024, 0, 1, 0, 5, 9))).toBe(
      "2024-01-01 00:05:09"
    );
  });

  test("returns an empty string for missing or invalid values", () => {
    for (const value of [undefined, null, "", "not a date"]) {
      expect(formatDateForCopy(value)).toBe("");
      expect(formatDatetimeForCopy(value)).toBe("");
    }
  });
});
