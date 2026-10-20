/**
 * Parses clipboard text copied from a spreadsheet (Excel, Google Sheets)
 * into rows of cells.
 *
 * - Cells are separated by tabs and rows by line breaks.
 * - A cell wrapped in double quotes may contain tabs and line breaks, and
 *   `""` inside it stands for one `"` (this is how Excel copies such cells).
 * - Commas are kept as part of the value, so "1,000" stays one cell.
 * - Only the final line break is dropped; empty cells are kept.
 */
export function parseClipboardText(text: string): string[][] {
  const source = text.replace(/\r\n?/g, "\n").replace(/\n$/, "");

  if (source === "") {
    return [];
  }

  const rows: string[][] = [];
  let row: string[] = [];
  let i = 0;

  while (true) {
    const quoted = source[i] === '"' ? readQuotedCell(source, i) : null;
    let cell: string;

    if (quoted) {
      cell = quoted.value;
      i = quoted.next;
    } else {
      let end = i;
      while (end < source.length && source[end] !== "\t" && source[end] !== "\n") {
        end++;
      }
      cell = source.slice(i, end);
      i = end;
    }

    row.push(cell);

    if (i >= source.length) {
      rows.push(row);
      return rows;
    }

    if (source[i] === "\n") {
      rows.push(row);
      row = [];
    }
    i++;
  }
}

/**
 * Reads a quoted cell starting at `start`. Returns null if the text is not a
 * properly closed quoted cell, in which case it is read as plain text.
 */
function readQuotedCell(
  source: string,
  start: number
): { value: string; next: number } | null {
  let value = "";
  let i = start + 1;

  while (i < source.length) {
    if (source[i] === '"') {
      if (source[i + 1] === '"') {
        value += '"';
        i += 2;
        continue;
      }

      const after = source[i + 1];
      if (after === undefined || after === "\t" || after === "\n") {
        return { value, next: i + 1 };
      }
      return null;
    }

    value += source[i];
    i++;
  }

  return null;
}
