import { DataObject, DataRecord, TTableColumn } from "../table/type";
import { formatDateForCopy, formatDatetimeForCopy } from "../copy/format";

/**
 * Builds the text that the all-columns keyword search looks in for a row:
 * what each column shows (the label of a select option, the rendered text of
 * a date), joined. Columns with disableFilter are left out.
 */
export function buildKeywordTextGetter<T extends DataRecord>(
  cols: TTableColumn<T>[]
): (row: DataObject<T>) => string {
  const getters = cols
    .filter((col) => !col.disableFilter)
    .map((col): ((row: DataObject<T>) => string) => {
      const key = col.key;

      switch (col.type) {
        case "select": {
          const labels = new Map(col.options.map((o) => [o.value, o.label]));
          return (row) => {
            const value = row[key];
            return labels.get(value as string) ?? toText(value);
          };
        }
        case "date":
        case "datetime": {
          const format =
            col.type === "date" ? formatDateForCopy : formatDatetimeForCopy;
          return (row) => {
            const value = row[key];
            if (!(value instanceof Date)) return toText(value);

            const shown = col.render(value);
            // The rendered text when it is text; otherwise a plain date.
            return typeof shown === "string" || typeof shown === "number"
              ? `${shown} ${format(value)}`
              : format(value);
          };
        }
        default:
          return (row) => toText(row[key]);
      }
    });

  return (row) => getters.map((get) => get(row)).join("\n");
}

function toText(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}
