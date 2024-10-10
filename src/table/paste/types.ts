import { DataObject, TTableColumn } from "../type";

type TPasteState = {
  rows: DataObject<any>[];
  cols: TTableColumn<any>[];
  colValidators: { [key: string]: (value: any) => boolean };
  onUpdateRowFunction?: (newRow: any, oldRow: any) => void;
  updateParameters: {
    arguments: { newRow: any; oldRow: any }[];
    timing: number;
  };
} & (
  | {
      isFocused: false;
    }
  | {
      isFocused: true;
      rowIndex: number;
      colIndex: number;
    }
);

type IPasteAction =
  | {
      type: "setRows";
      payload: {
        rows: DataObject<any>[];
      };
    }
  | {
      type: "setCols";
      payload: {
        cols: TTableColumn<any>[];
      };
    }
  | {
      type: "setColValidators";
      payload: {
        colValidators: { [key: string]: (value: any) => boolean };
      };
    }
  | {
      type: "setOnUpdateRowFunction";
      payload: {
        onUpdateRowFunction?: (newRow: any, oldRow: any) => void;
      };
    }
  | {
      type: "onPaste";
      payload: {
        pasteData: string[][];
      };
    }
  | {
      type: "focus";
      payload: {
        rowIndex: number;
        colIndex: number;
      };
    }
  | { type: "unfocus" };

export type TPasteReducer = (
  state: TPasteState,
  action: IPasteAction
) => TPasteState;

export type TPasteReducerReturn = {
  setRows: (rows: DataObject<any>[]) => void;
  setCols: (cols: TTableColumn<any>[]) => void;
  setColValidators: (colValidators: {
    [key: string]: (value: any) => boolean;
  }) => void;
  setOnUpdateRowFunction: (
    onUpdateRowFunction?: (newRow: any, oldRow: any) => void
  ) => void;
  onPaste: (pasteData: string[][]) => void;
};
