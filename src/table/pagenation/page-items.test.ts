import { pageItems } from "./page-items";

describe("pageItems", () => {
  test("shows every page when there are few", () => {
    expect(pageItems(1, 1)).toEqual([1]);
    expect(pageItems(3, 9)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  test("always shows the first and the last page, with the same number of items", () => {
    const cases: [number, unknown[]][] = [
      [1, [1, 2, 3, 4, 5, 6, 7, "gap-end", 12]],
      [5, [1, 2, 3, 4, 5, 6, 7, "gap-end", 12]],
      [6, [1, "gap-start", 4, 5, 6, 7, 8, "gap-end", 12]],
      [7, [1, "gap-start", 5, 6, 7, 8, 9, "gap-end", 12]],
      [8, [1, "gap-start", 6, 7, 8, 9, 10, 11, 12]],
      [12, [1, "gap-start", 6, 7, 8, 9, 10, 11, 12]],
    ];
    for (const [current, expected] of cases) {
      expect(pageItems(current, 12)).toEqual(expected);
      expect(pageItems(current, 12)).toHaveLength(9);
    }
  });

  test("the current page and its neighbours are always shown", () => {
    for (let current = 1; current <= 100; current++) {
      const items = pageItems(current, 100);
      for (const page of [current - 2, current - 1, current, current + 1, current + 2]) {
        if (page >= 1 && page <= 100) expect(items).toContain(page);
      }
      expect(items[0]).toBe(1);
      expect(items[items.length - 1]).toBe(100);
    }
  });
});

describe("pageItems for every page count up to 30", () => {
  for (let count = 1; count <= 30; count++) {
    test(`${count} pages`, () => {
      for (let current = 1; current <= count; current++) {
        const items = pageItems(current, count);
        const nums = items.filter((i): i is number => typeof i === "number");

        // first and last page, and the current page with its neighbours
        expect(nums[0]).toBe(1);
        expect(nums[nums.length - 1]).toBe(count);
        for (const p of [current - 2, current - 1, current, current + 1, current + 2]) {
          if (p >= 1 && p <= count) expect(nums).toContain(p);
        }

        items.forEach((item, i) => {
          if (typeof item === "number") {
            // pages next to each other are consecutive
            const next = items[i + 1];
            if (typeof next === "number") expect(next).toBe(item + 1);
          } else {
            // a gap always stands for at least 2 hidden pages
            const before = items[i - 1] as number;
            const after = items[i + 1] as number;
            expect(after - before - 1).toBeGreaterThanOrEqual(2);
          }
        });

        // no gap at all up to 9 pages; always 9 items above that
        if (count <= 9) expect(items).toHaveLength(count);
        else expect(items).toHaveLength(9);
      }
    });
  }
});
