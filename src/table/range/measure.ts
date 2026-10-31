import { ITableIdGenerator } from "../id/interface";
import { IIndex } from "./type";

export type TBox = { top: number; left: number; width: number; height: number };

/**
 * Where a cell is inside the table's scroll area (the coordinates absolutely
 * positioned boxes use). Measured from the DOM, so it follows pinned
 * columns, which stay put while the rest scrolls sideways.
 */
export function measureCell(
  idGenerator: ITableIdGenerator,
  cell: IIndex
): TBox | null {
  const cellElement = document.getElementById(
    idGenerator.getTableCellId({
      rowIndex: cell.rowIndex,
      columnIndex: cell.colIndex,
    })
  );
  const tableElement = document.getElementById(idGenerator.getTableId());
  if (!cellElement || !tableElement) return null;

  const rect = cellElement.getBoundingClientRect();
  const rectTable = tableElement.getBoundingClientRect();
  return {
    top: rect.top - rectTable.top + tableElement.scrollTop,
    left: rect.left - rectTable.left + tableElement.scrollLeft,
    width: rect.width,
    height: rect.height,
  };
}

/** The box around a range of cells, from `start` to `end`. */
export function measureRange(
  idGenerator: ITableIdGenerator,
  start: IIndex,
  end: IIndex
): TBox | null {
  const a = measureCell(idGenerator, start);
  const b = measureCell(idGenerator, end);
  if (!a || !b) return null;

  const top = Math.min(a.top, b.top);
  const left = Math.min(a.left, b.left);
  return {
    top,
    left,
    width: Math.max(a.left + a.width, b.left + b.width) - left,
    height: Math.max(a.top + a.height, b.top + b.height) - top,
  };
}
