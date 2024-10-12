import { Reducer } from "react";

export type TFocusState =
  | { isFocus: false }
  | {
      isFocus: true;
      rowIndex: number;
      colIndex: number;
    };

type TFocusAction =
  | { type: "focus"; payload: { rowIndex: number; colIndex: number } }
  | { type: "unfocus" }
  | { type: "move"; payload: { rowIndex: number; colIndex: number } }
  | { type: "moveLeft" }
  | { type: "moveRight" }
  | { type: "moveUp" }
  | { type: "moveDown" };

export type TFocusReducer = Reducer<TFocusState, TFocusAction>;

export type TFocusStateContext = TFocusState;
export type TFocusActionContext = {
  focus: (rowIndex: number, colIndex: number) => void;
  unfocus: () => void;
  move: (rowIndex: number, colIndex: number) => void;
  moveLeft: () => void;
  moveRight: () => void;
  moveUp: () => void;
  moveDown: () => void;
};

export type TReturnFocusReducer = {
  state: TFocusState;
  actions: TFocusActionContext;
};
