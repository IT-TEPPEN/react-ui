import { DataObject, DataRecord, TTableColumn } from "../table/type";
import { IIndex } from "../range/type";

type TRow = DataObject<DataRecord>;
type TColumn = TTableColumn<DataRecord>;
type TArea = { start: IIndex; end: IIndex };
export type TRowUpdate = { newRow: TRow; oldRow: TRow };

/**
 * Whether a cell of the column can be emptied: an editable text column that
 * accepts empty text, or an editable select column with allowEmpty. Number
 * columns always hold a number.
 */
export function canEmpty(col: TColumn): boolean {
  if (!col.editable) return false;

  if (col.type === "select") return !!col.allowEmpty;
  if (col.type !== "string") return false;

  const constraints = col.constraints;
  if (constraints?.minLength && constraints.minLength > 0) return false;
  if (constraints?.pattern && !new RegExp(constraints.pattern).test("")) {
    return false;
  }
  return true;
}

/** Applies a change to each row of the area, keeping rows that do not change. */
function updateRows(
  rows: TRow[],
  area: TArea,
  change: (row: TRow, rowIndex: number) => TRow
): TRowUpdate[] {
  const updates: TRowUpdate[] = [];
  for (let r = area.start.rowIndex; r <= area.end.rowIndex; r++) {
    const oldRow = rows[r];
    if (!oldRow) continue;
    const newRow = change(oldRow, r);
    if (newRow !== oldRow) updates.push({ newRow, oldRow });
  }
  return updates;
}

/** Empties the cells of the area that can be emptied (see canEmpty). */
export function emptyCells(rows: TRow[], cols: TColumn[], area: TArea) {
  const targets = cols
    .slice(area.start.colIndex, area.end.colIndex + 1)
    .filter(canEmpty);

  return updateRows(rows, area, (row) => {
    let newRow = row;
    for (const col of targets) {
      if (row[col.key] !== "" && row[col.key] !== undefined && row[col.key] !== null) {
        newRow = { ...newRow, [col.key]: "" };
      }
    }
    return newRow;
  });
}

/**
 * Copies the top row of the area to the rows below it, in the editable
 * columns (like Ctrl+D in a spreadsheet).
 */
export function fillDown(rows: TRow[], cols: TColumn[], area: TArea) {
  const top = rows[area.start.rowIndex];
  if (!top) return [];

  const targets = cols
    .slice(area.start.colIndex, area.end.colIndex + 1)
    .filter((col) => col.editable);

  return updateRows(
    rows,
    { start: { ...area.start, rowIndex: area.start.rowIndex + 1 }, end: area.end },
    (row) => {
      let newRow = row;
      for (const col of targets) {
        if (row[col.key] !== top[col.key]) {
          newRow = { ...newRow, [col.key]: top[col.key] };
        }
      }
      return newRow;
    }
  );
}
