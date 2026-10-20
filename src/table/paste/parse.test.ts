import { parseClipboardText } from "./parse";

describe("parseClipboardText", () => {
  test("splits cells by tab and rows by line break", () => {
    expect(parseClipboardText("a\tb\r\nc\td\r\n")).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });

  test("keeps commas inside a cell", () => {
    expect(parseClipboardText("1,000\tabc")).toEqual([["1,000", "abc"]]);
  });

  test("keeps empty cells at the start and end of a row", () => {
    expect(parseClipboardText("\ta\t\n")).toEqual([["", "a", ""]]);
    expect(parseClipboardText("a\t\nb\t")).toEqual([
      ["a", ""],
      ["b", ""],
    ]);
  });

  test("keeps empty rows in the middle", () => {
    expect(parseClipboardText("a\n\nb")).toEqual([["a"], [""], ["b"]]);
  });

  test("reads quoted cells with line breaks, tabs and quotes", () => {
    expect(
      parseClipboardText('"line1\nline2"\t"say ""hi"""\t"a\tb"\nx')
    ).toEqual([["line1\nline2", 'say "hi"', "a\tb"], ["x"]]);
  });

  test("reads unclosed or partial quotes as plain text", () => {
    expect(parseClipboardText('"abc\tdef')).toEqual([['"abc', "def"]]);
    expect(parseClipboardText('"5" inch\tx')).toEqual([['"5" inch', "x"]]);
  });

  test("keeps surrounding spaces", () => {
    expect(parseClipboardText(" a \t b")).toEqual([[" a ", " b"]]);
  });

  test("returns no rows for empty text", () => {
    expect(parseClipboardText("")).toEqual([]);
    expect(parseClipboardText("\r\n")).toEqual([]);
  });

  test("a single empty cell is one row with one empty cell", () => {
    expect(parseClipboardText("\t")).toEqual([["", ""]]);
  });
});
