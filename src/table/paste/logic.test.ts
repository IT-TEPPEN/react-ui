import { paste } from "./logic";

const numberCol = { key: "price", type: "number", editable: true, onCellBlur: () => {} };
const validators = {
  // Same rule as the number column validator.
  price: (v: string) => /^-?[0-9]+(\.[0-9]+)?$/.test(v),
};

function pasteNumber(text: string) {
  return paste({
    pasteData: [[text]],
    currentRows: [{ id: "1", price: 0 }],
    currentCols: [numberCol as any],
    pasteArea: { start: { rowIndex: 0, colIndex: 0 }, end: { rowIndex: 0, colIndex: 0 } },
    validators,
  });
}

describe("pasting into number columns", () => {
  test.each([
    ["1,000", 1000],
    ["-1,234,567.5", -1234567.5],
    [" 42 ", 42],
    ["3.14", 3.14],
  ])("accepts %j as %d", (text, expected) => {
    const res = pasteNumber(text);
    expect(res.isError).toBe(false);
    if (!res.isError) {
      expect(res.updateArgument[0].newRow.price).toBe(expected);
    }
  });

  test.each(["1,00", "1,0000", ",100", "abc"])(
    "rejects %j, which is not a grouped number",
    (text) => {
      const res = pasteNumber(text);
      expect(res.isError && res.type).toBe("ValidationError");
    }
  );
});
