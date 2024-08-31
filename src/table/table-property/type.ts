import { Reducer } from "react";

export type TTablePropertyState = {
  maxDisplayRowCount: number;
  maxDisplayColCount: number;
};

type TTablePropertyAction =
  | { type: "setMaxDisplayRowCount"; payload: { maxDisplayRowCount: number } }
  | { type: "setMaxDisplayColCount"; payload: { maxDisplayColCount: number } };

export type TTablePropertyReducer = Reducer<
  TTablePropertyState,
  TTablePropertyAction
>;

export type TReturnTablePropertyReducer = {
  state: TTablePropertyState;
  setMaxDisplayRowCount: (maxDisplayRowCount: number) => void;
  setMaxDisplayColCount: (maxDisplayColCount: number) => void;
};

export type TTablePropertyStateContext = Pick<
  TReturnTablePropertyReducer,
  "state"
>;
export type TTablePropertyActionContext = Omit<
  TReturnTablePropertyReducer,
  "state"
>;
