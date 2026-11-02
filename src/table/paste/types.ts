import { DataObject, DataRecord } from "../table/type";

/** Errors reported to `onPasteError` when pasted data cannot be applied. */
export type TPasteError = {
  type: "NOT_ENOUGH_ROWS" | "NOT_ENOUGH_COLUMNS" | "NOT_EDITABLE_COLUMN";
  message: string;
};

export type TPasteReducerReturn = {
  onPaste: (pasteData: string[][]) => void;
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
