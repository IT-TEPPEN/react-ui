import { DataObject, TTableColumn } from "../table/type";

type TCopyState = {
  rows: DataObject<any>[];
  cols: TTableColumn<any>[];
};

type TCopyAction =
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
    };

export type TCopyReducer = (
  state: TCopyState,
  action: TCopyAction
) => TCopyState;

export type TCopyActionContext = {
  copy: () => void;
  setRows: (rows: DataObject<any>[]) => void;
};

export type TReturnCopyReducer = {
  actions: TCopyActionContext;
};
