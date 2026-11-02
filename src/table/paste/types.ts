import { DataObject, DataRecord } from "../table/type";

/** Errors reported to `onPasteError` when pasted data cannot be applied. */
export type TPasteError = {
  type: "NOT_ENOUGH_ROWS" | "NOT_ENOUGH_COLUMNS" | "NOT_EDITABLE_COLUMN";
  message: string;
};

export type TPasteReducerReturn = {
  onPaste: (pasteData: string[][]) => void;
  /**
   * Empties the selected cells that can be empty. Returns false when it
   * cannot run (no onUpdateRow, or nothing selected).
   */
  emptySelection: () => boolean;
  /**
   * Copies the top row of the selection to the rows below it. Returns false
   * when it cannot run (no onUpdateRow, or one row selected).
   */
  fillDown: () => boolean;
};

/** onUpdateRow as the table calls it inside, where rows have no own type. */
export type TUpdateRowFunction = (
  newRow: DataObject<DataRecord>,
  oldRow: DataObject<DataRecord>
) => void;

export type TPasteHookArguments = {
  onUpdateRowFunction?: TUpdateRowFunction;
  onPasteError?: (error: TPasteError) => void;
};
