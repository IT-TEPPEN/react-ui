import { DataObject } from "../table/type";

/** Errors reported to `onPasteError` when pasted data cannot be applied. */
export type TPasteError = {
  type: "NOT_ENOUGH_ROWS" | "NOT_ENOUGH_COLUMNS" | "NOT_EDITABLE_COLUMN";
  message: string;
};

export type TPasteReducerReturn = {
  setRows: (rows: DataObject<any>[]) => void;
  onPaste: (pasteData: string[][]) => void;
};

export type TPasteHookArguments = {
  rows: any[];
  cols: any[];
  onUpdateRowFunction?: (newRow: any, oldRow: any) => void;
  onPasteError?: (error: TPasteError) => void;
};
