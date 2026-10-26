import { compareText, normalizeForSearch, parseNumberText } from "./normalize";

describe("normalizeForSearch", () => {
  test.each([
    ["Tokyo", "TOKYO"],
    ["ＡＢＣ", "abc"],
    ["ﾄｳｷｮｳ", "トウキョウ"],
    ["とうきょう", "トウキョウ"],
    ["１２３", "123"],
  ])("%s and %s are written the same way", (a, b) => {
    expect(normalizeForSearch(a)).toBe(normalizeForSearch(b));
  });

  test("keeps kanji and other text as is", () => {
    expect(normalizeForSearch("東京都")).toBe("東京都");
  });
});

describe("compareText", () => {
  test("orders text the Japanese way", () => {
    const list = ["b", "A", "いとう", "10", "アベ", "東京", "2", "うえの", "a"];
    expect([...list].sort(compareText)).toEqual([
      "2", "10", "a", "A", "b", "アベ", "いとう", "うえの", "東京",
    ]);
  });
});

describe("parseNumberText", () => {
  test.each([
    ["42", 42],
    [" -3.5 ", -3.5],
    ["１２", 12],
    ["1,000", 1000],
    ["ー5", -5],
  ])("%j is %d", (text, expected) => {
    expect(parseNumberText(text)).toBe(expected);
  });

  test.each(["", " ", "abc", "1,00", "1.2.3"])("%j is not a number", (text) => {
    expect(parseNumberText(text)).toBeNull();
  });
});
