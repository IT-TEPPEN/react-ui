import { DataObject, TTableColumn } from "../table/type";

type TCopyState = {
  rows: DataObject<any>[];
  cols: TTableColumn<any>[];
  copiedAt?: Date;
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
    }
  | {
      type: "copied";
    };

export type TCopyReducer = (
  state: TCopyState,
  action: TCopyAction
) => TCopyState;

export type TCopyStateContext = Pick<TCopyState, "copiedAt">;

export type TCopyActionContext = {
  copy: () => void;
  setRows: (rows: DataObject<any>[]) => void;
};

export type TReturnCopyReducer = {
  states: TCopyStateContext;
  actions: TCopyActionContext;
};
