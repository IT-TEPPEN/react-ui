import { Reducer } from "react";

type TFocusState =
  | {
      maxRowNumber: number;
      maxColNumber: number;
    } & (
      | { isFocus: false }
      | {
          isFocus: true;
          isEditing: boolean;
          rowNumber: number;
          colNumber: number;
        }
    );

type TFocusAction =
  | { type: "focus"; payload: { rowNumber: number; colNumber: number } }
  | { type: "edit" }
  | { type: "focusAndEdit"; payload: { rowNumber: number; colNumber: number } }
  | { type: "move"; payload: { rowNumber: number; colNumber: number } }
  | { type: "moveLeft" }
  | { type: "moveRight" }
  | { type: "moveUp" }
  | { type: "moveDown" }
  | { type: "unfocus" }
  | { type: "finishEditing" }
  | { type: "setMaxRowNumber"; payload: { maxRowNumber: number } }
  | { type: "setMaxColNumber"; payload: { maxColNumber: number } };

export type TFocusReducer = Reducer<TFocusState, TFocusAction>;

export type TReturnFocusReducer = {
  isFocus: boolean;
  isEditing: boolean;
  checkFocus: (rowNumber: number, colNumber: number) => boolean;
  focus: (rowNumber: number, colNumber: number) => void;
  edit: () => void;
  focusAndEdit: (rowNumber: number, colNumber: number) => void;
  move: (rowNumber: number, colNumber: number) => void;
  moveLeft: () => void;
  moveRight: () => void;
  moveUp: () => void;
  moveDown: () => void;
  unfocus: () => void;
  finishEditing: () => void;
  setMaxRowNumber: (maxRowNumber: number) => void;
  setMaxColNumber: (maxColNumber: number) => void;
};
