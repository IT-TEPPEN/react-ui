import { IIndex } from "./type";

/**
 * The top-left and bottom-right cells of a selection. A selection can be
 * made bottom-up or right-to-left, so its start is not always the top-left.
 */
export function selectionBounds(
  start: IIndex,
  end: IIndex
): { start: IIndex; end: IIndex } {
  return {
    start: {
      rowIndex: Math.min(start.rowIndex, end.rowIndex),
      colIndex: Math.min(start.colIndex, end.colIndex),
    },
    end: {
      rowIndex: Math.max(start.rowIndex, end.rowIndex),
      colIndex: Math.max(start.colIndex, end.colIndex),
    },
  };
}
