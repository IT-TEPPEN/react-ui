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
      inProgress: boolean;
      start: IIndex;
      end: IIndex;
    }
);

export type TRangeAction =
  | { type: "setMax"; payload: { maxRowIndex: number; maxColIndex: number } }
  | {
      type: "startSelectRange";
      payload: { rowIndex: number; colIndex: number };
    }
  | { type: "moveSelectRange"; payload: { rowIndex: number; colIndex: number } }
  | { type: "endSelectRange" }
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

export interface IPoint {
  rowIndex: number;
  colIndex: number;
  xStart: number;
  xEnd: number;
  yStart: number;
  yEnd: number;
}

export type TRangeStateContext =
  | {
      isSelecting: false;
    }
  | {
      isSelecting: true;
      start: IPoint;
      end: IPoint;
      rangeBox: {
        top: number;
        left: number;
        width: number;
        height: number;
      };
    };

export type TRangeActionContext = {
  setMax: (payload: { maxRowIndex: number; maxColIndex: number }) => void;
  startSelectRange: (payload: { rowIndex: number; colIndex: number }) => void;
  moveSelectRange: (payload: { rowIndex: number; colIndex: number }) => void;
  endSelectRange: () => void;
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
