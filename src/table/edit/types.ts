import { Reducer } from "react";

type TEditState = {
  isEditing: boolean;
};

type TEditAction =
  | { type: "startEditing" }
  // | { type: "focusAndEdit"; payload: { rowNumber: number; colNumber: number } }
  | { type: "endEditing" };

export type TEditReducer = Reducer<TEditState, TEditAction>;

export type TReturnEditReducer = {
  isEditing: boolean;
  startEditing: () => void;
  endEditing: () => void;
};
