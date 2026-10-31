import { DataObject, DataRecord, TTableColumn } from "../table/type";
import { formatDateForCopy, formatDatetimeForCopy } from "../copy/format";
import { filterValueOf, isFilterable } from "../table/column-options";

/**
 * Builds the text that the all-columns keyword search looks in for a row:
 * each column's value and what it shows (the label of a select option, text
 * returned by render), joined. Only columns that can be filtered are used
 * (see isFilterable), so the value of a render column such as an id is not
 * searched unless the column opts in.
 */
export function buildKeywordTextGetter<T extends DataRecord>(
  cols: TTableColumn<T>[]
): (row: DataObject<T>) => string {
  const getters = cols
    .filter((col) => isFilterable(col))
    .map((col): ((row: DataObject<T>) => string) => {
      switch (col.type) {
        case "select": {
          const labels = new Map(col.options.map((o) => [o.value, o.label]));
          return (row) => {
            const value = filterValueOf(col, row);
            const text = labels.get(value as string) ?? toText(value);
            return withRenderedText(col, text, row);
          };
        }
        case "date":
        case "datetime": {
          const format =
            col.type === "date" ? formatDateForCopy : formatDatetimeForCopy;
          return (row) => {
            const value = filterValueOf(col, row);
            if (!(value instanceof Date)) return toText(value);

            const shown = col.render(value);
            // The rendered text when it is text; otherwise a plain date.
            return typeof shown === "string" || typeof shown === "number"
              ? `${shown} ${format(value)}`
              : format(value);
          };
        }
        default:
          return (row) =>
            withRenderedText(col, toText(filterValueOf(col, row)), row);
      }
    });

  return (row) => getters.map((get) => get(row)).join("\n");
}

/**
 * Adds the text a read-only column's render returns, when it returns text
 * (or a number). A component's inner text cannot be read, so only the value
 * is searched then.
 */
function withRenderedText<T extends DataRecord>(
  col: TTableColumn<T>,
  text: string,
  row: DataObject<T>
): string {
  if (col.editable || col.type === "date" || col.type === "datetime" || !col.render) {
    return text;
  }

  try {
    const shown = col.render(row[col.key] as never, row);
    return typeof shown === "string" || typeof shown === "number"
      ? `${text}\n${shown}`
      : text;
  } catch {
    return text;
  }
}

function toText(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}
