import {
  DataObject,
  DataRecord,
  TConditionalFormatting,
  TTableColumn,
} from "../table/type";

export function generateFormattingString(
  row: DataObject<DataRecord>,
  cols: TTableColumn<DataRecord>[],
  conditionalFormattings?: TConditionalFormatting<DataRecord>[]
): string {
  if (!conditionalFormattings) {
    return Array(cols.length).fill("").join(",");
  }

  const formats = conditionalFormattings.reduce((acc, formatting) => {
    const { condition, key, style } = formatting;
    const colIndex = cols.findIndex((col) => col.key === key);

    if (colIndex === -1 || acc[colIndex] !== "" || !condition(row)) {
      return acc;
    }

    acc[colIndex] = style;

    return acc;
  }, Array(cols.length).fill(""));

  return formats.join(",");
}
