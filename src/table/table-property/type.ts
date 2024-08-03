import { Reducer } from "react";

type TTablePropertyState = {
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
  maxDisplayRowCount: number;
  maxDisplayColCount: number;
  setMaxDisplayRowCount: (maxDisplayRowCount: number) => void;
  setMaxDisplayColCount: (maxDisplayColCount: number) => void;
};

type TStateKeys = "maxDisplayRowCount" | "maxDisplayColCount";

export type TTablePropertyStateContext = Pick<
  TReturnTablePropertyReducer,
  TStateKeys
>;
export type TTablePropertyActionContext = Omit<
  TReturnTablePropertyReducer,
  TStateKeys
>;
