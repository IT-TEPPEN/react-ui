import { Reducer } from "react";

export interface IIndex {
  rowIndex: number;
  colIndex: number;
}

export interface IRangeConstraint {
  maxRowIndex: number;
  maxColIndex: number;
}

export type TRangeState = {
  constraint: IRangeConstraint;
} & (
  | {
      isSelecting: false;
    }
  | {
      isSelecting: true;
      start: IIndex;
      end: IIndex;
    }
);

export type TRangeAction =
  | { type: "setMax"; payload: { maxRowIndex: number; maxColIndex: number } }
  | { type: "start"; payload: { rowIndex: number; colIndex: number } }
  | { type: "end"; payload: { rowIndex: number; colIndex: number } }
  | { type: "moveUp" }
  | { type: "moveDown" }
  | { type: "moveLeft" }
  | { type: "moveRight" }
  | { type: "extendUp" }
  | { type: "extendDown" }
  | { type: "extendLeft" }
  | { type: "extendRight" }
  | { type: "reset" };

export type TRangeReducer = Reducer<TRangeState, TRangeAction>;

export type TRangeStateContext = TRangeState;

export type TRangeActionContext = {
  start: (rowIndex: number, colIndex: number) => void;
  end: (rowIndex: number, colIndex: number) => void;
  moveUp: () => void;
  moveDown: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  extendUp: () => void;
  extendDown: () => void;
  extendLeft: () => void;
  extendRight: () => void;
  reset: () => void;
};

export type TReturnRangeReducer = {
  state: TRangeStateContext;
  actions: TRangeActionContext;
};
